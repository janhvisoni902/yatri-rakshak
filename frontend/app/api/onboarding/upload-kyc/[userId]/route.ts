import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { MinIOService } from '@/lib/storage/minio-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const POST = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check if user can upload KYC for this userId
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    const formData = await request.formData();
    const files: { [fieldName: string]: { buffer: Buffer; originalName: string; mimetype: string } } = {};

    // Process uploaded files from form data
    for (const [fieldName, file] of formData.entries()) {
      if (file instanceof File) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          return createErrorResponse(
            `Invalid file type for ${fieldName}. Only JPEG, PNG, and PDF files are allowed.`, 
            400
          );
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return createErrorResponse(
            `File ${fieldName} is too large. Maximum size is 10MB.`, 
            400
          );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        files[fieldName] = {
          buffer: buffer,
          originalName: file.name,
          mimetype: file.type
        };
      }
    }

    if (Object.keys(files).length === 0) {
      return createErrorResponse('At least one document is required', 400);
    }

    // Initialize MinIO service
    const minioConfig = MinIOService.getDefaultConfig();
    const minioService = MinIOService.getInstance(minioConfig);

    // Check MinIO connection
    const isHealthy = await minioService.healthCheck();
    if (!isHealthy) {
      return createErrorResponse('Document storage service is unavailable', 503);
    }

    // Upload files to MinIO
    let uploadedDocuments: any;
    try {
      uploadedDocuments = await minioService.uploadKYCDocuments(userId, files);
    } catch (uploadError) {
      console.error('MinIO upload error:', uploadError);
      return createErrorResponse('Failed to upload documents to storage', 500);
    }

    // Get current onboarding from blockchain
    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    const onboardingResult = await onboardingService.getOnboardingByUser(userId);

    // Complete KYC upload step on blockchain
    const stepResult = await onboardingService.completeStep(
      onboardingResult.onboardingId,
      'kyc_upload',
      JSON.stringify({
        documents: uploadedDocuments,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        storageType: 'minio',
        storageLocation: minioConfig.endpoint,
        bucketName: minioConfig.bucketName
      }),
      userId
    );

    return createResponse(
      {
        onboarding: stepResult,
        uploadedDocuments,
        storage: {
          type: 'minio',
          bucket: minioConfig.bucketName,
          endpoint: minioConfig.endpoint
        }
      },
      'KYC documents uploaded successfully to MinIO storage'
    );

  } catch (error: any) {
    console.error('KYC upload error:', error);
    
    if (error.message?.includes('No onboarding found')) {
      return createErrorResponse('Onboarding not found for this user', 404);
    }

    if (error.message?.includes('storage service')) {
      return createErrorResponse('Document storage service error', 503);
    }
    
    return createErrorResponse(
      error.message || 'Failed to upload KYC documents',
      500,
      error
    );
  }
});