import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const demoUsers = [
  {
    name: 'Tourist Demo User',
    email: 'tourist@demo.com',
    password: 'demo123',
    role: 'public',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Tourist Demo User',
        dateOfBirth: '1990-01-01',
        nationality: 'Indian',
        address: 'Demo Address, Mumbai, Maharashtra'
      },
      identityDocument: {
        type: 'passport',
        number: 'DEMO123456',
        expiryDate: '2030-12-31'
      },
      travelInfo: {
        purposeOfVisit: 'tourism',
        duration: '7 days',
        accommodation: 'Hotel Demo Plaza'
      }
    }
  },
  {
    name: 'Police Officer Demo',
    email: 'police@demo.com',
    password: 'demo123',
    role: 'police_officer',
    badgeNumber: 'PD001',
    department: 'Mumbai Police',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Police Officer Demo',
        dateOfBirth: '1985-05-15',
        nationality: 'Indian',
        address: 'Police Quarters, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'POLICE001',
        expiryDate: '2030-12-31'
      },
      policeInfo: {
        rank: 'Inspector',
        station: 'Colaba Police Station',
        yearsOfService: '10'
      }
    }
  },
  {
    name: 'Tourism Authority Demo',
    email: 'authority@demo.com',
    password: 'demo123',
    role: 'tourism_department',
    department: 'Maharashtra Tourism',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Tourism Authority Demo',
        dateOfBirth: '1980-03-20',
        nationality: 'Indian',
        address: 'Tourism Office, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'TOUR001',
        expiryDate: '2030-12-31'
      }
    }
  },
  {
    name: 'Admin Demo User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'higher_authority',
    department: 'System Administration',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Admin Demo User',
        dateOfBirth: '1975-08-10',
        nationality: 'Indian',
        address: 'Admin Office, Mumbai'
      },
      identityDocument: {
        type: 'government_id',
        number: 'ADMIN001',
        expiryDate: '2030-12-31'
      }
    }
  },
  {
    name: 'Local Citizen Demo',
    email: 'citizen@demo.com',
    password: 'demo123',
    role: 'local_citizen',
    verificationStatus: 'verified',
    kycData: {
      personalInfo: {
        fullName: 'Local Citizen Demo',
        dateOfBirth: '1992-12-05',
        nationality: 'Indian',
        address: 'Resident Address, Mumbai'
      },
      identityDocument: {
        type: 'aadhaar',
        number: 'CITIZEN001',
        expiryDate: '2030-12-31'
      }
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing demo users
    const demoEmails = demoUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: demoEmails } });

    // Create new demo users
    const createdUsers = [];
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();
      createdUsers.push({
        email: user.email,
        role: user.role,
        name: user.name
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users created successfully',
      users: createdUsers
    });

  } catch (error) {
    console.error('Error seeding demo users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed demo users' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    demoUsers: demoUsers.map(user => ({
      email: user.email,
      role: user.role,
      name: user.name,
      password: 'demo123'
    }))
  });
}
