import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { AuthService } from '@/lib/blockchain/auth-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const POST = withAuth(async (request) => {
  try {
    // This endpoint requires admin/authority privileges
    if (request.user?.userType !== 'admin' && request.user?.userType !== 'authority') {
      return createErrorResponse('Admin or authority access required', 403);
    }

    const body = await request.json();
    const { userId, onboardingId, verification, verifiedBy, notes } = body;

    if (!userId || !onboardingId || !verification || !verifiedBy) {
      return createErrorResponse('User ID, onboarding ID, verification status, and verifier are required', 400);
    }

    if (!['approved', 'rejected', 'pending_review'].includes(verification)) {
      return createErrorResponse('Invalid verification status. Must be approved, rejected, or pending_review', 400);
    }

    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();

    // Complete KYC verification step
    const stepResult = await onboardingService.completeStep(
      onboardingId,
      'kyc_verification',
      JSON.stringify({
        verificationStatus: verification,
        verifiedBy,
        verificationDate: new Date().toISOString(),
        notes: notes || '',
        kycScore: verification === 'approved' ? 100 : 0
      }),
      verifiedBy
    );

    // If KYC is approved, proceed with tourist identity creation
    if (verification === 'approved') {
      try {
        // Get user details from authentication service
        const authService = AuthService.getInstance();
        await authService.initialize();
        const userData = await authService.getUser(userId);

        // Create default tourist identity data
        const kycData = {
          documentType: 'aadhaar', // This should come from the uploaded KYC data
          documentNumber: 'XXXX-XXXX-XXXX', // This should come from the uploaded KYC data
          name: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.email,
          nationality: userData.nationality || 'Indian'
        };

        const itinerary = {
          destinations: ['Guwahati', 'Kaziranga'], // This should come from user's travel plan
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
          accommodation: ['Hotel XYZ'] // This should come from user's booking details
        };

        const emergencyContacts = [
          {
            name: 'Emergency Contact',
            phone: userData.phoneNumber,
            relationship: 'self'
          }
        ];

        // Create tourist identity on blockchain
        const identityResult = await onboardingService.createTouristIdentity(
          userId,
          JSON.stringify(kycData),
          JSON.stringify(itinerary),
          JSON.stringify(emergencyContacts),
          new Date().toISOString(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days validity
        );

        // Complete blockchain ID generation step
        await onboardingService.completeStep(
          onboardingId,
          'blockchain_id_generation',
          JSON.stringify({
            touristId: userId,
            blockchainId: identityResult.touristId,
            generatedAt: new Date().toISOString(),
            qrCode: `QR_${userId}`,
            validUntil: identityResult.validTo
          }),
          'system'
        );

        // Update user KYC status in auth system
        await authService.updateKYCStatus(
          userId,
          'verified',
          verifiedBy,
          JSON.stringify([])
        );

        return createResponse(
          {
            onboarding: stepResult,
            touristIdentity: identityResult,
            kycStatus: 'verified'
          },
          'KYC verification completed and tourist identity created successfully'
        );

      } catch (identityError) {
        console.error('Tourist identity creation error:', identityError);
        // Continue with onboarding even if identity creation fails partially
        return createResponse(
          stepResult,
          'KYC verification completed successfully, but tourist identity creation encountered issues'
        );
      }
    } else {
      // Update user KYC status for rejected/pending cases
      const authService = AuthService.getInstance();
      await authService.initialize();
      await authService.updateKYCStatus(
        userId,
        verification === 'rejected' ? 'rejected' : 'pending',
        verifiedBy,
        JSON.stringify([])
      );

      return createResponse(
        stepResult,
        `KYC verification ${verification === 'rejected' ? 'rejected' : 'set to pending review'}`
      );
    }

  } catch (error: any) {
    console.error('KYC verification error:', error);
    
    if (error.message?.includes('does not exist')) {
      return createErrorResponse('Onboarding or user not found', 404);
    }
    
    return createErrorResponse(
      error.message || 'Failed to verify KYC',
      500,
      error
    );
  }
}, { requireAdmin: true });