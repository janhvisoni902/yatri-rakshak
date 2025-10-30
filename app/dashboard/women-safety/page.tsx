'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { 
  Shield, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle,
  Heart,
  Camera,
  Mic,
  Video,
  Share2,
  Bell,
  Navigation,
  Eye,
  Lock,
  UserCheck,
  MessageCircle,
  Zap,
  Star,
  Globe,
  Calendar,
  Settings,
  Download,
  Upload,
  Play,
  Square,
  Volume2,
  VolumeX,
  Flashlight,
  FlashlightOff,
  Smartphone,
  Headphones,
  Radio,
  Siren,
  Activity
} from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';
import SafetyMap from '@/components/maps/SafetyMap';
import MapTest from '@/components/maps/MapTest';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: 'primary' | 'secondary' | 'emergency';
  verified: boolean;
}

interface SafetyZone {
  id: string;
  name: string;
  type: 'safe_house' | 'police_station' | 'hospital' | 'embassy' | 'hotel' | 'public_place';
  address: string;
  coordinates: { lat: number; lng: number };
  distance: string;
  rating: number;
  verified: boolean;
  contact?: string;
  hours?: string;
}

interface SafetyAlert {
  id: string;
  type: 'harassment' | 'stalking' | 'unsafe_area' | 'emergency' | 'suspicious_activity';
  message: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  status: 'active' | 'resolved' | 'investigating';
  distance?: string | number;
  distanceFormatted?: string;
  timeAgo?: string;
}

