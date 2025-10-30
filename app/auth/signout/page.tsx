'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Sign out without redirect
        await signOut({ redirect: false });
        
        // Clear any local storage or session storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Redirect to home page
        router.push('/');
        
        // Force reload to ensure clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
      } catch (error) {
        console.error('Sign out error:', error);
        // Fallback redirect
        window.location.href = '/';
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}