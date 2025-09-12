import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    // This endpoint requires admin/authority privileges
    if (request.user?.userType !== 'admin' && request.user?.userType !== 'authority') {
      return createErrorResponse('Admin or authority access required', 403);
    }

    const { status } = params;

    if (!status) {
      return createErrorResponse('Status is required', 400);
    }

    const validStatuses = ['in_progress', 'completed', 'blocked', 'abandoned'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse('Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getOnboardingsByStatus(status);

    return createResponse(
      result,
      `Onboardings with status '${status}' retrieved successfully`
    );

  } catch (error: any) {
    console.error('Get onboardings by status error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to get onboardings',
      500,
      error
    );
  }
}, { requireAdmin: true });