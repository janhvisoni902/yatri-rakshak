import { NextRequest, NextResponse } from 'next/server';
import { MinIOService } from '@/lib/storage/minio-service';
import { withAuth, createResponse, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { documentKey } = params;
    const { searchParams } = new URL(request.url);
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600'); // Default 1 hour

    if (!documentKey) {
      return createErrorResponse('Document key is required', 400);
    }

    // Validate expiration time (max 24 hours)
    if (expiresIn > 86400) {
      return createErrorResponse('Maximum expiration time is 24 hours (86400 seconds)', 400);
    }

    // Decode the document key
    const decodedKey = decodeURIComponent(documentKey);

    // Extract userId from document key for authorization
    const pathParts = decodedKey.split('/');
    if (pathParts.length < 2) {
      return createErrorResponse('Invalid document key format', 400);
    }

    const documentUserId = pathParts[1];

    // Check authorization
    if (request.user?.userId !== documentUserId && 
        request.user?.userType !== 'admin' && 
        request.user?.userType !== 'authority') {
      return createErrorResponse('Access denied', 403);
    }

    // Initialize MinIO service
    const minioConfig = MinIOService.getDefaultConfig();
    const minioService = MinIOService.getInstance(minioConfig);

    // Check MinIO connection
    const isHealthy = await minioService.healthCheck();
    if (!isHealthy) {
      return createErrorResponse('Document storage service is unavailable', 503);
    }

    try {
      // Get file metadata
      const metadata = await minioService.getFileMetadata(decodedKey);
      
      // Generate presigned URL
      const presignedUrl = await minioService.getFileUrl(decodedKey, expiresIn);

      return createResponse(
        {
          url: presignedUrl,
          expiresIn,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
          documentKey: decodedKey,
          metadata: {
            size: metadata.size,
            contentType: metadata.contentType,
            lastModified: metadata.lastModified
          }
        },
        'Presigned URL generated successfully'
      );

    } catch (fileError) {
      console.error('Presigned URL generation error:', fileError);
      
      if (fileError.message?.includes('NoSuchKey') || fileError.message?.includes('NotFound')) {
        return createErrorResponse('Document not found', 404);
      }
      
      return createErrorResponse('Failed to generate document URL', 500);
    }

  } catch (error: any) {
    console.error('Document URL generation error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to generate document URL',
      500,
      error
    );
  }
});