import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/blockchain/auth-service';
import { createResponse, createErrorResponse } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return createErrorResponse('Session ID is required', 400);
    }

    // Validate session on blockchain
    const authService = AuthService.getInstance();
    await authService.initialize();
    
    const result = await authService.validateSession(sessionId);

    return createResponse(
      result,
      'Session validated successfully'
    );

  } catch (error: any) {
    console.error('Session verification error:', error);
    
    if (error.message?.includes('Invalid session') || 
        error.message?.includes('Session expired')) {
      return createErrorResponse('Invalid or expired session', 401);
    }
    
    return createErrorResponse(
      error.message || 'Session verification failed',
      500,
      error
    );
  }
}