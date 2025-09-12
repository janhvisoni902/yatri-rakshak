'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Shield, User, Bell, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
        }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-foreground/70 hover:text-foreground transition-colors mr-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">Profile Settings</CardTitle>
              </div>
              <CardDescription className="text-foreground/70">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={session.user?.name || ''}
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={session.user?.email || ''}
                    disabled
                    className="bg-background/30 border-border/30 text-foreground/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                {message && (
                  <div className={`text-sm p-3 rounded-lg ${
                    message.includes('success') 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full defi-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">Security</CardTitle>
              </div>
              <CardDescription className="text-foreground/70">
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Account Status</Label>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    session.user?.verificationStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-foreground/70 capitalize">
                    {session.user?.verificationStatus || 'pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Role</Label>
                <div className="text-sm text-foreground/70 capitalize">
                  {session.user?.role || 'user'}
                </div>
              </div>

              {session.user?.badgeNumber && (
                <div className="space-y-2">
                  <Label className="text-foreground">Badge Number</Label>
                  <div className="text-sm text-foreground/70">
                    {session.user.badgeNumber}
                  </div>
                </div>
              )}

              {session.user?.department && (
                <div className="space-y-2">
                  <Label className="text-foreground">Department</Label>
                  <div className="text-sm text-foreground/70">
                    {session.user.department}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/30">
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('Are you sure you want to change your password?')) {
                      // Implement password change logic
                      setMessage('Password change feature coming soon');
                    }
                  }}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">Notifications</CardTitle>
              </div>
              <CardDescription className="text-foreground/70">
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Emergency Alerts</Label>
                  <p className="text-sm text-foreground/70">Receive emergency notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Safety Updates</Label>
                  <p className="text-sm text-foreground/70">Get safety-related updates</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">KYC Status</Label>
                  <p className="text-sm text-foreground/70">Notifications about KYC status</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-foreground/70">
                Common settings and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/kyc">
                <Button variant="outline" className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
                  Complete KYC
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-border/30 bg-background/10 text-foreground hover:bg-background/20">
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    setMessage('Account deletion feature coming soon');
                  }
                }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
