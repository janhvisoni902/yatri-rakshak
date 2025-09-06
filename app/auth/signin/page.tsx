'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Sign in error:', result.error);
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else if (result.error === 'CallbackRouteError') {
          setError('Authentication failed. Please try again.');
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        // Redirect to dashboard router which will handle verification check and role-based routing
        router.push('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign in catch error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-foreground/70 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-foreground/70">
              Access your Yatri Rakshak dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full defi-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/70">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign up here
                </Button>
              </p>
            </div>
            
            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-sm text-foreground/60 text-center mb-3">Try Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-background/30 rounded p-2">
                  <div className="font-medium text-foreground">Tourist</div>
                  <div className="text-foreground/60">tourist@demo.com</div>
                </div>
                <div className="bg-background/30 rounded p-2">
                  <div className="font-medium text-foreground">Police</div>
                  <div className="text-foreground/60">police@demo.com</div>
                </div>
                <div className="bg-background/30 rounded p-2">
                  <div className="font-medium text-foreground">Authority</div>
                  <div className="text-foreground/60">authority@demo.com</div>
                </div>
                <div className="bg-background/30 rounded p-2">
                  <div className="font-medium text-foreground">Admin</div>
                  <div className="text-foreground/60">admin@demo.com</div>
                </div>
              </div>
              <p className="text-xs text-foreground/50 text-center mt-2">Password: demo123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
