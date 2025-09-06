'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { UserRole } from '@/types/auth';
import { Shield, ArrowLeft, Users, MapPin, Star, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.PUBLIC,
    badgeNumber: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Additional validation for police/authority roles
    if ((formData.role === UserRole.POLICE || formData.role === UserRole.HIGHER_AUTHORITY) && 
        (!formData.badgeNumber || !formData.department)) {
      setError('Badge number and department are required for police/authority accounts');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          badgeNumber: formData.badgeNumber || undefined,
          department: formData.department || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.PUBLIC:
        return <Users className="w-4 h-4" />;
      case UserRole.TOURIST:
        return <MapPin className="w-4 h-4" />;
      case UserRole.POLICE:
        return <Shield className="w-4 h-4" />;
      case UserRole.HIGHER_AUTHORITY:
        return <Star className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
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
            <CardTitle className="text-2xl text-foreground">Join Yatri Rakshak</CardTitle>
            <CardDescription className="text-foreground/70">
              Create your account and start your safety journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-foreground">Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <RadioGroupItem value={UserRole.PUBLIC} id="public" />
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(UserRole.PUBLIC)}
                        <Label htmlFor="public" className="text-foreground">Local Citizen</Label>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 ml-8">Resident of the area with local knowledge</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <RadioGroupItem value={UserRole.TOURIST} id="tourist" />
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(UserRole.TOURIST)}
                        <Label htmlFor="tourist" className="text-foreground">Tourist</Label>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 ml-8">Visiting the area for tourism or business</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <RadioGroupItem value={UserRole.POLICE} id="police" />
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(UserRole.POLICE)}
                        <Label htmlFor="police" className="text-foreground">Police Officer</Label>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 ml-8">Law enforcement personnel (requires verification)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <RadioGroupItem value={UserRole.HIGHER_AUTHORITY} id="authority" />
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(UserRole.HIGHER_AUTHORITY)}
                        <Label htmlFor="authority" className="text-foreground">Higher Authority</Label>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/60 ml-8">Administrative or supervisory personnel (requires verification)</p>
                  </div>
                </RadioGroup>
              </div>
              
              {(formData.role === UserRole.POLICE || formData.role === UserRole.HIGHER_AUTHORITY) && (
                <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="text-sm font-medium text-foreground">Verification Details</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="badgeNumber" className="text-foreground">Badge Number</Label>
                      <Input
                        id="badgeNumber"
                        type="text"
                        value={formData.badgeNumber}
                        onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:border-primary/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-foreground">Department</Label>
                      <Input
                        id="department"
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Traffic Police, Crime Branch"
                        required
                        className="bg-background/50 border-border/50 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full defi-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/70">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
