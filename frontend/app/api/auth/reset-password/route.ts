import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { AuthService } from '@/lib/blockchain/auth-service';
import { createResponse, createErrorResponse } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, resetToken } = body;

    if (!email || !newPassword || !resetToken) {
      return createErrorResponse('Email, new password, and reset token are required', 400);
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Reset password on blockchain
    const authService = AuthService.getInstance();
    await authService.initialize();
    
    const result = await authService.resetPassword(
      email,
      newPasswordHash,
      resetToken
    );

    return createResponse(
      result,
      'Password reset successfully'
    );

  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('User not found', 404);
    }
    
    if (error.message?.includes('Invalid reset token')) {
      return createErrorResponse('Invalid or expired reset token', 400);
    }
    
    return createErrorResponse(
      error.message || 'Password reset failed',
      500,
      error
    );
  }
}