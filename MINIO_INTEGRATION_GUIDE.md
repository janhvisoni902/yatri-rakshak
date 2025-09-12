# MinIO Storage Integration Guide

## Overview

Successfully integrated MinIO object storage using AWS SDK for document storage instead of local file system. All KYC documents and tourist-related files are now stored in your MinIO instance with secure access control.

## 🏗️ Architecture

### **Storage Flow:**
```
Upload Request → Next.js API → MinIO Service → MinIO Instance → Blockchain Metadata
     ↓              ↓            ↓             ↓                ↓
  FormData    →  Buffer    →  S3 Client  →  Object Store  →  Document Reference
```

### **File Organization in MinIO:**
```
yatrirakshak-documents/           # Bucket
├── kyc-documents/
│   ├── {userId}/
│   │   ├── identityDocument-{timestamp}-{random}.pdf
│   │   ├── addressProof-{timestamp}-{random}.jpg
│   │   └── photo-{timestamp}-{random}.png
│   └── {anotherUserId}/
│       └── ...
└── profile-photos/
    ├── {userId}/
    │   └── profile-{timestamp}-{random}.jpg
    └── ...
```

## 📁 New Files Created

### **1. MinIO Service (`lib/storage/minio-service.ts`)**
```typescript
export class MinIOService {
  // Singleton pattern with connection management
  public static getInstance(config?: MinIOConfig): MinIOService
  
  // Core operations
  async uploadFile(file: Buffer, key: string, contentType: string): Promise<UploadResult>
  async downloadFile(key: string): Promise<Buffer>
  async getFileUrl(key: string, expiresIn: number): Promise<string>
  async deleteFile(key: string): Promise<void>
  
  // KYC specific operations
  async uploadKYCDocuments(userId: string, files: FileData): Promise<FileMetadata>
  async getDocumentUrls(documentKeys: string[]): Promise<{ [key: string]: string }>
  
  // Utility operations
  async healthCheck(): Promise<boolean>
  generateFileKey(userId: string, documentType: string, originalFilename: string): string
}
```

### **2. Updated Upload API (`app/api/onboarding/upload-kyc/[userId]/route.ts`)**
- **MinIO Integration:** Files uploaded directly to MinIO instance
- **Buffer Processing:** Files converted to Buffer before upload
- **Health Checks:** Validates MinIO connection before upload
- **Blockchain Metadata:** Document metadata stored on blockchain

### **3. Document Access APIs:**

#### **Direct Download (`app/api/documents/download/[documentKey]/route.ts`)**
```typescript
GET /api/documents/download/{documentKey}
// Returns file content directly with proper headers
```

#### **Presigned URLs (`app/api/documents/url/[documentKey]/route.ts`)**
```typescript
GET /api/documents/url/{documentKey}?expiresIn=3600
// Returns temporary access URL for MinIO document
```

#### **Document Listing (`app/api/documents/list/[userId]/route.ts`)**
```typescript
GET /api/documents/list/{userId}?includeUrls=true&urlExpiresIn=3600
// Lists all documents for a user with optional presigned URLs
```

## 🔧 Configuration

### **Environment Variables (`.env.example`)**
```env
# MinIO Configuration
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=yatrirakshak-documents

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,application/pdf
PRESIGNED_URL_EXPIRES_IN=3600  # 1 hour
```

### **MinIO Default Configuration:**
```typescript
const defaultConfig = {
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  bucketName: 'yatrirakshak-documents',
  forcePathStyle: true  // Required for MinIO
};
```

## 📤 Upload Process

