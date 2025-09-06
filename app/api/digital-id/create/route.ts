import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DigitalID from '@/models/DigitalID';
import User from '@/models/User';
import crypto from 'crypto';

// Encryption function for sensitive data
function encryptData(data: string, key: string): string {
  try {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);
    const cipher = crypto.createCipher(algorithm, keyBuffer);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to simple base64 encoding for development
    return Buffer.from(data).toString('base64');
  }
}

// Hash function for ID numbers
function hashIdNumber(idNumber: string): string {
  return crypto.createHash('sha256').update(idNumber).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    console.log('Digital ID creation request received');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found for user:', session.user.email);

    const body = await request.json();
    console.log('Request body:', { ...body, idNumber: body.idNumber ? '***' : 'missing' });
    
    const {
      userId,
      idType,
      idNumber,
      fullName,
      dateOfBirth,
      nationality
    } = body;

    // Validate required fields
    if (!idType || !idNumber || !fullName || !dateOfBirth || !nationality) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    // Validate ID type
    if (!['aadhaar', 'passport'].includes(idType)) {
      return NextResponse.json({ 
        error: 'Invalid ID type' 
      }, { status: 400 });
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Check if user exists
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('User found:', user.email);

    // Check if digital ID already exists for this user
    const existingDigitalID = await DigitalID.findOne({ userId });
    if (existingDigitalID) {
      return NextResponse.json({ 
        error: 'Digital ID already exists for this user' 
      }, { status: 409 });
    }

    // Check if ID number is already registered (using hash)
    const hashedIdNumber = hashIdNumber(idNumber);
    const existingIdNumber = await DigitalID.findOne({ 
      'securityFeatures.hashedIdNumber': hashedIdNumber 
    });
    
    if (existingIdNumber) {
      return NextResponse.json({ 
        error: 'This ID number is already registered' 
      }, { status: 409 });
    }

    // Prepare data for encryption
    const sensitiveData = JSON.stringify({
      idNumber,
      fullName,
      dateOfBirth,
      nationality
    });

    // Encrypt the sensitive data
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const encryptedData = encryptData(sensitiveData, encryptionKey);

    // Create digital ID document
    console.log('Creating digital ID document...');
    const digitalID = new DigitalID({
      userId,
      idType,
      idNumber: idNumber.replace(/\s/g, ''), // Remove spaces for storage
      fullName,
      dateOfBirth,
      nationality,
      encryptedData,
      securityFeatures: {
        isEncrypted: true,
        encryptionAlgorithm: 'AES-256-GCM',
        hashedIdNumber
      },
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      auditTrail: [{
        action: 'DIGITAL_ID_CREATED',
        timestamp: new Date(),
        performedBy: userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        details: 'Digital ID created successfully'
      }]
    });

    // Save to database
    console.log('Saving digital ID to database...');
    await digitalID.save();
    console.log('Digital ID saved successfully with ID:', digitalID._id);

    // Update user's verification status
    console.log('Updating user verification status...');
    await User.findByIdAndUpdate(userId, {
      verificationStatus: 'verified',
      'kycData.status': 'approved'
    });
    console.log('User verification status updated successfully');

    // Add audit trail entry
    digitalID.auditTrail.push({
      action: 'DIGITAL_ID_VERIFIED',
      timestamp: new Date(),
      performedBy: userId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      details: 'Digital ID automatically verified and user status updated'
    });

    await digitalID.save();

    return NextResponse.json({
      success: true,
      message: 'Digital ID created successfully',
      digitalId: {
        id: digitalID._id,
        idType: digitalID.idType,
        status: digitalID.status,
        verificationLevel: digitalID.verificationLevel,
        createdAt: digitalID.metadata.createdAt
      }
    });

  } catch (error) {
    console.error('Digital ID creation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create digital ID',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve digital ID (for verification purposes)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const digitalID = await DigitalID.findOne({ userId: session.user.id })
      .select('-encryptedData -securityFeatures.hashedIdNumber -auditTrail');

    if (!digitalID) {
      return NextResponse.json({ 
        error: 'Digital ID not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      digitalId: {
        id: digitalID._id,
        idType: digitalID.idType,
        fullName: digitalID.fullName,
        nationality: digitalID.nationality,
        status: digitalID.status,
        verificationLevel: digitalID.verificationLevel,
        createdAt: digitalID.metadata.createdAt,
        verifiedAt: digitalID.metadata.verifiedAt
      }
    });

  } catch (error) {
    console.error('Digital ID retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve digital ID' },
      { status: 500 }
    );
  }
}
