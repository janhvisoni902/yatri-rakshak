import { NextRequest, NextResponse } from 'next/server';
import { MinIOService } from '@/lib/storage/minio-service';
import { withAuth, createErrorResponse } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { documentKey } = params;

    if (!documentKey) {
      return createErrorResponse('Document key is required', 400);
    }

    // Decode the document key (in case it was URL encoded)
    const decodedKey = decodeURIComponent(documentKey);

    // Extract userId from document key for authorization
    // Key format: kyc-documents/{userId}/{documentType}-{timestamp}-{random}.{ext}
    const pathParts = decodedKey.split('/');
    if (pathParts.length < 2) {
      return createErrorResponse('Invalid document key format', 400);
    }

    const documentUserId = pathParts[1];

    // Check authorization - users can only access their own documents, admins can access all
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
      // Get file metadata first
      const metadata = await minioService.getFileMetadata(decodedKey);
      
      // Download the file
      const fileBuffer = await minioService.downloadFile(decodedKey);

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': metadata.contentType || 'application/octet-stream',
          'Content-Length': metadata.size?.toString() || fileBuffer.length.toString(),
          'Content-Disposition': `inline; filename="${pathParts[pathParts.length - 1]}"`,
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
          'X-Document-Key': decodedKey,
          'X-Document-Size': metadata.size?.toString() || fileBuffer.length.toString()
        }
      });

    } catch (fileError) {
      console.error('File download error:', fileError);
      
      if (fileError.message?.includes('NoSuchKey') || fileError.message?.includes('NotFound')) {
        return createErrorResponse('Document not found', 404);
      }
      
      return createErrorResponse('Failed to download document', 500);
    }

  } catch (error: any) {
    console.error('Document download error:', error);
    
    return createErrorResponse(
      error.message || 'Failed to process document download',
      500,
      error
    );
  }
});