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
import { Switch } from '@/components/switch';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  MapPin, 
  Clock, 
  Navigation,
  Heart,
  Smartphone,
  Users,
  Eye,
  AlertCircle,
  Siren,
  Globe,
  QrCode,
  Zap,
  CheckCircle,
  XCircle,
  Star,
  Route,
  Camera,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface TouristData {
  digitalId: string;
  safetyScore: number;
  currentLocation: { lat: number; lng: number; };
  visitDuration: number;
  itinerary: Array<{ name: string; status: string; }>;
  emergencyContacts: Array<{ name: string; phone: string; }>;
}

interface SafetyAlert {
  id: string;
  type: 'geo_fence' | 'anomaly' | 'weather' | 'security';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

export default function TouristDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [touristData, setTouristData] = useState<TouristData>({
    digitalId: 'TID-2025-001234',
    safetyScore: 85,
    currentLocation: { lat: 26.9124, lng: 75.7873 }, // Jaipur coordinates
    visitDuration: 3,
    itinerary: [
      { name: 'Hawa Mahal', status: 'completed' },
      { name: 'City Palace', status: 'current' },
      { name: 'Amber Fort', status: 'upcoming' }
    ],
    emergencyContacts: [
      { name: 'Tourist Helpline', phone: '1363' },
      { name: 'Local Emergency', phone: '112' }
    ]
  });
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([
    {
      id: '1',
      type: 'geo_fence',
      message: 'You are approaching a high-risk area. Please exercise caution.',
      severity: 'medium',
      timestamp: new Date(),
      acknowledged: false
    }
  ]);
  const [currentLocation, setCurrentLocation] = useState({ lat: 26.9124, lng: 75.7873 });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session.user.role !== 'tourist' && session.user.role !== 'local_citizen') {
      router.push('/dashboard/admin');
      return;
    }
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Update tourist data location
          setTouristData(prev => ({
            ...prev,
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => console.log('Location access denied')
      );
    }
  }, [session, status, router]);

  const handlePanicButton = () => {
    setIsPanicMode(true);
    // Send emergency alert
    alert('EMERGENCY ALERT SENT!\n\n✓ Location shared with authorities\n✓ Emergency contacts notified\n✓ Nearest police station alerted\n\nHelp is on the way!');
    
    // Simulate emergency response
    setTimeout(() => {
      setIsPanicMode(false);
    }, 5000);
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSafetyScoreLabel = (score: number) => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Caution';
    return 'High Risk';
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

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
              <p className="text-muted-foreground">Smart Tourist Safety System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <QrCode className="w-4 h-4" />
                <span>{touristData.digitalId}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user.name}
              </span>
              <Button 
                variant="outline" 
                onClick={() => router.push('/api/auth/signout')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Panic Button - Always Visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
            isPanicMode 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
          onClick={handlePanicButton}
          disabled={isPanicMode}
        >
          <Siren className="w-8 h-8" />
        </Button>
        {isPanicMode && (
          <div className="absolute -top-16 -left-20 bg-red-500 text-white px-4 py-2 rounded-lg animate-bounce">
            Emergency Alert Sent!
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Safety Alerts */}
        {safetyAlerts.filter(alert => !alert.acknowledged).length > 0 && (
          <div className="mb-6">
            {safetyAlerts.filter(alert => !alert.acknowledged).map(alert => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSafetyAlerts(prev => 
                          prev.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a)
                        );
                      }}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'safety', label: 'Safety Status', icon: Shield },
            { key: 'itinerary', label: 'My Journey', icon: Route },
            { key: 'emergency', label: 'Emergency', icon: AlertCircle },
            { key: 'settings', label: 'Settings', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Safety Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Safety Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getSafetyScoreColor(touristData.safetyScore)}`}>
                    {touristData.safetyScore}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`mt-2 ${getSafetyScoreColor(touristData.safetyScore)}`}
                  >
                    {getSafetyScoreLabel(touristData.safetyScore)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on location, time, and activity patterns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-green-500" />
                  <span>Current Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Jaipur, Rajasthan</p>
                  <p className="text-sm text-muted-foreground">
                    Tourist Zone - Safe Area
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Live Tracking</span>
                    <Switch 
                      checked={isTracking}
                      onCheckedChange={setIsTracking}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Digital ID */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-purple-500" />
                  <span>Digital Tourist ID</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-12 h-12" />
                </div>
                <p className="text-sm font-mono">{touristData.digitalId}</p>
                <Badge variant="secondary" className="mt-2">
                  Verified ✓
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Travel Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{touristData.visitDuration}</div>
                    <p className="text-sm text-muted-foreground">Days in India</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">5</div>
                    <p className="text-sm text-muted-foreground">Places Visited</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">0</div>
                    <p className="text-sm text-muted-foreground">Safety Incidents</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">2</div>
                    <p className="text-sm text-muted-foreground">Upcoming Destinations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Area Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Current Area Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Crime Rate</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tourist Density</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weather Conditions</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Local Alerts</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">1 Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {touristData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{contact.name}</span>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        {contact.phone}
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full mt-4" variant="destructive">
                    <Siren className="w-4 h-4 mr-2" />
                    EMERGENCY SOS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Features */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Safety Features Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Navigation className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">GPS Tracking</p>
                    <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Geo-Fencing</p>
                    <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">Enabled</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">AI Monitoring</p>
                    <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800">Active</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Family Sharing</p>
                    <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="w-5 h-5 text-blue-500" />
                  <span>My Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {touristData.itinerary.map((destination, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        destination.status === 'completed' ? 'bg-green-100 text-green-600' :
                        destination.status === 'current' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {destination.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                         destination.status === 'current' ? <Navigation className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{destination.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{destination.status}</p>
                      </div>
                      {destination.status === 'current' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Current Location
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="destructive" 
                  size="lg"
                  onClick={handlePanicButton}
                >
                  <Siren className="w-5 h-5 mr-2" />
                  PANIC BUTTON
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Tourist Helpline (1363)
                </Button>
                <Button className="w-full" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Share Live Location
                </Button>
                <Button className="w-full" variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Quick Photo Evidence
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>In case of emergency:</strong><br />
                    • Press the panic button<br />
                    • Your location will be shared automatically<br />
                    • Nearest authorities will be notified<br />
                    • Emergency contacts will receive alerts
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nearest Hospital:</span>
                    <span className="font-medium">2.3 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Police Station:</span>
                    <span className="font-medium">1.8 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tourist Help Center:</span>
                    <span className="font-medium">0.5 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Location Tracking</p>
                    <p className="text-sm text-muted-foreground">Allow real-time location sharing</p>
                  </div>
                  <Switch checked={isTracking} onCheckedChange={setIsTracking} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Family Sharing</p>
                    <p className="text-sm text-muted-foreground">Share location with family</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Emergency Auto-Share</p>
                    <p className="text-sm text-muted-foreground">Auto-share in emergencies</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Safety Alerts</p>
                    <p className="text-sm text-muted-foreground">Geo-fence and safety warnings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Journey Updates</p>
                    <p className="text-sm text-muted-foreground">Itinerary reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Weather Alerts</p>
                    <p className="text-sm text-muted-foreground">Weather warnings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
