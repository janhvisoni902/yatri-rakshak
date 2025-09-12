import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { onboardingId, stepId, stepData, completedBy } = body;

    if (!onboardingId || !stepId || !completedBy) {
      return createErrorResponse('Onboarding ID, step ID, and completed by are required', 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.completeStep(
      onboardingId,
      stepId,
      JSON.stringify(stepData || {}),
      completedBy
    );

    return createResponse(
      result,
      'Step completed successfully'
    );

  } catch (error: any) {
    console.error('Complete step error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('Onboarding not found', 404);
    }
    
    if (error.message?.includes('already completed')) {
      return createErrorResponse('Step is already completed', 409);
    }
    
    if (error.message?.includes('Cannot complete step')) {
      return createErrorResponse('Cannot complete this step at this time', 400);
    }
    
    return createErrorResponse(
      error.message || 'Failed to complete step',
      500,
      error
    );
  }
});