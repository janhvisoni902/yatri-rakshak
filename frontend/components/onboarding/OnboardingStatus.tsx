'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Mail, 
  Phone, 
  FileText, 
  Shield, 
  User,
  QrCode,
  Upload,
  Eye
} from 'lucide-react';

interface OnboardingStep {
  stepId: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  order: number;
}

interface OnboardingData {
  onboardingId: string;
  userId: string;
  status: string;
  currentStep: string;
  currentStepOrder: number;
  completedSteps: any[];
  stepStatuses: Record<string, string>;
  estimatedCompletionTime: number;
  actualStartTime: string;
  blockers: any[];
  notes: any[];
}

const OnboardingStatus: React.FC = () => {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const steps: OnboardingStep[] = [
    {
      stepId: 'registration',
      name: 'User Registration',
      description: 'Basic user registration with email and password',
      status: 'completed',
      order: 1
    },
    {
      stepId: 'email_verification',
      name: 'Email Verification',
      description: 'Verify email address with OTP',
      status: 'pending',
      order: 2
    },
    {
      stepId: 'phone_verification',
      name: 'Phone Verification',
      description: 'Verify phone number with SMS OTP',
      status: 'pending',
      order: 3
    },
    {
      stepId: 'kyc_upload',
      name: 'KYC Document Upload',
      description: 'Upload identity documents (Aadhaar/Passport)',
      status: 'pending',
      order: 4
    },
    {
      stepId: 'kyc_verification',
      name: 'KYC Verification',
      description: 'Manual or automated KYC verification',
      status: 'pending',
      order: 5
    },
    {
      stepId: 'profile_completion',
      name: 'Profile Completion',
      description: 'Complete tourist profile with preferences',
      status: 'pending',
      order: 6
    },
    {
      stepId: 'blockchain_id_generation',
      name: 'Blockchain ID Generation',
      description: 'Generate blockchain-based tourist ID',
      status: 'pending',
      order: 7
    }
  ];

  useEffect(() => {
    const registrationData = localStorage.getItem('registrationData');
    const userData = localStorage.getItem('user');
    
    if (registrationData) {
      const data = JSON.parse(registrationData);
      setUserId(data.userId);
    } else if (userData) {
      const data = JSON.parse(userData);
      setUserId(data.userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOnboardingStatus();
    }
  }, [userId]);

  const fetchOnboardingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/onboarding/status/${userId}`);
      const data = await response.json();

      if (data.success) {
        setOnboardingData(data.data);
      } else {
        setError(data.message || 'Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setError('Failed to fetch onboarding status');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepId: string, status: string) => {
    const iconClass = "w-6 h-6";
    
    switch (stepId) {
      case 'registration':
        return <User className={iconClass} />;
      case 'email_verification':
        return <Mail className={iconClass} />;
      case 'phone_verification':
        return <Phone className={iconClass} />;
      case 'kyc_upload':
        return <Upload className={iconClass} />;
      case 'kyc_verification':
        return <Eye className={iconClass} />;
      case 'profile_completion':
        return <FileText className={iconClass} />;
      case 'blockchain_id_generation':
        return <QrCode className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'blocked':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-600';
    }
  };

  const handleStepAction = (stepId: string) => {
    switch (stepId) {
      case 'email_verification':
        router.push('/onboarding/verify-email');
        break;
      case 'phone_verification':
        router.push('/onboarding/verify-phone');
        break;
      case 'kyc_upload':
        router.push('/onboarding/kyc-upload');
        break;
      case 'profile_completion':
        router.push('/onboarding/profile');
        break;
      default:
        break;
    }
  };

  const calculateProgress = () => {
    if (!onboardingData) return 0;
    const totalSteps = steps.length;
    const completedCount = Object.values(onboardingData.stepStatuses).filter(
      status => status === 'completed'
    ).length;
    return Math.round((completedCount / totalSteps) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading onboarding status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOnboardingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Onboarding Progress</h1>
              <p className="text-gray-600">Complete your registration to get your digital tourist ID</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{progress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Badge */}
          {onboardingData && (
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                getStatusColor(onboardingData.status)
              }`}>
                {getStatusIcon(onboardingData.status)}
                <span className="ml-2 capitalize">{onboardingData.status.replace('_', ' ')}</span>
              </span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepStatus = onboardingData?.stepStatuses[step.stepId] || 'pending';
            const isActive = onboardingData?.currentStep === step.stepId;
            const canTakeAction = stepStatus === 'in_progress' && ['email_verification', 'phone_verification', 'kyc_upload', 'profile_completion'].includes(step.stepId);

            return (
              <div
                key={step.stepId}
                className={`bg-white rounded-lg shadow-md border-l-4 ${
                  stepStatus === 'completed' 
                    ? 'border-green-500' 
                    : isActive 
                    ? 'border-blue-500' 
                    : 'border-gray-200'
                } p-6`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      stepStatus === 'completed' 
                        ? 'bg-green-100 text-green-600'
                        : isActive 
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {getStepIcon(step.stepId, stepStatus)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                      <p className="text-gray-600">{step.description}</p>
                      {stepStatus === 'in_progress' && (
                        <p className="text-blue-600 text-sm font-medium mt-1">Currently active</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(stepStatus)}
                    {canTakeAction && (
                      <button
                        onClick={() => handleStepAction(step.stepId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </div>

                {/* Step Details */}
                {stepStatus === 'completed' && onboardingData && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed successfully
                    </div>
                  </div>
                )}

                {stepStatus === 'blocked' && onboardingData && onboardingData.blockers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-red-600">
                      <XCircle className="w-4 h-4 mr-2 inline" />
                      This step is currently blocked. Please contact support.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Congratulations! Your digital tourist ID is ready
                </h3>
                <p className="text-green-700 mt-1">
                  You can now access all tourist safety features and services.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            If you're facing any issues with the onboarding process, our support team is here to help.
          </p>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Contact Support
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              View FAQs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatus;