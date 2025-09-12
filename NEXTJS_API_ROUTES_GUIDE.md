# Next.js 15 App Router API Routes - Implementation Guide

## Overview

Successfully converted all backend Express routes to Next.js 15 App Router API routes format with full blockchain integration and middleware support.

## Directory Structure

```
frontend/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── verify-session/route.ts
│       │   ├── verify-email/route.ts
│       │   ├── verify-phone/route.ts
│       │   ├── profile/[userId]/route.ts
│       │   └── reset-password/route.ts
│       ├── onboarding/
│       │   ├── start/route.ts
│       │   ├── status/[userId]/route.ts
│       │   ├── complete-step/route.ts
│       │   ├── upload-kyc/[userId]/route.ts
│       │   ├── verify-kyc/route.ts
│       │   ├── analytics/route.ts
│       │   ├── by-status/[status]/route.ts
│       │   ├── by-entry-point/[entryPoint]/route.ts
│       │   └── workflows/route.ts
│       └── tourist-identity/
│           ├── [touristId]/route.ts
│           └── validate/[touristId]/route.ts
├── lib/
│   ├── blockchain/
│   │   ├── auth-service.ts
│   │   └── onboarding-service.ts
│   └── middleware/
│       └── auth.ts
├── components/
│   ├── auth/
│   ├── onboarding/
│   └── dashboard/
├── package.json
├── tsconfig.json
└── next.config.js
```

## Key Features

### **1. Next.js 15 App Router Standards**

All routes follow the new App Router conventions:
- `route.ts` files for API endpoints
- Named exports for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Dynamic routes with `[param]` syntax
- Proper TypeScript integration

### **2. Blockchain Service Integration**

#### **AuthService (`lib/blockchain/auth-service.ts`)**
```typescript
export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async registerUser(email: string, phoneNumber: string, passwordHash: string, userType: string, kycData: string)
  async authenticateUser(email: string, passwordHash: string)
  async validateSession(sessionId: string)
  // ... more methods
}
```

#### **OnboardingService (`lib/blockchain/onboarding-service.ts`)**
```typescript
export class OnboardingService {
  private static instance: OnboardingService;
  
  async startOnboarding(userId: string, workflowId: string, entryPoint: string, metadata: string)
  async completeStep(onboardingId: string, stepId: string, stepData: string, completedBy: string)
  async createTouristIdentity(touristId: string, kycData: string, itinerary: string, ...)
  // ... more methods
}
```

### **3. Advanced Middleware System**

#### **Authentication Middleware (`lib/middleware/auth.ts`)**
```typescript
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireAdmin?: boolean } = {}
)

export async function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
)

export function createResponse(data: any, message: string, status: number)
export function createErrorResponse(message: string, status: number, error?: any)
```

## API Endpoints

### **Authentication API Routes**

#### **POST /api/auth/register**
```typescript
// Register new tourist
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tourist@example.com',
    password: 'securepassword',
    phoneNumber: '+91-9876543210',
    userType: 'tourist',
    entryPoint: 'online',
    kycData: {
      documentType: 'aadhaar',
      documentNumber: 'XXXX-XXXX-XXXX',
      firstName: 'John',
      lastName: 'Doe',
      // ... more KYC fields
    }
  })
});
```

#### **POST /api/auth/login**
```typescript
// Login existing user
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tourist@example.com',
    password: 'securepassword'
  })
});

// Response includes JWT token and user data
const { token, user, sessionId } = response.data;
```

#### **POST /api/auth/verify-email**
```typescript
// Verify email with OTP
const response = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: 'USER_1234567890',
    verificationCode: '123456'
  })
});
```

#### **GET /api/auth/profile/[userId]**
```typescript
// Get user profile
const response = await fetch(`/api/auth/profile/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Onboarding API Routes**

#### **POST /api/onboarding/start**
```typescript
// Start onboarding process
const response = await fetch('/api/onboarding/start', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: 'USER_1234567890',
    workflowId: 'TOURIST_STANDARD',
    entryPoint: 'online',
    metadata: {
      registrationSource: 'web',
      ipAddress: '192.168.1.1'
    }
  })
});
```

#### **GET /api/onboarding/status/[userId]**
```typescript
// Get onboarding status
const response = await fetch(`/api/onboarding/status/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response includes current step, progress, and completion status
const { currentStep, completedSteps, status, estimatedCompletionTime } = response.data;
```

#### **POST /api/onboarding/upload-kyc/[userId]**
```typescript
// Upload KYC documents
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

