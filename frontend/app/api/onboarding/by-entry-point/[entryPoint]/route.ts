import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    // This endpoint requires admin/authority privileges
    if (request.user?.userType !== 'admin' && request.user?.userType !== 'authority') {
      return createErrorResponse('Admin or authority access required', 403);
    }

    const { entryPoint } = params;

    if (!entryPoint) {
      return createErrorResponse('Entry point is required', 400);
    }

    const validEntryPoints = ['airport', 'hotel', 'border', 'online'];
    if (!validEntryPoints.includes(entryPoint)) {
      return createErrorResponse('Invalid entry point. Must be one of: ' + validEntryPoints.join(', '), 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getOnboardingsByEntryPoint(entryPoint);

    return createResponse(
      result,
      `Onboardings for entry point '${entryPoint}' retrieved successfully`
    );

  } catch (error: any) {
    console.error('Get onboardings by entry point error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to get onboardings',
      500,
      error
    );
  }
}, { requireAdmin: true });