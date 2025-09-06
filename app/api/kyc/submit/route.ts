import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      dateOfBirth,
      nationality,
      phoneNumber,
      address,
      idType,
      idNumber,
      visitPurpose,
      visitDuration,
      accommodationDetails,
      emergencyContact,
      badgeNumber,
      department,
      jurisdiction,
      serviceYears,
      userId,
      userRole
    } = body;

    await connectDB();

    // Find the user and update their KYC information
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with KYC data
    const updateData: any = {
      name: fullName,
      verificationStatus: 'pending', // Set to pending for manual review
      kycData: {
        fullName,
        dateOfBirth,
        nationality,
        phoneNumber,
        address,
        idType,
        idNumber,
        submittedAt: new Date(),
        status: 'pending'
      }
    };

    // Add role-specific data
    if (userRole === 'police') {
      updateData.badgeNumber = badgeNumber;
      updateData.department = department;
      updateData.kycData.policeInfo = {
        badgeNumber,
        department,
        jurisdiction,
        serviceYears
      };
    }

    if (['tourist', 'public'].includes(userRole)) {
      updateData.kycData.travelInfo = {
        visitPurpose,
        visitDuration,
        accommodationDetails,
        emergencyContact
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    // For demo purposes, we'll auto-approve public users
    // In production, this would go through a manual verification process
    if (userRole === 'public') {
      await User.findByIdAndUpdate(userId, {
        verificationStatus: 'verified',
        'kycData.status': 'approved'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'KYC submitted successfully',
      verificationStatus: userRole === 'public' ? 'verified' : 'pending'
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit KYC' },
      { status: 500 }
    );
  }
}