#### **POST /api/onboarding/verify-kyc** (Admin Only)
```typescript
// Verify KYC documents (Admin/Authority only)
const response = await fetch('/api/onboarding/verify-kyc', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    userId: 'USER_1234567890',
    onboardingId: 'ONBOARD_1234567890',
    verification: 'approved', // 'approved', 'rejected', 'pending_review'
    verifiedBy: 'ADMIN_001',
    notes: 'All documents verified successfully'
  })
});
```

#### **GET /api/onboarding/analytics** (Admin Only)
```typescript
// Get onboarding analytics
const response = await fetch(`/api/onboarding/analytics?startDate=${startDate}&endDate=${endDate}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

// Response includes completion rates, bottlenecks, etc.
const { totalOnboardings, completionRate, averageCompletionTime } = response.data;
```

### **Tourist Identity API Routes**

#### **GET /api/tourist-identity/[touristId]**
```typescript
// Get tourist digital identity
const response = await fetch(`/api/tourist-identity/${touristId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response includes blockchain ID, QR code, safety score
const { touristId, safetyScore, riskLevel, qrCode, validTo } = response.data;
```

#### **GET /api/tourist-identity/validate/[touristId]**
```typescript
// Validate tourist identity (Public endpoint)
const response = await fetch(`/api/tourist-identity/validate/${touristId}`);

// Response includes validation status
const { valid, reason, safetyScore } = response.data;
```

## Security Features

### **1. JWT Authentication**
- Secure token-based authentication
- 24-hour token expiration
- Automatic session validation

### **2. Role-Based Access Control**
```typescript
// Middleware automatically checks user permissions
export const POST = withAuth(async (request) => {
  // Handler logic
}, { requireAdmin: true }); // Requires admin/authority access
```

### **3. Request Validation**
- Input sanitization
- File upload validation
- Parameter validation

### **4. Error Handling**
```typescript
// Standardized error responses
return createErrorResponse('Invalid credentials', 401);
return createResponse(data, 'Success message', 200);
```

## File Upload Handling

### **KYC Document Upload**
```typescript
// Automatic file processing
- File type validation (JPEG, PNG, PDF)
- File size limits (10MB)
- Secure filename generation
- Automatic directory creation
```

## Blockchain Integration

### **Connection Management**
```typescript
// Singleton pattern for service instances
const authService = AuthService.getInstance();
await authService.initialize();

// Automatic connection management
await this.ensureConnection();
```

### **Transaction Handling**
```typescript
// Submit transactions to blockchain
const result = await this.contract.submitTransaction(
  'functionName',
  param1,
  param2,
  JSON.stringify(complexData)
);

// Query blockchain data
const result = await this.contract.evaluateTransaction(
  'queryFunction',
  queryParam
);
```

## Environment Configuration

### **next.config.js**
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['fabric-network', 'fabric-ca-client']
  },
  webpack: (config, { isServer }) => {
    // Handle fabric-network packages
    if (isServer) {
      config.externals.push({
        'fabric-network': 'commonjs fabric-network',
        'fabric-ca-client': 'commonjs fabric-ca-client'
      });
    }
    return config;
  }
};
```

### **Environment Variables**
```env
JWT_SECRET=your-secret-key-change-in-production
BLOCKCHAIN_NETWORK_PATH=../network
NODE_ENV=development
```

## Usage Examples

### **Frontend Integration**
```typescript
// components/auth/RegisterForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (response.ok) {
    const data = await response.json();
    router.push('/onboarding/verification');
  }
};
```

### **Dashboard Data Fetching**
```typescript
// components/dashboard/TouristDashboard.tsx
useEffect(() => {
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/tourist-identity/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const identityData = await response.json();
      setTouristIdentity(identityData.data);
    }
  };
  
  fetchDashboardData();
}, []);
```

## Error Handling & Logging

### **Structured Error Responses**
```typescript
{
  "success": false,
  "message": "Invalid credentials",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": "Authentication failed" // Only in development
}
```

### **Success Responses**
```typescript
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "USER_1234567890",
    "email": "tourist@example.com",
    "status": "pending_verification"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Performance Optimizations

### **1. Connection Pooling**
- Singleton pattern for blockchain services
- Automatic connection management
- Connection reuse across requests

### **2. Efficient File Handling**
- Streaming file uploads
- Automatic cleanup
- Size validation

### **3. Caching Strategy**
- Service instance caching
- Connection caching
- Response optimization

This Next.js 15 implementation provides a robust, scalable, and secure API layer for the YatriRakshak tourist safety monitoring system with full blockchain integration.