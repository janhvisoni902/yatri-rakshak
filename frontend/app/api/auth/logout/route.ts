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

    // Logout user on blockchain
    const authService = AuthService.getInstance();
    await authService.initialize();
    
    await authService.logout(sessionId);

    return createResponse(
      null,
      'Logged out successfully'
    );

  } catch (error: any) {
    console.error('Logout error:', error);
    
    if (error.message?.includes('Session not found')) {
      return createErrorResponse('Invalid session', 404);
    }
    
    return createErrorResponse(
      error.message || 'Logout failed',
      500,
      error
    );
  }
}