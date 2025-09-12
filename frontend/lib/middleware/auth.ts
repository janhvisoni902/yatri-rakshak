import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthService } from '../blockchain/auth-service';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: string;
  sessionId: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireAdmin?: boolean } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Authorization token required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verify JWT token
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }

      // Validate session on blockchain
      const authService = AuthService.getInstance();
      try {
        const sessionData = await authService.validateSession(decoded.sessionId);
        if (!sessionData.valid) {
          return NextResponse.json(
            { success: false, message: 'Session expired' },
            { status: 401 }
          );
        }

        // Check admin requirement
        if (options.requireAdmin && decoded.userType !== 'admin' && decoded.userType !== 'authority') {
          return NextResponse.json(
            { success: false, message: 'Admin access required' },
            { status: 403 }
          );
        }

        // Add user to request
        (req as AuthenticatedRequest).user = {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType,
          sessionId: decoded.sessionId
        };

        return await handler(req as AuthenticatedRequest);
      } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json(
          { success: false, message: 'Session validation failed' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

export async function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const authService = AuthService.getInstance();
          const sessionData = await authService.validateSession(decoded.sessionId);
          
          if (sessionData.valid) {
            (req as AuthenticatedRequest).user = {
              userId: decoded.userId,
              email: decoded.email,
              userType: decoded.userType,
              sessionId: decoded.sessionId
            };
          }
        } catch (error) {
          // Continue without authentication if token is invalid
          console.warn('Optional auth failed:', error);
        }
      }

      return await handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return await handler(req as AuthenticatedRequest);
    }
  };
}

export function createResponse(
  data: any = null,
  message: string = 'Success',
  status: number = 200
) {
  return NextResponse.json(
    {
      success: status < 400,
      message,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export function createErrorResponse(
  message: string = 'Internal Server Error',
  status: number = 500,
  error?: any
) {
  console.error('API Error:', message, error);
  return NextResponse.json(
    {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && error && { error: error.message })
    },
    { status }
  );
}