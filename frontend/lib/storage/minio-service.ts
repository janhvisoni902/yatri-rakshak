import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface MinIOConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  forcePathStyle: boolean;
}

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface FileMetadata {
  originalName: string;
  filename: string;
  key: string;
  bucket: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  url: string;
}

export class MinIOService {
  private s3Client: S3Client;
  private bucketName: string;
  private static instance: MinIOService;

  private constructor(config: MinIOConfig) {
    this.bucketName = config.bucketName;
    
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle, // Required for MinIO
    });
  }

  public static getInstance(config?: MinIOConfig): MinIOService {
    if (!MinIOService.instance) {
      if (!config) {
        throw new Error('MinIOService must be initialized with config first');
      }
      MinIOService.instance = new MinIOService(config);
    }
    return MinIOService.instance;
  }

  public static getDefaultConfig(): MinIOConfig {
    return {
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: process.env.MINIO_REGION || 'us-east-1',
      accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucketName: process.env.MINIO_BUCKET_NAME || 'yatrirakshak-documents',
      forcePathStyle: true
    };
  }

  /**
   * Upload a file to MinIO
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    key: string,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString()
        }
      });

      await this.s3Client.send(command);

      const url = await this.getFileUrl(key);

      return {
        key,
        bucket: this.bucketName,
        url,
        size: file.length,
        contentType,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error(`Failed to generate file URL: ${error}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Download file content
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No file content received');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading file from MinIO:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Delete a file from MinIO
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Generate a unique file key for upload
   */
  generateFileKey(
    userId: string,
    documentType: string,
    originalFilename: string,
    prefix: string = 'kyc-documents'
  ): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const extension = originalFilename.split('.').pop();
    
    return `${prefix}/${userId}/${documentType}-${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Process multiple file uploads for KYC
   */
  async uploadKYCDocuments(
    userId: string,
    files: { [fieldName: string]: { buffer: Buffer; originalName: string; mimetype: string } }
  ): Promise<{ [fieldName: string]: FileMetadata }> {
    const uploadResults: { [fieldName: string]: FileMetadata } = {};

    for (const [fieldName, fileData] of Object.entries(files)) {
      try {
        const key = this.generateFileKey(userId, fieldName, fileData.originalName);
        
        const uploadResult = await this.uploadFile(
          fileData.buffer,
          key,
          fileData.mimetype,
          {
            userId,
            documentType: fieldName,
            originalName: fileData.originalName,
            uploadedBy: userId
          }
        );

        uploadResults[fieldName] = {
          originalName: fileData.originalName,
          filename: key.split('/').pop() || key,
          key: uploadResult.key,
          bucket: uploadResult.bucket,
          size: uploadResult.size,
          contentType: uploadResult.contentType,
          uploadedAt: uploadResult.uploadedAt,
          url: uploadResult.url
        };
      } catch (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        throw new Error(`Failed to upload ${fieldName}: ${error}`);
      }
    }

    return uploadResults;
  }

  /**
   * Get download URLs for multiple documents
   */
  async getDocumentUrls(
    documentKeys: string[],
    expiresIn: number = 3600
  ): Promise<{ [key: string]: string }> {
    const urls: { [key: string]: string } = {};

    for (const key of documentKeys) {
      try {
        urls[key] = await this.getFileUrl(key, expiresIn);
      } catch (error) {
        console.error(`Error getting URL for ${key}:`, error);
        urls[key] = '';
      }
    }

    return urls;
  }

  /**
   * Check if MinIO service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to list objects in bucket (which also checks connection)
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: 'health-check-dummy-key'
      });

      // This will fail if bucket doesn't exist or connection is bad
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      // If it's just that the key doesn't exist, that's fine - connection works
      if (error.name === 'NotFound') {
        return true;
      }
      console.error('MinIO health check failed:', error);
      return false;
    }
  }
}

export default MinIOService;