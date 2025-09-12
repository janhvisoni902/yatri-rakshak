import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '@/lib/blockchain/auth-service';
import { createResponse, createErrorResponse } from '@/lib/middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Hash password for comparison (Note: In production, you'd want to get the hash from blockchain first)
    const passwordHash = await bcrypt.hash(password, 12);

    // Authenticate user on blockchain
    const authService = AuthService.getInstance();
    await authService.initialize();
    
    const result = await authService.authenticateUser(email, passwordHash);

    if (!result.success) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.userId,
        email: result.email,
        userType: result.userType,
        sessionId: result.sessionId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return createResponse(
      {
        token,
        user: {
          userId: result.userId,
          email: result.email,
          userType: result.userType,
          status: result.status
        },
        sessionId: result.sessionId
      },
      'Login successful'
    );

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.message?.includes('Invalid credentials') || 
        error.message?.includes('Authentication failed')) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    if (error.message?.includes('Account is temporarily locked')) {
      return createErrorResponse('Account locked due to multiple failed attempts', 423);
    }
    
    return createErrorResponse(
      'Login failed. Please try again.',
      500,
      error
    );
  }
}