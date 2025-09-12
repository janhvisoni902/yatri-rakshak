import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getAllWorkflows();

    return createResponse(
      result,
      'Workflow templates retrieved successfully'
    );

  } catch (error: any) {
    console.error('Get workflows error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to get workflows',
      500,
      error
    );
  }
});