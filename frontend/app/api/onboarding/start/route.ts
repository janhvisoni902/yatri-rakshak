import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { userId, workflowId = 'TOURIST_STANDARD', entryPoint = 'online', metadata = {} } = body;

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check if user can start onboarding for this userId
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.startOnboarding(
      userId,
      workflowId,
      entryPoint,
      JSON.stringify({
        ...metadata,
        initiatedBy: request.user?.userId,
        initiatedAt: new Date().toISOString(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    );

    return createResponse(
      result,
      'Onboarding started successfully',
      201
    );

  } catch (error: any) {
    console.error('Start onboarding error:', error);
    
    if (error.message?.includes('already in progress')) {
      return createErrorResponse('Onboarding already in progress for this user', 409);
    }
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('Workflow not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to start onboarding',
      500,
      error
    );
  }
});