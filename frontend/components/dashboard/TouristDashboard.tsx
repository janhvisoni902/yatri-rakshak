'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  QrCode, 
  Phone, 
  Clock,
  User,
  Settings,
  LogOut,
  Download,
  Share2,
  Bell
} from 'lucide-react';

interface TouristIdentity {
  touristId: string;
  safetyScore: number;
  riskLevel: string;
  validFrom: string;
  validTo: string;
  qrCode: string;
}

interface UserData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
}

const TouristDashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [touristIdentity, setTouristIdentity] = useState<TouristIdentity | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch tourist identity and other data
    fetchDashboardData();
    getCurrentLocation();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch tourist identity
      const identityResponse = await fetch(`/api/tourist-identity/${userData.userId}`);
      if (identityResponse.ok) {
        const identityData = await identityResponse.json();
        setTouristIdentity(identityData.data);
      }

      // Fetch safety alerts
      const alertsResponse = await fetch(`/api/safety/alerts/${userData.userId}`);
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setSafetyAlerts(alertsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:112'; // Emergency number
  };

  const handleShareLocation = () => {
    if (currentLocation) {
      const locationUrl = `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
      navigator.share?.({
        title: 'My Current Location',
        text: 'Emergency - This is my current location',
        url: locationUrl
      }) || alert(`Location: ${locationUrl}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">YatriRakshak</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {userData?.firstName || userData?.email}
          </h2>
          <p className="text-gray-600">Stay safe during your travels with real-time monitoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital ID Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Digital Tourist ID</h3>
                  <p className="text-blue-100 text-sm">Blockchain-secured identity</p>
                </div>
                <QrCode className="w-12 h-12 text-blue-200" />
              </div>

              {touristIdentity ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">Tourist ID</p>
                      <p className="font-medium truncate">{touristIdentity.touristId}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Safety Score</p>
                      <p className="font-medium text-2xl">{touristIdentity.safetyScore}/100</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">Risk Level</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getRiskLevelColor(touristIdentity.riskLevel)
                      }`}>
                        {touristIdentity.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Valid Until</p>
                      <p className="font-medium">
                        {new Date(touristIdentity.validTo).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Download className="w-4 h-4 inline mr-2" />
                      Download
                    </button>
                    <button 
                      onClick={handleShareLocation}
                      className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Share2 className="w-4 h-4 inline mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-blue-100">Digital ID not yet generated</p>
                  <p className="text-blue-200 text-sm">Complete your onboarding process</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Emergency</h3>
              <button 
                onClick={handleEmergencyCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3"
              >
                <Phone className="w-5 h-5 inline mr-2" />
                Call Emergency (112)
              </button>
              <button 
                onClick={handleShareLocation}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Share Location
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Safety Checks</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Locations Visited</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Alerts</span>
                  <span className="font-medium text-orange-600">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Safety Alerts</h3>
            </div>
            <div className="p-6">
              {safetyAlerts.length > 0 ? (
                <div className="space-y-4">
                  {safetyAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">{alert.title}</h4>
                        <p className="text-yellow-700 text-sm">{alert.message}</p>
                        <p className="text-yellow-600 text-xs mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900">All Clear!</h4>
                  <p className="text-gray-600">No safety alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Location */}
        {currentLocation && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Location</h3>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-900">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Locations</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Clock className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium">History</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;