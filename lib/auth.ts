import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import User from '../models/User';
import { UserRole } from '../types/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          // Allow login regardless of verification status
          // Verification will be handled in the dashboard router

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            badgeNumber: user.badgeNumber,
            department: user.department,
            verificationStatus: user.verificationStatus,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to home after login; client can navigate to dashboard
      if (url.startsWith('/')) return `${baseUrl}/`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.badgeNumber = user.badgeNumber;
        token.department = user.department;
        token.verificationStatus = user.verificationStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.badgeNumber = token.badgeNumber as string;
        session.user.department = token.department as string;
        session.user.verificationStatus = token.verificationStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
};

export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const isPoliceOrHigher = (userRole: UserRole): boolean => {
  return hasRole(userRole, [UserRole.POLICE, UserRole.HIGHER_AUTHORITY, UserRole.ADMIN]);
};

export const isHigherAuthority = (userRole: UserRole): boolean => {
  return hasRole(userRole, [UserRole.HIGHER_AUTHORITY, UserRole.ADMIN]);
};
