import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withOptionalAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withOptionalAuth(async (request, { params }) => {
  try {
    const { touristId } = params;

    if (!touristId) {
      return createErrorResponse('Tourist ID is required', 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.validateTouristIdentity(touristId);

    return createResponse(
      result,
      'Tourist identity validation completed'
    );

  } catch (error: any) {
    console.error('Validate tourist identity error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('Tourist identity not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to validate tourist identity',
      500,
      error
    );
  }
});