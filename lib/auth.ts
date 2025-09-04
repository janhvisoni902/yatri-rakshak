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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        if (user.verificationStatus !== 'verified') {
          throw new Error('Account pending verification');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          badgeNumber: user.badgeNumber,
          department: user.department,
          verificationStatus: user.verificationStatus,
        };
      },
    }),
  ],
  callbacks: {
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
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
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
