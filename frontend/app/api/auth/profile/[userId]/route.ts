import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/blockchain/auth-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check if user can access this profile (either own profile or admin)
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    // Get user from blockchain
    const authService = AuthService.getInstance();
    const result = await authService.getUser(userId);

    // Remove sensitive data
    const userData = JSON.parse(JSON.stringify(result));
    delete userData.passwordHash;

    return createResponse(
      userData,
      'Profile retrieved successfully'
    );

  } catch (error: any) {
    console.error('Get profile error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('User not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to get profile',
      500,
      error
    );
  }
});

export const PUT = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;
    const body = await request.json();

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check if user can update this profile (only own profile unless admin)
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    // Update user profile on blockchain
    const authService = AuthService.getInstance();
    const result = await authService.updateUserProfile(
      userId,
      JSON.stringify(body)
    );

    // Remove sensitive data
    const userData = JSON.parse(JSON.stringify(result));
    delete userData.passwordHash;

    return createResponse(
      userData,
      'Profile updated successfully'
    );

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('User not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Profile update failed',
      500,
      error
    );
  }
});