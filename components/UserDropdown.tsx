'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Settings, Shield, LogOut, FileText } from 'lucide-react';

export default function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 group"
      >
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-primary/30 group-hover:scale-110">
          <User className="w-4 h-4 text-primary transition-all duration-300 group-hover:scale-110" />
        </div>
        <span className="hidden sm:block text-sm font-medium">{session.user?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate break-all">{session.user?.email}</p>
            </div>
            
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 hover:translate-x-1 flex items-center space-x-2 group"
            >
              <Shield className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/kyc')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 hover:translate-x-1 flex items-center space-x-2 group"
            >
              <FileText className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>KYC</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 hover:translate-x-1 flex items-center space-x-2 group"
            >
              <Settings className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Settings</span>
            </button>
            
            <div className="border-t border-gray-700 my-1"></div>
            
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 hover:translate-x-1 flex items-center space-x-2 group"
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
