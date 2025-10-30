'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useVisitTrends, useSafetyTrends, usePlaceTypeData } from '@/hooks/useAnalytics';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { 
  MapPin, 
  AlertTriangle, 
  Phone, 
  Camera, 
  Navigation,
  Shield,
  Heart,
  Clock,
  Users,
  Star,
  Globe,
  Camera as CameraIcon,
  MessageCircle,
  Bell,
  Settings,
  User,
  Calendar,
  Plane,
  Hotel,
  Car,
  Utensils,
  Camera as PhotoIcon,
  Share2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Battery,
  Wifi,
  Compass,
  Flag,
  Map,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  Mic,
  Video,
  Image,
  FileText,
  ExternalLink,
  Activity,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import BarChartComponent from '@/components/charts/BarChart';
import LineChartComponent from '@/components/charts/LineChart';
import IndiaMapComponent from '@/components/charts/IndiaMap';
import ProfileEditModal from '@/components/profile-edit-modal';
import UniversalMap from '@/components/maps/UniversalMap';

interface TouristStats {
  safetyScore: number;
  placesVisited: number;
  photosShared: number;
  emergencyContacts: number;
  daysRemaining: number;
  currentLocation: string;
}

interface TouristLocation {
  id: string;
  name: string;
  type: 'monument' | 'market' | 'restaurant' | 'hotel' | 'transport' | 'other';
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  safetyLevel: 'safe' | 'moderate' | 'caution' | 'avoid';
  visited: boolean;
  plannedVisit?: string;
  photos?: string[];
  notes?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isLocal: boolean;
}

interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  location: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
  acknowledged: boolean;
}