export default function WomenSafetyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('emergency');
  const [isRecording, setIsRecording] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Mom',
      relationship: 'Mother',
      phone: '+91-9876543210',
      email: 'mom@example.com',
      priority: 'primary',
      verified: true
    },
    {
      id: '2',
      name: 'Dad',
      relationship: 'Father',
      phone: '+91-9876543211',
      priority: 'primary',
      verified: true
    },
    {
      id: '3',
      name: 'Best Friend',
      relationship: 'Friend',
      phone: '+91-9876543212',
      email: 'friend@example.com',
      priority: 'secondary',
      verified: true
    },
    {
      id: '4',
      name: 'Women Helpline',
      relationship: 'Emergency Service',
      phone: '1091',
      priority: 'emergency',
      verified: true
    }
  ]);

  const [nearbyZones, setNearbyZones] = useState<SafetyZone[]>([
    {
      id: '1',
      name: 'Delhi Police Station - CP',
      type: 'police_station',
      address: 'Connaught Place, New Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      distance: '0.5 km',
      rating: 4.8,
      verified: true,
      contact: '011-23341234',
      hours: '24/7'
    },
    {
      id: '2',
      name: 'AIIMS Emergency',
      type: 'hospital',
      address: 'All India Institute of Medical Sciences',
      coordinates: { lat: 28.5672, lng: 77.2100 },
      distance: '2.1 km',
      rating: 4.9,
      verified: true,
      contact: '011-26588500',
      hours: '24/7'
    },
    {
      id: '3',
      name: 'Women Safety Center',
      type: 'safe_house',
      address: 'Janpath, New Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      distance: '1.2 km',
      rating: 4.7,
      verified: true,
      contact: '011-23388888',
      hours: '24/7'
    }
  ]);

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([
    {
      id: '1',
      type: 'harassment',
      message: 'Multiple reports of harassment near Metro Station',
      location: 'Rajiv Chowk Metro Station',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      timestamp: '2025-01-04T14:30:00Z',
      severity: 'high',
      reportedBy: 'Anonymous User',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'unsafe_area',
      message: 'Poor lighting and isolated area reported',
      location: 'Lodhi Gardens - East Gate',
      coordinates: { lat: 28.5918, lng: 77.2273 },
      timestamp: '2025-01-04T13:15:00Z',
      severity: 'medium',
      reportedBy: 'Community Report',
      status: 'active'
    }
  ]);

  // Get current location and fetch nearby data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Fetch nearby safety zones and alerts
          fetchNearbySafetyZones(location.lat, location.lng);
          fetchNearbySafetyAlerts(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default Delhi location if geolocation fails
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setCurrentLocation(defaultLocation);
          fetchNearbySafetyZones(defaultLocation.lat, defaultLocation.lng);
          fetchNearbySafetyAlerts(defaultLocation.lat, defaultLocation.lng);
        }
      );
    }
  }, []);

  // Fetch nearby safety zones
  const fetchNearbySafetyZones = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/safety-zones?lat=${lat}&lng=${lng}&radius=5`);
      const data = await response.json();
      if (data.success) {
        setNearbyZones(data.zones);
      }
    } catch (error) {
      console.error('Error fetching safety zones:', error);
    }
  };

  // Fetch nearby safety alerts
  const fetchNearbySafetyAlerts = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/safety-alerts?lat=${lat}&lng=${lng}&radius=10`);
      const data = await response.json();
      if (data.success) {
        setSafetyAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching safety alerts:', error);
    }
  };

  // Emergency SOS function
  const triggerEmergencySOS = useCallback(async () => {
    try {
      // Send emergency alert to all primary contacts
      const primaryContacts = emergencyContacts.filter(c => c.priority === 'primary');
      
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Send SOS with location
          await fetch('/api/emergency/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'women_safety_sos',
              location,
              contacts: primaryContacts,
              timestamp: new Date().toISOString()
            })
          });

          // Start siren
          startSiren();
          
          // Start live tracking
          setIsLiveTracking(true);
          
          // Vibrate device
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
        });
      }
    } catch (error) {
      console.error('Emergency SOS failed:', error);
    }
  }, [emergencyContacts]);

  // Audio recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Upload to secure cloud storage
        const formData = new FormData();
        formData.append('audio', audioBlob, `emergency-${Date.now()}.wav`);
        
        await fetch('/api/emergency/audio-upload', {
          method: 'POST',
          body: formData
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Siren functions
  const startSiren = useCallback(() => {
    if (!sirenAudioRef.current) {
      // Create audio context for siren sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      
      // Alternate frequency for siren effect
      setInterval(() => {
        if (isSirenActive) {
          oscillator.frequency.setValueAtTime(
            oscillator.frequency.value === 800 ? 1200 : 800,
            audioContext.currentTime
          );
        }
      }, 500);
    }
    setIsSirenActive(true);
  }, [isSirenActive]);

  const stopSiren = useCallback(() => {
    setIsSirenActive(false);
  }, []);

  // Flashlight toggle
  const toggleFlashlight = useCallback(async () => {
    try {
      if (!isFlashlightOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        const track = stream.getVideoTracks()[0];
        await track.applyConstraints({
          advanced: [{ torch: true } as any]
        });
        setIsFlashlightOn(true);
      } else {
        setIsFlashlightOn(false);
      }
    } catch (error) {
      console.error('Flashlight toggle failed:', error);
    }
  }, [isFlashlightOn]);

  // Share live location
  const shareLiveLocation = useCallback(async () => {
    if (currentLocation) {
      const locationUrl = `https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Current Location - Emergency',
          text: 'I need help! This is my current location.',
          url: locationUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(locationUrl);
        alert('Location copied to clipboard!');
      }
    }
  }, [currentLocation]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case 'police_station': return <Shield className="w-4 h-4" />;
      case 'hospital': return <Heart className="w-4 h-4" />;
      case 'safe_house': return <Users className="w-4 h-4" />;
      case 'embassy': return <Globe className="w-4 h-4" />;
      case 'hotel': return <MapPin className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-pink-600">Women Safety Center</h1>
                <p className="text-sm text-muted-foreground">Your safety is our priority</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20">
                Protected Mode
              </Badge>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Emergency Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button 
            onClick={triggerEmergencySOS}
            className="h-20 bg-red-600 hover:bg-red-700 text-white flex-col space-y-2"
          >
            <Siren className="w-6 h-6" />
            <span className="text-sm font-bold">SOS EMERGENCY</span>
          </Button>
          
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "outline"}
            className="h-20 flex-col space-y-2"
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-sm">{isRecording ? 'Stop Recording' : 'Record Audio'}</span>
          </Button>
          
          <Button 
            onClick={toggleFlashlight}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            {isFlashlightOn ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
            <span className="text-sm">Flashlight</span>
          </Button>
          
          <Button 
            onClick={shareLiveLocation}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-sm">Share Location</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="safety-zones">Safe Zones</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="map-test">Map Test</TabsTrigger>
          </TabsList>

          <TabsContent value="emergency" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Emergency Features */}
              <Card className="border-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-600">Emergency Features</CardTitle>
                  <CardDescription>Quick access to safety tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-16 flex-col space-y-1">
                      <Camera className="w-5 h-5" />
                      <span className="text-xs">Photo Evidence</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col space-y-1">
                      <Video className="w-5 h-5" />
                      <span className="text-xs">Video Record</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col space-y-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">Quick SMS</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col space-y-1">
                      <Eye className="w-5 h-5" />
                      <span className="text-xs">Fake Call</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Live Tracking Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5" />
                    <span>Live Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge className={isLiveTracking ? 'bg-green-500' : 'bg-gray-500'}>
                        {isLiveTracking ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {currentLocation && (
                      <div className="text-sm text-muted-foreground">
                        <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                        <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                      </div>
                    )}
                    <Button 
                      onClick={() => setIsLiveTracking(!isLiveTracking)}
                      className="w-full"
                      variant={isLiveTracking ? "destructive" : "default"}
                    >
                      {isLiveTracking ? 'Stop Tracking' : 'Start Live Tracking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips for Women Travelers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-pink-600">Before You Go:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Share your itinerary with trusted contacts</li>
                      <li>• Research safe areas and accommodations</li>
                      <li>• Keep emergency numbers handy</li>
                      <li>• Inform someone about your daily plans</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-pink-600">While Traveling:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Trust your instincts</li>
                      <li>• Stay in well-lit, populated areas</li>
                      <li>• Keep your phone charged</li>
                      <li>• Use official transportation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              <Button>
                <UserCheck className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            <div className="grid gap-4">
              {emergencyContacts.map(contact => (
                <Card key={contact.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          contact.priority === 'primary' ? 'bg-red-100 text-red-600' :
                          contact.priority === 'secondary' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          <p className="text-sm font-mono">{contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.verified && (
                          <Badge className="bg-green-500">Verified</Badge>
                        )}
                        <Badge className={
                          contact.priority === 'primary' ? 'bg-red-500' :
                          contact.priority === 'secondary' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }>
                          {contact.priority}
                        </Badge>
                        <Button size="sm" onClick={() => window.open(`tel:${contact.phone}`)}>
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="safety-zones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Nearby Safety Zones</h2>
              <Button variant="outline" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setCurrentLocation(location);
                    fetchNearbySafetyZones(location.lat, location.lng);
                  });
                }
              }}>
                <Navigation className="w-4 h-4 mr-2" />
                Refresh Location
              </Button>
            </div>

            {/* Safety Map */}
            <SafetyMap
              currentLocation={currentLocation}
              safetyZones={nearbyZones}
              safetyAlerts={safetyAlerts}
              onZoneSelect={(zone) => console.log('Selected zone:', zone)}
              onAlertSelect={(alert) => console.log('Selected alert:', alert)}
            />

            <div className="grid gap-4">
              {nearbyZones.map(zone => (
                <Card key={zone.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          {getZoneTypeIcon(zone.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{zone.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{zone.address}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{zone.distance}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{zone.rating}</span>
                            </span>
                            {zone.hours && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{zone.hours}</span>
                              </span>
                            )}
                          </div>
                          {zone.contact && (
                            <p className="text-sm font-mono mt-1">{zone.contact}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {zone.verified && (
                          <Badge className="bg-green-500">Verified</Badge>
                        )}
                        <Button size="sm" onClick={() => window.open(`tel:${zone.contact}`)}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Safety Alerts</h2>
              <Button>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>

            <div className="grid gap-4">
              {safetyAlerts.map(alert => (
                <Card key={alert.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={
                            alert.status === 'active' ? 'bg-red-500' :
                            alert.status === 'investigating' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{alert.message}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </span>
                          <span>By: {alert.reportedBy}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map-test" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Google Maps Integration Test</h2>
            </div>
            <MapTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}