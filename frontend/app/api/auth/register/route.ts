import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { AuthService } from '@/lib/blockchain/auth-service';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { createResponse, createErrorResponse } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, phoneNumber, userType = 'tourist', kycData, entryPoint = 'online' } = body;

    // Validate required fields
    if (!email || !password || !phoneNumber) {
      return createErrorResponse('Email, password, and phone number are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Prepare KYC data
    const kycInfo = {
      documentType: kycData?.documentType || '',
      documentNumber: kycData?.documentNumber || '',
      firstName: kycData?.firstName || '',
      lastName: kycData?.lastName || '',
      dateOfBirth: kycData?.dateOfBirth || '',
      nationality: kycData?.nationality || '',
      address: kycData?.address || ''
    };

    // Register user on blockchain
    const authService = AuthService.getInstance();
    await authService.initialize();
    
    const result = await authService.registerUser(
      email,
      phoneNumber,
      passwordHash,
      userType,
      JSON.stringify(kycInfo)
    );

    // Start onboarding workflow
    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const onboardingResult = await onboardingService.startOnboarding(
      result.userId,
      'TOURIST_STANDARD',
      entryPoint,
      JSON.stringify({
        registrationSource: 'web',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      })
    );

    return createResponse(
      {
        userId: result.userId,
        email: result.email,
        status: result.status,
        onboarding: onboardingResult
      },
      'User registered successfully',
      201
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message?.includes('already exists')) {
      return createErrorResponse('User with this email already exists', 409);
    }
    
    return createErrorResponse(
      error.message || 'Registration failed',
      500,
      error
    );
  }
}