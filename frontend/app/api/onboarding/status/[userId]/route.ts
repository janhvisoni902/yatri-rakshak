import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check if user can access this onboarding status
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getOnboardingByUser(userId);

    return createResponse(
      result,
      'Onboarding status retrieved successfully'
    );

  } catch (error: any) {
    console.error('Get onboarding status error:', error);
    
    if (error.message?.includes('No onboarding found')) {
      return createErrorResponse('Onboarding not found for this user', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to get onboarding status',
      500,
      error
    );
  }
});