import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    // This endpoint requires admin/authority privileges
    if (request.user?.userType !== 'admin' && request.user?.userType !== 'authority') {
      return createErrorResponse('Admin or authority access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getOnboardingAnalytics(startDate, endDate);

    return createResponse(
      result,
      'Onboarding analytics retrieved successfully'
    );

  } catch (error: any) {
    console.error('Get onboarding analytics error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to get analytics',
      500,
      error
    );
  }
}, { requireAdmin: true });