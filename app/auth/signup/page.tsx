'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { UserRole } from '@/types/auth';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join Yatri Rakshak - Traveler Protection System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm text-center">{success}</div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label>Account Type</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.PUBLIC} id="public" />
                  <Label htmlFor="public">Public User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.POLICE} id="police" />
                  <Label htmlFor="police">Police Officer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.HIGHER_AUTHORITY} id="authority" />
                  <Label htmlFor="authority">Higher Authority</Label>
                </div>
              </RadioGroup>
            </div>
            
            {(formData.role === UserRole.POLICE || formData.role === UserRole.HIGHER_AUTHORITY) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="badgeNumber">Badge Number</Label>
                  <Input
                    id="badgeNumber"
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Traffic Police, Crime Branch"
                    required
                  />
                </div>
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push('/auth/signin')}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
