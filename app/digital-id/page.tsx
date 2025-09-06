'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { Shield, ArrowLeft, CreditCard, FileText, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface DigitalIDData {
  idType: 'aadhaar' | 'passport';
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
}

export default function DigitalIDPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<DigitalIDData>({
    idType: 'aadhaar',
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    nationality: 'Indian'
  });

  const handleInputChange = (field: keyof DigitalIDData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateAadhaar = (aadhaar: string) => {
    // Basic Aadhaar validation (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
  };

  const validatePassport = (passport: string) => {
    // Basic passport validation (alphanumeric, 6-9 characters)
    const passportRegex = /^[A-Z0-9]{6,9}$/;
    return passportRegex.test(passport.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.idNumber.trim()) {
      setError('Please enter your ID number');
      setLoading(false);
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      setLoading(false);
      return;
    }

    // ID-specific validation
    if (formData.idType === 'aadhaar' && !validateAadhaar(formData.idNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      setLoading(false);
      return;
    }

    if (formData.idType === 'passport' && !validatePassport(formData.idNumber)) {
      setError('Please enter a valid passport number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/digital-id/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          idType: formData.idType,
          idNumber: formData.idNumber,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality
        }),
      });

      const data = await response.json();
      console.log('Digital ID creation response:', data);

      if (response.ok && data.success) {
        setSuccess('Digital ID created successfully! Redirecting to dashboard...');
        // Redirect immediately without delay for better UX
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        console.error('Digital ID creation failed:', data);
        setError(data.error || data.details || 'Failed to create digital ID');
      }
    } catch (error) {
      console.error('Digital ID creation error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Yatri Rakshak</h2>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Create Digital ID</CardTitle>
              <CardDescription className="text-gray-400">
                Secure your identity with blockchain-based digital verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="font-medium">{success}</p>
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mx-auto"></div>
                    </div>
                  </div>
                )}
                
                {/* ID Type Selection */}
                <div className="space-y-4">
                  <Label className="text-white">Identity Document Type</Label>
                  <RadioGroup
                    value={formData.idType}
                    onValueChange={(value) => handleInputChange('idType', value)}
                    className="space-y-3"
                    disabled={loading || !!success}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-primary/30 transition-colors">
                        <RadioGroupItem value="aadhaar" id="aadhaar" />
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <Label htmlFor="aadhaar" className="text-white">Aadhaar Card</Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">12-digit unique identification number</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-primary/30 transition-colors">
                        <RadioGroupItem value="passport" id="passport" />
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <Label htmlFor="passport" className="text-white">Passport</Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">International travel document</p>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* ID Number */}
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-white">
                    {formData.idType === 'aadhaar' ? 'Aadhaar Number' : 'Passport Number'}
                  </Label>
                  <Input
                    id="idNumber"
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    required
                    disabled={loading || !!success}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={formData.idType === 'aadhaar' ? '1234 5678 9012' : 'A1234567'}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.idType === 'aadhaar' 
                      ? 'Enter your 12-digit Aadhaar number' 
                      : 'Enter your passport number (6-9 characters)'
                    }
                  </p>
                </div>
                
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    disabled={loading || !!success}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your full name as per document"
                  />
                </div>
                
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    disabled={loading || !!success}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                {/* Nationality */}
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-white">Nationality</Label>
                  <Input
                    id="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    required
                    disabled={loading || !!success}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Indian, American, British"
                  />
                </div>
                
                {/* Security Notice */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-1">Security Notice</h4>
                      <p className="text-xs text-blue-300">
                        Your digital ID will be encrypted and stored securely using blockchain technology. 
                        Only authorized personnel can access this information for verification purposes.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !!success}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Digital ID...
                    </div>
                  ) : success ? (
                    'Digital ID Created!'
                  ) : (
                    'Create Digital ID'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
