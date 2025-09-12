import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/blockchain/onboarding-service';
import { MinIOService } from '@/lib/storage/minio-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const includeUrls = searchParams.get('includeUrls') === 'true';
    const urlExpiresIn = parseInt(searchParams.get('urlExpiresIn') || '3600');

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Check authorization
    if (request.user?.userId !== userId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    // Get onboarding data from blockchain to find uploaded documents
    const onboardingService = OnboardingService.getInstance();
    await onboardingService.initialize();
    
    let documentsData: any = {};
    try {
      const onboardingResult = await onboardingService.getOnboardingByUser(userId);
      
      // Find KYC upload step data
      const kycUploadStep = onboardingResult.completedSteps?.find(
        (step: any) => step.stepId === 'kyc_upload'
      );
      
      if (kycUploadStep && kycUploadStep.stepData && kycUploadStep.stepData.documents) {
        documentsData = kycUploadStep.stepData.documents;
      }
    } catch (onboardingError) {
      // If no onboarding found, return empty list
      return createResponse(
        {
          userId,
          documents: [],
          totalDocuments: 0
        },
        'No documents found for this user'
      );
    }

    if (Object.keys(documentsData).length === 0) {
      return createResponse(
        {
          userId,
          documents: [],
          totalDocuments: 0
        },
        'No documents uploaded yet'
      );
    }

    // Initialize MinIO service
    const minioConfig = MinIOService.getDefaultConfig();
    const minioService = MinIOService.getInstance(minioConfig);

    // Check MinIO connection
    const isHealthy = await minioService.healthCheck();
    if (!isHealthy) {
      return createErrorResponse('Document storage service is unavailable', 503);
    }

    // Process documents and optionally generate URLs
    const documents = [];
    
    for (const [documentType, docData] of Object.entries(documentsData)) {
      try {
        const documentInfo: any = {
          documentType,
          originalName: docData.originalName,
          filename: docData.filename,
          key: docData.key,
          size: docData.size,
          contentType: docData.contentType,
          uploadedAt: docData.uploadedAt
        };

        // Get current metadata from MinIO
        try {
          const metadata = await minioService.getFileMetadata(docData.key);
          documentInfo.currentSize = metadata.size;
          documentInfo.lastModified = metadata.lastModified;
          documentInfo.available = true;
        } catch (metadataError) {
          console.warn(`Document ${docData.key} not found in MinIO:`, metadataError);
          documentInfo.available = false;
          documentInfo.error = 'Document not found in storage';
        }

        // Generate presigned URL if requested and document is available
        if (includeUrls && documentInfo.available) {
          try {
            documentInfo.url = await minioService.getFileUrl(docData.key, urlExpiresIn);
            documentInfo.urlExpiresAt = new Date(Date.now() + urlExpiresIn * 1000).toISOString();
          } catch (urlError) {
            console.warn(`Failed to generate URL for ${docData.key}:`, urlError);
            documentInfo.urlError = 'Failed to generate access URL';
          }
        }

        documents.push(documentInfo);
      } catch (docError) {
        console.error(`Error processing document ${documentType}:`, docError);
        documents.push({
          documentType,
          error: `Failed to process document: ${docError.message}`,
          available: false
        });
      }
    }

    return createResponse(
      {
        userId,
        documents,
        totalDocuments: documents.length,
        availableDocuments: documents.filter(doc => doc.available).length,
        storage: {
          type: 'minio',
          bucket: minioConfig.bucketName,
          endpoint: minioConfig.endpoint
        },
        ...(includeUrls && { urlExpiresIn, generatedAt: new Date().toISOString() })
      },
      'Documents retrieved successfully'
    );

  } catch (error: any) {
    console.error('List documents error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to list documents',
      500,
      error
    );
  }
});