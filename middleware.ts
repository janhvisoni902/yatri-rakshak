import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Role-based access control
    const userRole = token.role;

    // Dashboard access control
    if (pathname.startsWith('/dashboard/')) {
      // Police dashboard - only police can access
      if (pathname.startsWith('/dashboard/police')) {
        if (userRole !== 'police') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
      
      // Tourist dashboard - only tourists can access
      if (pathname.startsWith('/dashboard/tourist')) {
        if (userRole !== 'tourist') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
      
      // Authority dashboard - only higher authority, admin, and tourism dept can access
      if (pathname.startsWith('/dashboard/authority')) {
        if (!['higher_authority', 'admin', 'tourism_dept'].includes(userRole as string)) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
      
      // Public dashboard - public and local citizens can access
      if (pathname.startsWith('/dashboard/public')) {
        if (!['public', 'local_citizen'].includes(userRole as string)) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    }

    // KYC page - all authenticated users can access
    if (pathname.startsWith('/kyc')) {
      return NextResponse.next();
    }

    // Admin routes - only admin can access
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/')) {
          return true;
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kyc/:path*',
    '/admin/:path*',
    '/api/kyc/:path*'
  ]
};
