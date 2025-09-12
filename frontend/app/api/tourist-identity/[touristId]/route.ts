import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { touristId } = params;

    if (!touristId) {
      return createErrorResponse('Tourist ID is required', 400);
    }

    // Check if user can access this tourist identity
    if (request.user?.userId !== touristId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.getTouristIdentity(touristId);

    return createResponse(
      result,
      'Tourist identity retrieved successfully'
    );

  } catch (error: any) {
    console.error('Get tourist identity error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('Tourist identity not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to get tourist identity',
      500,
      error
    );
  }
});

export const POST = withAuth(async (request, { params }) => {
  try {
    // This endpoint requires admin/authority privileges for manual identity creation
    if (request.user?.userType !== 'admin' && request.user?.userType !== 'authority') {
      return createErrorResponse('Admin or authority access required', 403);
    }

    const { touristId } = params;
    const body = await request.json();
    const { kycData, itinerary, emergencyContacts, validFrom, validTo } = body;

    if (!touristId || !kycData || !itinerary || !emergencyContacts || !validFrom || !validTo) {
      return createErrorResponse('Tourist ID, KYC data, itinerary, emergency contacts, valid from, and valid to are required', 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const result = await onboardingService.createTouristIdentity(
      touristId,
      JSON.stringify(kycData),
      JSON.stringify(itinerary),
      JSON.stringify(emergencyContacts),
      validFrom,
      validTo
    );

    return createResponse(
      result,
      'Tourist identity created successfully',
      201
    );

  } catch (error: any) {
    console.error('Create tourist identity error:', error);
    
    if (error.message?.includes('already exists')) {
      return createErrorResponse('Tourist identity already exists', 409);
    }
    
    return createErrorResponse(
      error.message || 'Failed to create tourist identity',
      500,
      error
    );
  }
}, { requireAdmin: true });