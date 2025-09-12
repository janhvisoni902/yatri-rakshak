import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/blockchain/auth-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { userId, verificationCode } = body;

    if (!userId || !verificationCode) {
      return createErrorResponse('User ID and verification code are required', 400);
    }

    // Verify email on blockchain
    const authService = AuthService.getInstance();
    const result = await authService.verifyEmail(userId, verificationCode);

    return createResponse(
      result,
      'Email verified successfully'
    );

  } catch (error: any) {
    console.error('Email verification error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('User not found', 404);
    }
    
    if (error.message?.includes('Invalid verification code')) {
      return createErrorResponse('Invalid verification code', 400);
    }
    
    return createErrorResponse(
      error.message || 'Email verification failed',
      500,
      error
    );
  }
});