export default function TouristDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<TouristStats>({
    safetyScore: 85,
    placesVisited: 12,
    photosShared: 8,
    emergencyContacts: 3,
    daysRemaining: 5,
    currentLocation: 'Red Fort, Delhi'
  });

  const [locations, setLocations] = useState<TouristLocation[]>([
    {
      id: '1',
      name: 'Red Fort',
      type: 'monument',
      address: 'Netaji Subhash Marg, Lal Qila, Old Delhi',
      coordinates: { lat: 28.6562, lng: 77.2410 },
      rating: 4.5,
      safetyLevel: 'safe',
      visited: true,
      photos: ['red-fort-1.jpg', 'red-fort-2.jpg'],
      notes: 'Amazing historical site! Very crowded but safe.'
    },
    {
      id: '2',
      name: 'Connaught Place',
      type: 'market',
      address: 'Connaught Place, New Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      rating: 4.2,
      safetyLevel: 'moderate',
      visited: false,
      plannedVisit: '2025-01-06T10:00:00Z',
      notes: 'Shopping area - be careful with belongings'
    },
    {
      id: '3',
      name: 'India Gate',
      type: 'monument',
      address: 'Rajpath, India Gate, New Delhi',
      coordinates: { lat: 28.6129, lng: 77.2295 },
      rating: 4.3,
      safetyLevel: 'safe',
      visited: true,
      photos: ['india-gate-1.jpg']
    }
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Shivam Mukherjee',
      phone: '+91-9876543210',
      relationship: 'Brother',
      isLocal: false
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      relationship: 'Local Guide',
      isLocal: true
    },
    {
      id: '3',
      name: 'Hotel Concierge',
      phone: '+91-11-23456789',
      relationship: 'Hotel Staff',
      isLocal: true
    }
  ]);

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([
    {
      id: '1',
      title: 'High Crowd Alert',
      message: 'Red Fort area experiencing unusually high tourist traffic. Exercise caution.',
      location: 'Red Fort, Delhi',
      severity: 'warning',
      timestamp: '2025-01-04T14:30:00Z',
      acknowledged: false
    },
    {
      id: '2',
      title: 'Weather Update',
      message: 'Light rain expected in the evening. Carry an umbrella.',
      location: 'Delhi',
      severity: 'info',
      timestamp: '2025-01-04T12:00:00Z',
      acknowledged: true
    }
  ]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Profile editing state
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Enhanced Location and Emergency Functions
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Safety score calculation
  const calculateSafetyScore = useCallback(() => {
    let score = 50; // Base score
    
    // Positive factors
    score += emergencyContacts.length * 10; // +10 per emergency contact
    score += locations.filter(loc => loc.visited && loc.safetyLevel === 'safe').length * 5; // +5 per safe place visited
    score += userLocation ? 15 : 0; // +15 if location sharing is enabled
    
    // Negative factors
    score -= safetyAlerts.filter(alert => !alert.acknowledged && alert.severity === 'danger').length * 20; // -20 per unacknowledged danger alert
    score -= safetyAlerts.filter(alert => !alert.acknowledged && alert.severity === 'warning').length * 10; // -10 per unacknowledged warning
    score -= locations.filter(loc => loc.visited && loc.safetyLevel === 'avoid').length * 15; // -15 per dangerous place visited
    
    // Weather factors
    if (weatherData?.alerts?.length > 0) {
      score -= weatherData.alerts.length * 5; // -5 per weather alert
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [emergencyContacts, locations, safetyAlerts, weatherData, userLocation]);

  // Fetch weather data
  const fetchWeatherData = async () => {
    if (userLocation && !loadingWeather) {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `/api/weather?lat=${userLocation.lat}&lng=${userLocation.lng}&location=${encodeURIComponent(stats.currentLocation)}`
        );
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data.weather);
          
          // Add weather alerts to safety alerts
          if (data.weather.alerts && data.weather.alerts.length > 0) {
            const weatherAlerts = data.weather.alerts.map((alert: any) => ({
              id: `weather-${alert.id}`,
              title: alert.title,
              message: alert.message,
              location: stats.currentLocation,
              severity: alert.severity,
              timestamp: new Date().toISOString(),
              acknowledged: false
            }));
            setSafetyAlerts(prev => [...weatherAlerts, ...prev]);
          }
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoadingWeather(false);
      }
    }
  };

  // Filter locations based on search query and filter
  useEffect(() => {
    let filtered = locations;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (locationFilter !== 'all') {
      if (locationFilter === 'visited') {
        filtered = filtered.filter(location => location.visited);
      } else if (locationFilter === 'planned') {
        filtered = filtered.filter(location => !location.visited && location.plannedVisit);
      } else {
        filtered = filtered.filter(location => location.type === locationFilter);
      }
    }
    
    setFilteredLocations(filtered);
  }, [searchQuery, locationFilter, locations]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!['tourist', 'public', 'local_citizen'].includes(session.user.role)) {
      if (session.user.role === 'police') {
        router.push('/dashboard/police');
      } else if (['higher_authority', 'admin'].includes(session.user.role)) {
        router.push('/dashboard/authority');
      }
      return;
    }
    
    // Fetch weather data on component mount
    fetchWeatherData();
    
    // Request notification permission
    if (typeof window !== 'undefined') {
      import('@/lib/notifications').then(({ notificationService }) => {
        notificationService.requestPermission();
      });
    }
  }, [session, status, router, userLocation]);
  
  // Update safety score when relevant data changes
  useEffect(() => {
    const newScore = calculateSafetyScore();
    setStats(prev => ({ ...prev, safetyScore: newScore }));
  }, [calculateSafetyScore]);

  // Dynamic analytics data
  const { data: visitTrendData, loading: visitTrendsLoading, error: visitTrendsError } = useVisitTrends();
  const { data: safetyScoreData, loading: safetyTrendsLoading, error: safetyTrendsError } = useSafetyTrends();
  const { data: placeTypeData, loading: placeTypesLoading, error: placeTypesError } = usePlaceTypeData();

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'caution': return 'bg-orange-500';
      case 'avoid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCurrentLocation = () => {
    return new Promise<{lat: number, lng: number}>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleEmergencyCall = async () => {
    try {
      await getCurrentLocation();
      
      // Show emergency dialog
      const confirmed = confirm(
        `🚨 EMERGENCY ALERT ACTIVATED 🚨\n\n` +
        `This will immediately contact:\n` +
        `• Local Police (100)\n` +
        `• Medical Services (108)\n` +
        `• Emergency Contacts\n\n` +
        `Location: ${stats.currentLocation}\n` +
        `Time: ${new Date().toLocaleTimeString()}\n\n` +
        `Press OK to confirm emergency or Cancel to abort.`
      );
      
      if (confirmed) {
        try {
          // Send emergency alert to API
          const response = await fetch('/api/emergency', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'SOS',
              location: stats.currentLocation,
              coordinates: userLocation,
              message: 'Emergency SOS activated by user'
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Add emergency alert to safety alerts
            const newAlert: SafetyAlert = {
              id: Date.now().toString(),
              title: 'Emergency SOS Activated',
              message: `Emergency services have been contacted. Help is on the way to your location: ${stats.currentLocation}`,
              location: stats.currentLocation,
              severity: 'danger',
              timestamp: new Date().toISOString(),
              acknowledged: false
            };
            setSafetyAlerts(prev => [newAlert, ...prev]);
            
            // Show notification
            if (typeof window !== 'undefined') {
              const { notificationService } = await import('@/lib/notifications');
              notificationService.showEmergencyAlert(
                `Emergency activated at ${stats.currentLocation}. Help is on the way!`,
                { location: stats.currentLocation, coordinates: userLocation }
              );
            }
            
            // Show detailed response
            const response_info = result.response;
            alert(
              `✅ EMERGENCY ACTIVATED SUCCESSFULLY\n\n` +
              `Police: ${response_info.police.contacted ? '✓' : '❌'} Contacted (ETA: ${response_info.police.eta})\n` +
              `Medical: ${response_info.medical.contacted ? '✓' : '❌'} Contacted (ETA: ${response_info.medical.eta})\n` +
              `Emergency Contacts: ${response_info.emergencyContacts.notified ? '✓' : '❌'} Notified (${response_info.emergencyContacts.count} contacts)\n\n` +
              `Stay where you are. Help is on the way!`
            );
          } else {
            throw new Error('Failed to send emergency alert');
          }
        } catch (apiError) {
          console.error('Emergency API error:', apiError);
          // Fallback: still show local alert
          const newAlert: SafetyAlert = {
            id: Date.now().toString(),
            title: 'Emergency SOS Activated (Local)',
            message: `Emergency alert sent locally. Please call 100 (Police) and 108 (Medical) directly.`,
            location: stats.currentLocation,
            severity: 'danger',
            timestamp: new Date().toISOString(),
            acknowledged: false
          };
          setSafetyAlerts(prev => [newAlert, ...prev]);
          
          alert('❌ API Error. Please call emergency services directly:\nPolice: 100\nMedical: 108');
        }
      }
    } catch (error) {
      console.error('Emergency call error:', error);
      alert('❌ Unable to get location. Please call 100 (Police) and 108 (Medical) directly.');
    }
  };

  const handleShareLocation = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      
      const locationData = {
        coordinates: location,
        area: stats.currentLocation,
        timestamp: new Date().toISOString(),
        user: session?.user.name,
        message: `I'm currently at ${stats.currentLocation}. My exact coordinates are: ${location.lat}, ${location.lng}`,
        mapLink: `https://maps.google.com/?q=${location.lat},${location.lng}`
      };
      
      // In a real app, this would send to emergency contacts
      console.log('Location shared:', locationData);
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Current Location - Yatri Rakshak',
          text: locationData.message,
          url: locationData.mapLink
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${locationData.message}\n\nGoogle Maps: ${locationData.mapLink}`);
        alert(`📍 Location shared successfully!\n\n${locationData.message}\n\nLocation details copied to clipboard.`);
      }
    } catch (error) {
      console.error('Share location error:', error);
      alert('❌ Unable to get your location. Please check location permissions.');
    } finally {
      setIsGettingLocation(false);
    }
  };
  
  const handleReportIncident = async () => {
    const incidentType = prompt(
      `🚨 INCIDENT REPORT\n\n` +
      `Please select incident type:\n` +
      `1. Theft/Robbery\n` +
      `2. Harassment\n` +
      `3. Medical Emergency\n` +
      `4. Traffic Accident\n` +
      `5. Suspicious Activity\n` +
      `6. Lost/Missing Person\n` +
      `7. Other\n\n` +
      `Enter number (1-7):`
    );
    
    if (incidentType && ['1','2','3','4','5','6','7'].includes(incidentType)) {
      const types = {
        '1': 'theft_robbery',
        '2': 'harassment', 
        '3': 'medical_emergency',
        '4': 'traffic_accident',
        '5': 'suspicious_activity',
        '6': 'lost_missing_person',
        '7': 'other'
      };
      
      const typeLabels = {
        '1': 'Theft/Robbery',
        '2': 'Harassment', 
        '3': 'Medical Emergency',
        '4': 'Traffic Accident',
        '5': 'Suspicious Activity',
        '6': 'Lost/Missing Person',
        '7': 'Other'
      };
      
      const description = prompt(`Describe the incident (${typeLabels[incidentType as keyof typeof typeLabels]}):`);
      
      if (description) {
        try {
          const coordinates = userLocation;
          
          const response = await fetch('/api/incidents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: typeLabels[incidentType as keyof typeof typeLabels],
              description,
              location: stats.currentLocation,
              coordinates,
              priority: incidentType === '3' ? 'emergency' : 'medium'
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Add as safety alert
            const newAlert: SafetyAlert = {
              id: Date.now().toString(),
              title: `Incident Reported: ${typeLabels[incidentType as keyof typeof typeLabels]}`,
              message: `Your incident report has been submitted to local authorities. Incident ID: ${result.incident.id}`,
              location: stats.currentLocation,
              severity: 'warning',
              timestamp: new Date().toISOString(),
              acknowledged: false
            };
            setSafetyAlerts(prev => [newAlert, ...prev]);
            
            // Show notification
            if (typeof window !== 'undefined') {
              const { notificationService } = await import('@/lib/notifications');
              notificationService.showIncidentResponse(
                `Incident report submitted: ${typeLabels[incidentType as keyof typeof typeLabels]}`,
                result.incident.id
              );
            }
            
            alert(`✅ Incident Report Submitted\n\nType: ${typeLabels[incidentType as keyof typeof typeLabels]}\nLocation: ${stats.currentLocation}\nIncident ID: ${result.incident.id.slice(-6)}\n\nAuthorities have been notified.`);
          } else {
            throw new Error('Failed to submit incident report');
          }
        } catch (error) {
          console.error('Error reporting incident:', error);
          alert('❌ Failed to submit incident report. Please try again or call emergency services directly.');
        }
      }
    }
  };
  
  const handleFindSafePlaces = () => {
    const safePlaces = [
      { name: 'Tourist Police Station', distance: '0.2 km', type: 'Police Station' },
      { name: 'Max Hospital', distance: '0.5 km', type: 'Hospital' },
      { name: 'Hotel Imperial', distance: '0.3 km', type: 'Hotel' },
      { name: 'Delhi Metro Station', distance: '0.1 km', type: 'Transportation' },
      { name: 'India Gate Police Post', distance: '0.4 km', type: 'Security Post' },
      { name: 'Government Tourist Office', distance: '0.6 km', type: 'Tourist Help' }
    ];
    
    const safeList = safePlaces.map((place, index) => 
      `${index + 1}. ${place.name} (${place.type})\n   📍 ${place.distance} away`
    ).join('\n\n');
    
    const choice = prompt(
      `🏛️ SAFE PLACES NEARBY\n\n${safeList}\n\n` +
      `Enter number (1-${safePlaces.length}) to get directions, or Cancel to close:`
    );
    
    if (choice && /^[1-6]$/.test(choice)) {
      const selectedPlace = safePlaces[parseInt(choice) - 1];
      const confirmed = confirm(
        `Navigate to ${selectedPlace.name}?\n\n` +
        `Type: ${selectedPlace.type}\n` +
        `Distance: ${selectedPlace.distance}\n\n` +
        `This will open in your maps app.`
      );
      
      if (confirmed) {
        // In a real app, this would integrate with maps API
        window.open(`https://maps.google.com/?q=${selectedPlace.name}, ${stats.currentLocation}`, '_blank');
        
        // Add to recent activity
        alert(`🗺️ Navigation started to ${selectedPlace.name}\n\nStay safe and follow the marked route!`);
      }
    }
  };
  
  const handleCallPolice = () => {
    const option = prompt(
      `👮 POLICE CONTACT OPTIONS\n\n` +
      `1. Emergency (100) - Immediate danger\n` +
      `2. Tourist Helpline - General assistance\n` +
      `3. Local Police Station\n` +
      `4. Report Non-Emergency Issue\n\n` +
      `Select option (1-4):`
    );
    
    switch(option) {
      case '1':
        if (confirm('⚠️ This will call EMERGENCY POLICE (100)\n\nOnly use for immediate danger!\n\nProceed with emergency call?')) {
          window.open('tel:100');
          alert('📞 Calling Emergency Police (100)...');
        }
        break;
      case '2':
        window.open('tel:1363');
        alert('📞 Calling Tourist Helpline (1363)...');
        break;
      case '3':
        alert('📞 Connecting to nearest police station...\n\nNew Delhi Police Station\n📞 +91-11-23456789');
        window.open('tel:+911123456789');
        break;
      case '4':
        handleReportIncident();
        break;
    }
  };
  
  // Profile management functions
  const handleSaveProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          emergencyContacts: profileData.emergencyContacts
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setEmergencyContacts(profileData.emergencyContacts || []);
        setStats(prev => ({ 
          ...prev, 
          currentLocation: profileData.currentLocation || prev.currentLocation,
          emergencyContacts: profileData.emergencyContacts?.length || prev.emergencyContacts
        }));
        
        // Show success notification
        if (typeof window !== 'undefined') {
          const { notificationService } = await import('@/lib/notifications');
          notificationService.showNotification('Profile Updated', {
            body: 'Your profile has been updated successfully!'
          });
        }
        
        alert('✅ Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('❌ Failed to update profile. Please try again.');
      throw error;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setSafetyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || !['tourist', 'public', 'local_citizen'].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen defi-animated-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-2 xs:px-4 py-2 xs:py-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center space-y-2 xs:space-y-0">
            <div className="w-full xs:w-auto">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground flex items-center space-x-2">
                <Globe className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
                <span className="defi-text-gradient">Yatri Rakshak</span>
              </h1>
              <div className="flex flex-wrap items-center gap-1 xs:gap-2 mt-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Tourist</Badge>
                <Badge variant="outline" className="border-primary/30 text-foreground text-xs hidden xs:inline-flex">Safety: {stats.safetyScore}/100</Badge>
                <Badge variant="outline" className="border-primary/30 text-foreground text-xs">{stats.daysRemaining} days left</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 w-full xs:w-auto justify-between xs:justify-end">
              <Button 
                className="defi-button bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 text-xs xs:text-sm px-2 xs:px-3"
                size="sm"
                onClick={handleEmergencyCall}
              >
                <Phone className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Emergency</span>
                <span className="xs:hidden">SOS</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs xs:text-sm px-2 xs:px-3 hidden sm:flex"
                onClick={handleShareLocation}
              >
                <Share2 className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="hidden md:inline">Share Location</span>
                <span className="md:hidden">Share</span>
              </Button>
              <span className="text-xs xs:text-sm text-foreground/70 hidden md:inline">
                {session.user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="border-border/50 bg-background/50 text-foreground hover:bg-background/80 text-xs xs:text-sm px-2 xs:px-3"
                onClick={() => import('@/lib/auth-utils').then(({ performSignOut }) => performSignOut())}
              >
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 xs:px-4 py-3 xs:py-6">
        {/* Statistics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 xs:mb-6">
          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-3 xs:pt-6 pb-3 xs:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xs:text-sm font-medium text-foreground/70">Safety Score</p>
                  <p className="text-lg xs:text-2xl font-bold text-green-400">{stats.safetyScore}/100</p>
                </div>
                <Shield className="w-4 h-4 xs:w-6 xs:h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="places" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Places</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Safety</span>
              <span className="sm:hidden">Safe</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Emergency</span>
              <span className="sm:hidden">SOS</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3">
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Me</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 sm:space-y-4">
            {/* Weather Widget */}
            {weatherData && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-500">{weatherData.current.temperature}°</span>
                      </div>
                      <span>Weather</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {weatherData.current.description}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs xs:text-sm text-muted-foreground">Feels like</p>
                      <p className="font-semibold">{weatherData.current.feelsLike}°C</p>
                    </div>
                    <div>
                      <p className="text-xs xs:text-sm text-muted-foreground">Humidity</p>
                      <p className="font-semibold">{weatherData.current.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-xs xs:text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs xs:text-sm text-muted-foreground">UV Index</p>
                      <p className="font-semibold">{weatherData.current.uvIndex}</p>
                    </div>
                  </div>
                  {weatherData.safetyTips && weatherData.safetyTips.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Weather Safety Tips:
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        {weatherData.safetyTips.slice(0, 2).map((tip: string, index: number) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-3 xs:gap-6 md:grid-cols-2">
              {/* Safety Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Safety Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 xs:space-y-3">
                  {safetyAlerts.filter(alert => !alert.acknowledged).map(alert => (
                    <div key={alert.id} className="p-2 xs:p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2 mb-1">
                            <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium text-sm xs:text-base truncate">{alert.title}</h4>
                          </div>
                          <p className="text-xs xs:text-sm text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-shrink-0 h-8 w-8 xs:h-auto xs:w-auto xs:px-3"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span className="hidden xs:inline ml-1">OK</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {safetyAlerts.filter(alert => !alert.acknowledged).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No active safety alerts
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 xs:gap-3">
                    <Button onClick={handleReportIncident} className="h-16 xs:h-20 flex-col space-y-1 xs:space-y-2 text-xs xs:text-sm">
                      <Camera className="w-4 h-4 xs:w-6 xs:h-6" />
                      <span className="hidden xs:inline">Report Incident</span>
                      <span className="xs:hidden">Report</span>
                    </Button>
                    <Button onClick={handleFindSafePlaces} variant="outline" className="h-16 xs:h-20 flex-col space-y-1 xs:space-y-2 text-xs xs:text-sm">
                      <Map className="w-4 h-4 xs:w-6 xs:h-6" />
                      <span className="hidden xs:inline">Find Safe Places</span>
                      <span className="xs:hidden">Safe Places</span>
                    </Button>
                    <Button onClick={handleCallPolice} variant="outline" className="h-16 xs:h-20 flex-col space-y-1 xs:space-y-2 text-xs xs:text-sm">
                      <Phone className="w-4 h-4 xs:w-6 xs:h-6" />
                      <span className="hidden xs:inline">Call Police</span>
                      <span className="xs:hidden">Police</span>
                    </Button>
                    <Button onClick={handleShareLocation} variant="outline" className="h-16 xs:h-20 flex-col space-y-1 xs:space-y-2 text-xs xs:text-sm">
                      <Share2 className="w-4 h-4 xs:w-6 xs:h-6" />
                      <span className="hidden xs:inline">Share Location</span>
                      <span className="xs:hidden">Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Visited Red Fort</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="outline">Safe</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <PhotoIcon className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Shared photos from India Gate</p>
                      <p className="text-sm text-muted-foreground">4 hours ago</p>
                    </div>
                    <Badge variant="outline">2 photos</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">Received safety alert</p>
                      <p className="text-sm text-muted-foreground">6 hours ago</p>
                    </div>
                    <Badge variant="outline">Warning</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Visit Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Daily Visit Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visitTrendsLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : visitTrendsError ? (
                    <div className="flex items-center justify-center h-[300px] text-red-500">
                      <AlertCircle className="w-6 h-6 mr-2" />
                      <span>Error loading visit trends</span>
                    </div>
                  ) : (
                    <BarChartComponent 
                      data={visitTrendData || []} 
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Safety Score Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Safety Score Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {safetyTrendsLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : safetyTrendsError ? (
                    <div className="flex items-center justify-center h-[300px] text-red-500">
                      <AlertCircle className="w-6 h-6 mr-2" />
                      <span>Error loading safety trends</span>
                    </div>
                  ) : (
                    <LineChartComponent 
                      data={safetyScoreData || []}
                      dataKey="value"
                      strokeColor="#10B981"
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Place Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Places Visited by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {placeTypesLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : placeTypesError ? (
                    <div className="flex items-center justify-center h-[300px] text-red-500">
                      <AlertCircle className="w-6 h-6 mr-2" />
                      <span>Error loading place types</span>
                    </div>
                  ) : (
                    <BarChartComponent 
                      data={placeTypeData || []}
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Area Safety Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Safety Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <IndiaMapComponent />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="places" className="space-y-3 xs:space-y-4">
            {/* Interactive Map */}
            <UniversalMap 
              allowLocationSharing={true}
              showUserTracking={false}
              className="mb-6"
            />
            
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center space-y-3 xs:space-y-0">
              <div className="w-full xs:w-auto">
                <h2 className="text-lg xs:text-xl font-semibold">Places & Attractions</h2>
                <p className="text-xs xs:text-sm text-muted-foreground">
                  Discover and track your visited places
                </p>
              </div>
              <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 w-full xs:w-auto">
                <Input 
                  placeholder="Search places..." 
                  className="w-full xs:w-48 lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-border bg-background text-foreground rounded-md text-xs xs:text-sm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="all">All Places</option>
                    <option value="visited">Visited</option>
                    <option value="planned">Planned</option>
                    <option value="monument">Monuments</option>
                    <option value="market">Markets</option>
                    <option value="restaurant">Restaurants</option>
                    <option value="hotel">Hotels</option>
                    <option value="transport">Transport</option>
                  </select>
                  <Button 
                    onClick={() => {
                      const placeName = prompt('🏨 ADD NEW PLACE\n\nEnter place name:');
                      if (placeName) {
                        const address = prompt(`Enter address for ${placeName}:`);
                        if (address) {
                          const newPlace: TouristLocation = {
                            id: Date.now().toString(),
                            name: placeName,
                            type: 'other',
                            address: address,
                            coordinates: { lat: 28.6139 + Math.random() * 0.01, lng: 77.2090 + Math.random() * 0.01 },
                            rating: 4.0,
                            safetyLevel: 'safe',
                            visited: false,
                            notes: 'Added by user'
                          };
                          
                          setLocations(prev => [...prev, newPlace]);
                          setStats(prev => ({ ...prev, placesVisited: prev.placesVisited + 1 }));
                          alert(`✅ ${placeName} added successfully!\n\nYou can now navigate to and track this place.`);
                        }
                      }
                    }}
                    size="sm" 
                    className="flex-1 xs:flex-none"
                  >
                    <Plus className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                    <span className="hidden xs:inline">Add Place</span>
                    <span className="xs:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 xs:gap-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map(location => (
                <Card key={location.id} className="border-l-4 border-l-blue-500 overflow-hidden">
                  <CardContent className="pt-3 xs:pt-6 p-3 xs:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 mb-3">
                          <h3 className="font-semibold text-base xs:text-lg truncate">{location.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getSafetyColor(location.safetyLevel)} text-xs`}>
                              {location.safetyLevel.toUpperCase()}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 xs:w-4 xs:h-4 text-yellow-500 fill-current" />
                              <span className="text-xs xs:text-sm">{location.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm xs:text-base break-words">{location.address}</p>
                        
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-4 text-xs xs:text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                            <span className="truncate">{location.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                            <span className="truncate">{location.visited ? 'Visited' : 'Not visited'}</span>
                          </div>
                          {location.photos && (
                            <div className="flex items-center space-x-1">
                              <PhotoIcon className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                              <span className="truncate">{location.photos.length} photos</span>
                            </div>
                          )}
                        </div>

                        {location.notes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <p className="text-xs xs:text-sm break-words">
                              <strong>Notes:</strong> {location.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-4 overflow-x-auto lg:overflow-x-visible">
                        <Button 
                          onClick={() => {
                            const googleMapsUrl = `https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`;
                            window.open(googleMapsUrl, '_blank');
                            alert(`🗺️ Opening navigation to ${location.name}\n\nOpening in Google Maps...`);
                          }}
                          size="sm" 
                          className="flex-shrink-0 text-xs"
                        >
                          <Navigation className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span className="hidden xs:inline">Navigate</span>
                          <span className="xs:hidden">Nav</span>
                        </Button>
                        <Button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                try {
                                  const formData = new FormData();
                                  formData.append('photo', file);
                                  formData.append('locationId', location.id);
                                  formData.append('description', `Photo at ${location.name}`);
                                  
                                  const response = await fetch('/api/photos/upload', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  
                                  if (response.ok) {
                                    const result = await response.json();
                                    
                                    // Update location with new photo
                                    setLocations(prev => prev.map(loc => 
                                      loc.id === location.id 
                                        ? { ...loc, photos: [...(loc.photos || []), result.photo.filename] }
                                        : loc
                                    ));
                                    
                                    // Update stats
                                    setStats(prev => ({ ...prev, photosShared: prev.photosShared + 1 }));
                                    
                                    alert(`📷 Photo uploaded successfully!\n\nAdded to ${location.name}`);
                                  } else {
                                    throw new Error('Upload failed');
                                  }
                                } catch (error) {
                                  console.error('Photo upload error:', error);
                                  alert('❌ Failed to upload photo. Please try again.');
                                }
                              }
                            };
                            input.click();
                          }}
                          size="sm" 
                          variant="outline" 
                          className="flex-shrink-0 text-xs"
                        >
                          <PhotoIcon className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span className="hidden xs:inline">Add Photo</span>
                          <span className="xs:hidden">Photo</span>
                        </Button>
                        <Button 
                          onClick={() => {
                            const newNotes = prompt(`Edit notes for ${location.name}:`, location.notes || '');
                            if (newNotes !== null) {
                              setLocations(prev => prev.map(loc => 
                                loc.id === location.id 
                                  ? { ...loc, notes: newNotes }
                                  : loc
                              ));
                              alert(`✏️ Notes updated for ${location.name}`);
                            }
                          }}
                          size="sm" 
                          variant="outline" 
                          className="flex-shrink-0 text-xs"
                        >
                          <Edit className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span className="hidden xs:inline">Edit Notes</span>
                          <span className="xs:hidden">Edit</span>
                        </Button>
                        <Button 
                          onClick={async () => {
                            const shareData = {
                              title: `${location.name} - Yatri Rakshak`,
                              text: `Check out ${location.name}! ${location.notes ? location.notes + ' ' : ''}Located at ${location.address}. Rating: ${location.rating}/5`,
                              url: `https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`
                            };
                            
                            if (navigator.share) {
                              try {
                                await navigator.share(shareData);
                              } catch (error) {
                                console.log('Share cancelled');
                              }
                            } else {
                              navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
                              alert(`📍 Location details for ${location.name} copied to clipboard!`);
                            }
                          }}
                          size="sm" 
                          variant="outline" 
                          className="flex-shrink-0 text-xs"
                        >
                          <Share2 className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                          <span className="hidden xs:inline">Share</span>
                          <span className="xs:hidden">Share</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery.trim() 
                      ? `No places found matching "${searchQuery}"`
                      : `No ${locationFilter} places found`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Safety Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      General Safety Tips
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Keep emergency contacts handy</li>
                      <li>• Share your location with trusted contacts</li>
                      <li>• Avoid isolated areas after dark</li>
                      <li>• Keep copies of important documents</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Tourist-Specific Tips
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Use registered tour guides</li>
                      <li>• Be cautious with street vendors</li>
                      <li>• Keep valuables in hotel safe</li>
                      <li>• Learn basic local phrases</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Emergency Procedures</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        if (confirm('🚨 Calling Emergency Police (100)\n\nThis is for immediate danger only!')) {
                          window.open('tel:100');
                          alert('📞 Calling Police Emergency...');
                        }
                      }}
                      className="w-full justify-start" 
                      variant="destructive"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Police (100)
                    </Button>
                    <Button 
                      onClick={() => {
                        if (confirm('🚑 Calling Medical Emergency (108)\n\nFor medical emergencies and ambulance.')) {
                          window.open('tel:108');
                          alert('📞 Calling Medical Emergency...');
                        }
                      }}
                      className="w-full justify-start" 
                      variant="destructive"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Medical (108)
                    </Button>
                    <Button 
                      onClick={async () => {
                        try {
                          const location = await getCurrentLocation();
                          const sosMessage = `🆘 SOS ALERT 🆘\n\nI need immediate help!\n\nLocation: ${stats.currentLocation}\nCoordinates: ${location.lat}, ${location.lng}\nTime: ${new Date().toLocaleString()}\n\nPlease contact authorities!\n\nSent via Yatri Rakshak`;
                          
                          if (navigator.share) {
                            await navigator.share({
                              title: '🆘 SOS EMERGENCY ALERT',
                              text: sosMessage
                            });
                          } else {
                            navigator.clipboard.writeText(sosMessage);
                            alert('🆘 SOS message copied to clipboard!\n\nPaste and send to your emergency contacts.');
                          }
                        } catch (error) {
                          alert('❌ Unable to generate SOS message. Please call emergency services directly.');
                        }
                      }}
                      className="w-full justify-start" 
                      variant="outline"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send SOS Message
                    </Button>
                    <Button 
                      onClick={handleShareLocation}
                      className="w-full justify-start" 
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Live Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Emergency Contacts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="mb-4">
                    <Button 
                      onClick={() => setIsProfileEditOpen(true)}
                      size="sm" 
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Emergency Contacts
                    </Button>
                  </div>
                  
                  {emergencyContacts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No emergency contacts added yet</p>
                      <p className="text-xs">Click "Manage Emergency Contacts" above to add contacts</p>
                    </div>
                  )}
                  
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Button 
                            onClick={() => {
                              window.open(`tel:${contact.phone}`);
                              alert(`📞 Calling ${contact.name}...`);
                            }}
                            size="sm" 
                            variant="outline"
                            title={`Call ${contact.name}`}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button 
                            onClick={() => {
                              const message = `Hi ${contact.name}, I'm currently at ${stats.currentLocation}. This is an update from my Yatri Rakshak app. I'm safe and wanted you to know my location.`;
                              const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
                              window.open(smsUrl);
                            }}
                            size="sm" 
                            variant="outline"
                            title={`Send message to ${contact.name}`}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {contact.isLocal && (
                        <Badge className="bg-green-100 text-green-800 mt-2">
                          Local Contact
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Emergency Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Police</h4>
                          <p className="text-sm text-muted-foreground">Emergency response</p>
                        </div>
                        <Button 
                          onClick={() => {
                            if (confirm('🚨 Emergency Police Call\n\nThis will call 100 for immediate police assistance.\n\nProceed?')) {
                              window.open('tel:100');
                              alert('📞 Calling Police Emergency (100)...');
                            }
                          }}
                          size="sm" 
                          variant="destructive"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          100
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Medical Emergency</h4>
                          <p className="text-sm text-muted-foreground">Ambulance service</p>
                        </div>
                        <Button 
                          onClick={() => {
                            if (confirm('🚑 Medical Emergency Call\n\nThis will call 108 for ambulance and medical assistance.\n\nProceed?')) {
                              window.open('tel:108');
                              alert('📞 Calling Medical Emergency (108)...');
                            }
                          }}
                          size="sm" 
                          variant="destructive"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          108
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Fire Department</h4>
                          <p className="text-sm text-muted-foreground">Fire emergency</p>
                        </div>
                        <Button 
                          onClick={() => {
                            if (confirm('🚒 Fire Emergency Call\n\nThis will call 101 for fire department assistance.\n\nProceed?')) {
                              window.open('tel:101');
                              alert('📞 Calling Fire Emergency (101)...');
                            }
                          }}
                          size="sm" 
                          variant="destructive"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          101
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Tourist Profile</span>
                </CardTitle>
                <CardDescription>
                  Manage your tourist information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input value={session.user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={session.user.email} disabled />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Location</label>
                  <Input value={stats.currentLocation} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Safety Score</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.safetyScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{stats.safetyScore}/100</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsProfileEditOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const travelReport = {
                        user: session?.user.name,
                        email: session?.user.email,
                        tripDuration: `${30 - stats.daysRemaining} days`,
                        placesVisited: stats.placesVisited,
                        photosShared: stats.photosShared,
                        safetyScore: stats.safetyScore,
                        currentLocation: stats.currentLocation,
                        visitedLocations: locations.filter(loc => loc.visited).map(loc => loc.name),
                        generatedOn: new Date().toLocaleString()
                      };
                      
                      const reportContent = `🏨 YATRI RAKSHAK TRAVEL REPORT\n\n` +
                        `Tourist: ${travelReport.user}\n` +
                        `Email: ${travelReport.email}\n` +
                        `Trip Duration: ${travelReport.tripDuration}\n` +
                        `Current Location: ${travelReport.currentLocation}\n\n` +
                        `📊 STATISTICS:\n` +
                        `Safety Score: ${travelReport.safetyScore}/100\n` +
                        `Places Visited: ${travelReport.placesVisited}\n` +
                        `Photos Shared: ${travelReport.photosShared}\n\n` +
                        `🗺️ PLACES VISITED:\n${travelReport.visitedLocations.map(place => `• ${place}`).join('\n')}\n\n` +
                        `Generated: ${travelReport.generatedOn}\n\n` +
                        `This report was generated by Yatri Rakshak - Your Travel Safety Companion`;
                      
                      // Create and download file
                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `yatri-rakshak-report-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      alert('📋 Travel report downloaded!\n\nYour complete travel summary has been saved.');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Travel Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        onSave={handleSaveProfile}
        initialData={{
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          phone: userProfile?.phone || '',
          currentLocation: stats.currentLocation,
          emergencyContacts: emergencyContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            isLocal: contact.isLocal
          }))
        }}
      />
    </div>
  );
}
