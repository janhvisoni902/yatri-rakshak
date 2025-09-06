'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Activity
} from 'lucide-react';

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
      name: 'John Smith',
      phone: '+1-555-0123',
      relationship: 'Spouse',
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
  }, [session, status, router]);

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

  const handleEmergencyCall = () => {
    // In a real app, this would trigger emergency services
    alert('Emergency services contacted! Police and medical help are on the way.');
  };

  const handleShareLocation = () => {
    // In a real app, this would share current location with emergency contacts
    alert('Location shared with emergency contacts!');
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Globe className="w-6 h-6 text-primary" />
                <span className="defi-text-gradient">Yatri Rakshak</span>
              </h1>
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">Tourist</Badge>
                <Badge variant="outline" className="border-primary/30 text-foreground">Safety Score: {stats.safetyScore}/100</Badge>
                <Badge variant="outline" className="border-primary/30 text-foreground">{stats.daysRemaining} days remaining</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="defi-button bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                size="sm"
                onClick={handleEmergencyCall}
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                onClick={handleShareLocation}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Location
              </Button>
              <span className="text-sm text-foreground/70">
                Welcome, {session.user.name}
              </span>
              <Button 
                variant="outline" 
                className="border-border/50 bg-background/50 text-foreground hover:bg-background/80"
                onClick={() => router.push('/api/auth/signout')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Safety Score</p>
                  <p className="text-2xl font-bold text-green-400">{stats.safetyScore}/100</p>
                </div>
                <Shield className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Places Visited</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.placesVisited}</p>
                </div>
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Photos Shared</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.photosShared}</p>
                </div>
                <PhotoIcon className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Emergency Contacts</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.emergencyContacts}</p>
                </div>
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Days Remaining</p>
                  <p className="text-2xl font-bold text-red-400">{stats.daysRemaining}</p>
                </div>
                <Calendar className="w-6 h-6 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="defi-card hover:defi-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Current Location</p>
                  <p className="text-sm font-bold text-foreground/80">{stats.currentLocation}</p>
                </div>
                <Compass className="w-6 h-6 text-foreground/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Safety Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Safety Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {safetyAlerts.filter(alert => !alert.acknowledged).map(alert => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="h-20 flex-col space-y-2">
                      <Camera className="w-6 h-6" />
                      <span>Report Incident</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Map className="w-6 h-6" />
                      <span>Find Safe Places</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Phone className="w-6 h-6" />
                      <span>Call Police</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Share2 className="w-6 h-6" />
                      <span>Share Location</span>
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

          <TabsContent value="places" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Places & Attractions</h2>
                <p className="text-sm text-muted-foreground">
                  Discover and track your visited places
                </p>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Search places..." className="w-64" />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Place
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {locations.map(location => (
                <Card key={location.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{location.name}</h3>
                          <Badge className={getSafetyColor(location.safetyLevel)}>
                            {location.safetyLevel.toUpperCase()}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{location.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{location.address}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{location.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>{location.visited ? 'Visited' : 'Not visited'}</span>
                          </div>
                          {location.photos && (
                            <div className="flex items-center space-x-1">
                              <PhotoIcon className="w-4 h-4" />
                              <span>{location.photos.length} photos</span>
                            </div>
                          )}
                        </div>

                        {location.notes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <p className="text-sm">
                              <strong>Notes:</strong> {location.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm">
                          <Navigation className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <PhotoIcon className="w-4 h-4 mr-1" />
                          Add Photo
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Notes
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                    <Button className="w-full justify-start" variant="destructive">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Police (100)
                    </Button>
                    <Button className="w-full justify-start" variant="destructive">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Medical (108)
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send SOS Message
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
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
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4" />
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
                        <Button size="sm" variant="destructive">
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
                        <Button size="sm" variant="destructive">
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
                        <Button size="sm" variant="destructive">
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
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Travel Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}