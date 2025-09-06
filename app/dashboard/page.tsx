'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Users, Eye } from 'lucide-react';

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has completed KYC or has digital ID
    // If not verified, redirect to digital ID page first, then KYC if needed
    if (session.user.verificationStatus !== 'verified') {
      // For now, redirect directly to digital ID creation
      // In a real app, you might want to check if digital ID exists first
      router.push('/digital-id');
      return;
    }

    // Route users to their appropriate dashboard based on role
    switch (session.user.role) {
      case 'public':
      case 'local_citizen':
        router.push('/dashboard/public');
        break;
      
      case 'tourist':
        router.push('/dashboard/tourist');
        break;
      
      case 'police':
        router.push('/dashboard/police');
        break;
      
      case 'tourism_dept':
      case 'higher_authority':
      case 'admin':
        router.push('/dashboard/authority');
        break;
      
      default:
        // Fallback to public dashboard for unknown roles
        router.push('/dashboard/public');
        break;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen defi-animated-bg flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground defi-text-gradient">Yatri Rakshak</h2>
            <p className="text-foreground/70">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen defi-animated-bg flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto defi-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground defi-text-gradient">Yatri Rakshak</h2>
            <p className="text-foreground/70">Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show role-based loading indicator while redirecting
  const getRoleIcon = () => {
    switch (session.user.role) {
      case 'police':
        return <Shield className="w-16 h-16 text-primary mx-auto" />;
      case 'tourism_dept':
      case 'higher_authority':
      case 'admin':
        return <Eye className="w-16 h-16 text-primary mx-auto" />;
      default:
        return <Users className="w-16 h-16 text-primary mx-auto" />;
    }
  };

  const getRoleLabel = () => {
    switch (session.user.role) {
      case 'police':
        return 'Police Dashboard';
      case 'tourism_dept':
        return 'Tourism Department Dashboard';
      case 'higher_authority':
        return 'Higher Authority Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Public Dashboard';
    }
  };

  return (
    <div className="min-h-screen defi-animated-bg flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto defi-glow">
          {getRoleIcon()}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground defi-text-gradient">Yatri Rakshak</h2>
          <p className="text-foreground/70">Loading {getRoleLabel()}...</p>
          <p className="text-sm text-foreground/60 mt-2">Welcome, {session.user.name}</p>
        </div>
      </div>
    </div>
  );
}
