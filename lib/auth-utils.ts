import { signOut } from 'next-auth/react';

export const performSignOut = async () => {
  try {
    // Clear any application-specific data
    if (typeof window !== 'undefined') {
      // Clear localStorage
      const keysToKeep = ['theme']; // Keep theme preference
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
    }

    // Sign out from NextAuth
    await signOut({ 
      redirect: false,
      callbackUrl: '/'
    });

    // Force redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }

  } catch (error) {
    console.error('Sign out error:', error);
    
    // Fallback: force redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
};

export const quickSignOut = () => {
  // Immediate redirect for emergency sign out
  if (typeof window !== 'undefined') {
    localStorage.removeItem('next-auth.session-token');
    localStorage.removeItem('next-auth.csrf-token');
    sessionStorage.clear();
    window.location.href = '/';
  }
};