### **1. Frontend Upload:**
```typescript
// From your registration form
const formData = new FormData();
formData.append('identityDocument', identityFile);
formData.append('addressProof', addressFile);
formData.append('photo', photoFile);

const response = await fetch(`/api/onboarding/upload-kyc/${userId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **2. Server Processing:**
```typescript
// Files are processed and uploaded to MinIO
const uploadedDocuments = await minioService.uploadKYCDocuments(userId, files);

// Metadata stored on blockchain
await onboardingService.completeStep(onboardingId, 'kyc_upload', 
  JSON.stringify({
    documents: uploadedDocuments,
    storageType: 'minio',
    storageLocation: minioConfig.endpoint,
    bucketName: minioConfig.bucketName
  })
);
```

### **3. Document Storage Structure:**
```typescript
// Each uploaded document gets this metadata
{
  originalName: "aadhaar_card.pdf",
  filename: "identityDocument-1704067200000-abc123.pdf",
  key: "kyc-documents/USER_123/identityDocument-1704067200000-abc123.pdf",
  bucket: "yatrirakshak-documents",
  size: 1048576,
  contentType: "application/pdf",
  uploadedAt: "2024-01-01T12:00:00.000Z",
  url: "https://minio.example.com/..."  // Presigned URL
}
```

## 🔍 Document Retrieval

### **1. List User Documents:**
```typescript
// Get all documents for a user
const response = await fetch(`/api/documents/list/${userId}?includeUrls=true`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { documents } = await response.json();
// documents array contains metadata and presigned URLs
```

### **2. Generate Access URL:**
```typescript
// Get temporary access URL (1 hour expiry)
const response = await fetch(`/api/documents/url/${documentKey}?expiresIn=3600`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { url } = await response.json();
// Use this URL to access the document directly
```

### **3. Direct Download:**
```typescript
// Download file content directly
const response = await fetch(`/api/documents/download/${documentKey}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
// File content ready for display or download
```

## 🔒 Security Features

### **1. Access Control:**
- **User Documents:** Users can only access their own documents
- **Admin Access:** Admins/authorities can access all documents
- **JWT Authentication:** All requests require valid JWT token

### **2. Presigned URLs:**
- **Time-limited:** URLs expire after specified duration (default 1 hour)
- **Secure Access:** No need to expose MinIO credentials to frontend
- **Direct Access:** Users can access files directly from MinIO

### **3. File Validation:**
- **Type Validation:** Only JPEG, PNG, PDF allowed
- **Size Limits:** 10MB maximum per file
- **Content Verification:** Files validated before upload

## 🚀 Usage Examples

### **Upload KYC Documents:**
```typescript
// Frontend component
const handleFileUpload = async (files: FileList) => {
  const formData = new FormData();
  formData.append('identityDocument', files[0]);
  formData.append('addressProof', files[1]);
  formData.append('photo', files[2]);

  try {
    const response = await fetch(`/api/onboarding/upload-kyc/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const result = await response.json();
    console.log('Upload successful:', result.data.uploadedDocuments);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **Display Documents in Dashboard:**
```typescript
// Tourist Dashboard component
const [documents, setDocuments] = useState([]);

useEffect(() => {
  const fetchDocuments = async () => {
    const response = await fetch(`/api/documents/list/${userId}?includeUrls=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    setDocuments(data.data.documents);
  };
  
  fetchDocuments();
}, [userId]);

// Render documents with preview
{documents.map(doc => (
  <div key={doc.documentType}>
    <h3>{doc.documentType}</h3>
    <p>Size: {doc.size} bytes</p>
    <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
    {doc.url && (
      <a href={doc.url} target="_blank" rel="noopener noreferrer">
        View Document
      </a>
    )}
  </div>
))}
```

### **Admin Document Review:**
```typescript
// Admin component for KYC verification
const reviewDocuments = async (userId: string) => {
  const response = await fetch(`/api/documents/list/${userId}?includeUrls=true&urlExpiresIn=7200`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const { documents } = await response.json();
  
  // Display documents for review
  documents.forEach(doc => {
    if (doc.available) {
      // Show document preview
      const iframe = document.createElement('iframe');
      iframe.src = doc.url;
      document.body.appendChild(iframe);
    }
  });
};
```

## ⚡ Performance Features

### **1. Connection Management:**
- **Singleton Pattern:** Single MinIO client instance
- **Connection Pooling:** Reuses connections across requests
- **Health Checks:** Validates connection before operations

### **2. Efficient File Handling:**
- **Stream Processing:** Files processed as streams
- **Buffer Management:** Optimal memory usage
- **Concurrent Uploads:** Multiple files uploaded in parallel

### **3. Caching Strategy:**
- **Presigned URL Caching:** URLs cached on client side
- **Metadata Caching:** File metadata cached for quick access
- **Connection Caching:** MinIO connections reused

## 🔄 Migration from Local Storage

### **Before (Local Storage):**
```
frontend/public/uploads/kyc-documents/
├── identityDocument-*.pdf
├── addressProof-*.jpg
└── photo-*.png
```

### **After (MinIO Storage):**
```
MinIO Bucket: yatrirakshak-documents
├── kyc-documents/
│   └── {userId}/
│       ├── identityDocument-*.pdf
│       ├── addressProof-*.jpg
│       └── photo-*.png
```

### **Benefits of Migration:**
1. **Scalability:** Handle unlimited file storage
2. **Reliability:** Built-in redundancy and backup
3. **Security:** Advanced access control and encryption
4. **Performance:** Distributed storage with CDN capabilities
5. **Cost-Effective:** Pay for storage used, not provisioned
6. **Integration:** Compatible with AWS S3 ecosystem

## 🛠️ Setup Instructions

### **1. Install Dependencies:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### **2. Configure Environment:**
```bash
cp .env.example .env
# Update MinIO configuration in .env file
```

### **3. Ensure MinIO is Running:**
```bash
# Your existing MinIO instance should be accessible at:
# http://localhost:9000 (or your configured endpoint)
```

### **4. Create Bucket (if not exists):**
The application will use the bucket specified in `MINIO_BUCKET_NAME`. Make sure this bucket exists in your MinIO instance.

## 📈 Monitoring & Troubleshooting

### **Health Check Endpoint:**
```typescript
// Built-in health check
const isHealthy = await minioService.healthCheck();
console.log('MinIO Status:', isHealthy ? 'Connected' : 'Disconnected');
```

### **Error Handling:**
- **Connection Errors:** Graceful fallback with detailed error messages
- **Upload Failures:** Retry mechanism with exponential backoff
- **Access Denied:** Clear authorization error messages
- **File Not Found:** Proper 404 responses with helpful messages

Your documents are now securely stored in MinIO with full access control, presigned URL generation, and blockchain metadata tracking!
