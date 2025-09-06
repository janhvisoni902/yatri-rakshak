import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DigitalID from '@/models/DigitalID';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      digitalId,
      status,
      verificationLevel,
      blockchainHash,
      digitalSignature
    } = body;

    // Validate required fields
    if (!digitalId || !status) {
      return NextResponse.json({ 
        error: 'Digital ID and status are required' 
      }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'verified', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 });
    }

    // Validate verification level
    if (verificationLevel && !['basic', 'enhanced', 'premium'].includes(verificationLevel)) {
      return NextResponse.json({ 
        error: 'Invalid verification level' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the digital ID
    const digitalID = await DigitalID.findById(digitalId);
    if (!digitalID) {
      return NextResponse.json({ 
        error: 'Digital ID not found' 
      }, { status: 404 });
    }

    // Check if user has permission to update (admin or authority roles)
    const user = await User.findById(session.user.id);
    if (!user || !['admin', 'higher_authority'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 });
    }

    // Update digital ID
    const updateData: any = {
      status,
      'metadata.lastUpdated': new Date()
    };

    if (verificationLevel) {
      updateData.verificationLevel = verificationLevel;
    }

    if (blockchainHash) {
      updateData.blockchainHash = blockchainHash;
    }

    if (digitalSignature) {
      updateData['securityFeatures.digitalSignature'] = digitalSignature;
    }

    if (status === 'verified') {
      updateData['metadata.verifiedAt'] = new Date();
      updateData['metadata.verifiedBy'] = session.user.id;
    }

    const updatedDigitalID = await DigitalID.findByIdAndUpdate(
      digitalId,
      updateData,
      { new: true }
    );

    // Add audit trail entry
    updatedDigitalID.addAuditEntry(
      `DIGITAL_ID_${status.toUpperCase()}`,
      session.user.id,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      `Digital ID status updated to ${status} by ${user.role}`
    );

    await updatedDigitalID.save();

    // Update user's verification status if digital ID is verified
    if (status === 'verified') {
      await User.findByIdAndUpdate(digitalID.userId, {
        verificationStatus: 'verified',
        'kycData.status': 'approved'
      });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(digitalID.userId, {
        verificationStatus: 'rejected',
        'kycData.status': 'rejected'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Digital ID ${status} successfully`,
      digitalId: {
        id: updatedDigitalID._id,
        status: updatedDigitalID.status,
        verificationLevel: updatedDigitalID.verificationLevel,
        verifiedAt: updatedDigitalID.metadata.verifiedAt
      }
    });

  } catch (error) {
    console.error('Digital ID update error:', error);
    return NextResponse.json(
      { error: 'Failed to update digital ID' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to revoke digital ID
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const digitalId = searchParams.get('id');

    if (!digitalId) {
      return NextResponse.json({ 
        error: 'Digital ID is required' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the digital ID
    const digitalID = await DigitalID.findById(digitalId);
    if (!digitalID) {
      return NextResponse.json({ 
        error: 'Digital ID not found' 
      }, { status: 404 });
    }

    // Check if user has permission to delete (admin only)
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 });
    }

    // Add audit trail entry before deletion
    digitalID.addAuditEntry(
      'DIGITAL_ID_REVOKED',
      session.user.id,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      'Digital ID revoked and deleted by admin'
    );

    await digitalID.save();

    // Delete the digital ID
    await DigitalID.findByIdAndDelete(digitalId);

    // Update user's verification status
    await User.findByIdAndUpdate(digitalID.userId, {
      verificationStatus: 'rejected',
      'kycData.status': 'rejected'
    });

    return NextResponse.json({
      success: true,
      message: 'Digital ID revoked successfully'
    });

  } catch (error) {
    console.error('Digital ID deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke digital ID' },
      { status: 500 }
    );
  }
}
