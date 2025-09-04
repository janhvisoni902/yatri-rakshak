import NextAuth from 'next-auth';
import { UserRole } from './auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      badgeNumber?: string;
      department?: string;
      verificationStatus: string;
    };
  }

  interface User {
    role: UserRole;
    badgeNumber?: string;
    department?: string;
    verificationStatus: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    badgeNumber?: string;
    department?: string;
    verificationStatus: string;
  }
}
