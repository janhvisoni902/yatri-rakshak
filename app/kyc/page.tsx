'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Textarea } from '@/components/textarea';
import { Badge } from '@/components/badge';
import { 
  Shield, 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Flag
} from 'lucide-react';

interface KYCFormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  address: string;
  
  // Identity Documents
  idType: 'passport' | 'aadhaar' | 'driving_license' | 'voter_id';
  idNumber: string;
  
  // Tourist-specific (if applicable)
  visitPurpose?: string;
  visitDuration?: string;
  accommodationDetails?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Police-specific (if applicable)
  badgeNumber?: string;
  department?: string;
  jurisdiction?: string;
  serviceYears?: string;
}

export default function KYCPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    frontSide: File | null;
    backSide: File | null;
    additionalDocs: File[];
  }>({
    frontSide: null,
    backSide: null,
    additionalDocs: []
  });
  const [uploadErrors, setUploadErrors] = useState<{
    frontSide: string;
    backSide: string;
    additionalDocs: string;
  }>({
    frontSide: '',
    backSide: '',
    additionalDocs: ''
  });
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    dateOfBirth: '',
    nationality: 'India',
    phoneNumber: '',
    address: '',
    idType: 'aadhaar',
    idNumber: '',
    visitPurpose: '',
    visitDuration: '',
    accommodationDetails: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    badgeNumber: '',
    department: '',
    jurisdiction: '',
    serviceYears: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // Pre-fill form with session data
    setFormData(prev => ({
      ...prev,
      fullName: session.user.name || '',
      badgeNumber: session.user.badgeNumber || '',
      department: session.user.department || ''
    }));
  }, [session, status, router]);

  const handleInputChange = (field: keyof KYCFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: keyof NonNullable<KYCFormData['emergencyContact']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value
      }
    }));
  };

  const validateFile = (file: File, type: 'image' | 'document'): string => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    if (type === 'image') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return 'Only JPG, JPEG, and PNG files are allowed for images';
      }
    } else if (type === 'document') {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return 'Only PDF, JPG, JPEG, and PNG files are allowed';
      }
    }
    
    return '';
  };

  const handleFileUpload = (file: File, uploadType: 'frontSide' | 'backSide' | 'additionalDocs') => {
    const error = validateFile(file, uploadType === 'additionalDocs' ? 'document' : 'image');
    
    if (error) {
      setUploadErrors(prev => ({
        ...prev,
        [uploadType]: error
      }));
      return;
    }

    setUploadErrors(prev => ({
      ...prev,
      [uploadType]: ''
    }));

    if (uploadType === 'additionalDocs') {
      setUploadedFiles(prev => ({
        ...prev,
        additionalDocs: [...prev.additionalDocs, file]
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [uploadType]: file
      }));
    }
  };

  const removeFile = (uploadType: 'frontSide' | 'backSide' | 'additionalDocs', index?: number) => {
    if (uploadType === 'additionalDocs' && typeof index === 'number') {
      setUploadedFiles(prev => ({
        ...prev,
        additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [uploadType]: null
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit KYC data
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user.id,
          userRole: session?.user.role
        }),
      });

      if (response.ok) {
        // Redirect to appropriate dashboard after successful KYC
        switch (session?.user.role) {
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
            router.push('/dashboard');
            break;
        }
      } else {
        throw new Error('KYC submission failed');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Failed to submit KYC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const isPoliceRole = session.user.role === 'police';
  const isTouristRole = ['tourist', 'public'].includes(session.user.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-500" />
                <span>Yatri Rakshak</span>
              </h1>
              <p className="text-muted-foreground">Complete Your KYC Verification</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {session.user.role === 'police' ? 'Police Officer' : 
                 session.user.role === 'tourist' ? 'Tourist' : 
                 session.user.role === 'higher_authority' ? 'Higher Authority' : 'Public User'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              Step {currentStep}: {
                currentStep === 1 ? 'Personal Information' :
                currentStep === 2 ? 'Identity Verification' :
                'Additional Details'
              }
            </h2>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Please provide your basic personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <select
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Identity Verification */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Identity Verification</span>
              </CardTitle>
              <CardDescription>
                Upload your identity documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Document Type *</Label>
                  <select
                    id="idType"
                    value={formData.idType}
                    onChange={(e) => handleInputChange('idType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    placeholder="Enter ID number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Document Upload</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front Side Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploadedFiles.frontSide ? (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-sm text-green-600 font-medium">
                          {uploadedFiles.frontSide.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFiles.frontSide.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFile('frontSide')}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Upload Front Side</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'frontSide');
                          }}
                          className="hidden"
                          id="frontSideUpload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('frontSideUpload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </>
                    )}
                    {uploadErrors.frontSide && (
                      <p className="text-xs text-red-600 mt-2">{uploadErrors.frontSide}</p>
                    )}
                  </div>

                  {/* Back Side Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploadedFiles.backSide ? (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-sm text-green-600 font-medium">
                          {uploadedFiles.backSide.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFiles.backSide.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFile('backSide')}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Upload Back Side</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'backSide');
                          }}
                          className="hidden"
                          id="backSideUpload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('backSideUpload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </>
                    )}
                    {uploadErrors.backSide && (
                      <p className="text-xs text-red-600 mt-2">{uploadErrors.backSide}</p>
                    )}
                  </div>
                </div>

                {/* Additional Documents Upload */}
                <div className="space-y-4">
                  <Label>Additional Documents (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload Additional Documents</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Support documents, certificates, or other relevant files (PDF, JPG, PNG)
                      </p>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleFileUpload(file, 'additionalDocs'));
                        }}
                        className="hidden"
                        id="additionalDocsUpload"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('additionalDocsUpload')?.click()}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    {/* Display uploaded additional documents */}
                    {uploadedFiles.additionalDocs.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Uploaded Files:</Label>
                        {uploadedFiles.additionalDocs.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.includes('pdf') ? 'PDF' : 'Image'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeFile('additionalDocs', index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadErrors.additionalDocs && (
                      <p className="text-xs text-red-600 mt-2">{uploadErrors.additionalDocs}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Document Guidelines</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Ensure documents are clear and readable</li>
                      <li>• Upload high-quality images (JPG, PNG) or PDF files</li>
                      <li>• All corners of the document should be visible</li>
                      <li>• Maximum file size: 10MB per file</li>
                      <li>• PDF files are supported for additional documents</li>
                      <li>• Multiple files can be uploaded for additional documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Additional Details</span>
              </CardTitle>
              <CardDescription>
                {isPoliceRole ? 'Police service information' : 
                 isTouristRole ? 'Travel and stay information' : 'Additional verification details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPoliceRole && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="badgeNumber">Badge Number *</Label>
                      <Input
                        id="badgeNumber"
                        value={formData.badgeNumber}
                        onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                        placeholder="Enter badge number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Traffic Police, Crime Branch"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction">Jurisdiction</Label>
                      <Input
                        id="jurisdiction"
                        value={formData.jurisdiction}
                        onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                        placeholder="Area of jurisdiction"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceYears">Years of Service</Label>
                      <Input
                        id="serviceYears"
                        value={formData.serviceYears}
                        onChange={(e) => handleInputChange('serviceYears', e.target.value)}
                        placeholder="Years in service"
                      />
                    </div>
                  </div>
                </>
              )}

              {isTouristRole && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visitPurpose">Purpose of Visit</Label>
                      <select
                        id="visitPurpose"
                        value={formData.visitPurpose}
                        onChange={(e) => handleInputChange('visitPurpose', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="">Select purpose</option>
                        <option value="tourism">Tourism</option>
                        <option value="business">Business</option>
                        <option value="education">Education</option>
                        <option value="medical">Medical</option>
                        <option value="family">Family Visit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visitDuration">Duration of Stay</Label>
                      <Input
                        id="visitDuration"
                        value={formData.visitDuration}
                        onChange={(e) => handleInputChange('visitDuration', e.target.value)}
                        placeholder="e.g., 7 days, 2 weeks"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accommodationDetails">Accommodation Details</Label>
                    <Textarea
                      id="accommodationDetails"
                      value={formData.accommodationDetails}
                      onChange={(e) => handleInputChange('accommodationDetails', e.target.value)}
                      placeholder="Hotel name and address or local contact details"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Emergency Contact Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          value={formData.emergencyContact?.name}
                          onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyContact?.phone}
                          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelation">Relationship</Label>
                        <Input
                          id="emergencyRelation"
                          value={formData.emergencyContact?.relationship}
                          onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                          placeholder="e.g., Spouse, Parent"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Verification Process</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your information will be verified within 24-48 hours. You'll receive a notification once approved.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Complete KYC'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
