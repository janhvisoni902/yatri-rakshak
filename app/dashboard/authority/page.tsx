'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Switch } from '@/components/switch';
import { 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  CheckCircle, 
  Clock, 
  MapPin,
  Shield,
  Activity,
  TrendingUp,
  Globe,
  Navigation,
  Eye,
  Siren,
  QrCode,
  UserCheck,
  AlertCircle,
  Zap,
  Brain,
  Radio,
  Heart,
  Battery,
  Signal,
  Camera,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalTourists: number;
  activeTourists: number;
  emergencyAlerts: number;
  missingPersons: number;
  geofenceViolations: number;
  avgSafetyScore: number;
  responseTime: string;
  iotDevicesConnected: number;
}

interface TouristAlert {
  id: string;
  touristId: string;
  touristName: string;
  nationality: string;
  type: 'panic' | 'geo_fence' | 'anomaly' | 'missing' | 'route_deviation' | 'inactive';
  message: string;
  location: { lat: number; lng: number; address: string; };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
  assignedTo?: string;
  response?: string;
  timestamp: string;
  lastLocation: string;
  safetyScore: number;
  digitalId: string;
}

interface Tourist {
  id: string;
  digitalId: string;
  name: string;
  nationality: string;
  phone: string;
  email: string;
  currentLocation: { lat: number; lng: number; address: string; };
  safetyScore: number;
  status: 'active' | 'missing' | 'safe' | 'in_distress';
  lastActive: string;
  visitDuration: number;
  itinerary: string[];
}

export default function AuthorityDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeView, setRealTimeView] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTourists: 1247,
    activeTourists: 892,
    emergencyAlerts: 3,
    missingPersons: 1,
    geofenceViolations: 8,
    avgSafetyScore: 78,
    responseTime: '3.2',
    iotDevicesConnected: 156
  });

  const [alerts, setAlerts] = useState<TouristAlert[]>([
    {
      id: '1',
      touristId: 'TID-2025-001234',
      touristName: 'Emma Johnson',
      nationality: 'USA',
      type: 'panic',
      message: 'EMERGENCY: Panic button activated',
      location: { lat: 26.9124, lng: 75.7873, address: 'Hawa Mahal, Jaipur' },
      severity: 'critical',
      status: 'new',
      timestamp: '2025-01-04T14:30:00Z',
      lastLocation: 'City Palace, Jaipur',
      safetyScore: 25,
      digitalId: 'TID-2025-001234'
    },
    {
      id: '2',
      touristId: 'TID-2025-001235',
      touristName: 'David Chen',
      nationality: 'Canada',
      type: 'geo_fence',
      message: 'Tourist entered restricted area near Amber Fort',
      location: { lat: 26.9855, lng: 75.8513, address: 'Restricted Zone, Amber Fort Area' },
      severity: 'high',
      status: 'investigating',
      assignedTo: 'Officer Singh',
      timestamp: '2025-01-04T13:45:00Z',
      lastLocation: 'Amber Fort Entrance',
      safetyScore: 68,
      digitalId: 'TID-2025-001235'
    },
    {
      id: '3',
      touristId: 'TID-2025-001236',
      touristName: 'Maria Rodriguez',
      nationality: 'Spain',
      type: 'anomaly',
      message: 'Unusual activity pattern detected - prolonged inactivity',
      location: { lat: 26.9548, lng: 75.8205, address: 'Jantar Mantar, Jaipur' },
      severity: 'medium',
      status: 'new',
      timestamp: '2025-01-04T12:15:00Z',
      lastLocation: 'Jantar Mantar Observatory',
      safetyScore: 82,
      digitalId: 'TID-2025-001236'
    }
  ]);

  const [tourists, setTourists] = useState<Tourist[]>([
    {
      id: '1',
      digitalId: 'TID-2025-001234',
      name: 'Emma Johnson',
      nationality: 'USA',
      phone: '+1-555-0123',
      email: 'emma.j@email.com',
      currentLocation: { lat: 26.9124, lng: 75.7873, address: 'Hawa Mahal, Jaipur' },
      safetyScore: 25,
      status: 'in_distress',
      lastActive: '2025-01-04T14:30:00Z',
      visitDuration: 3,
      itinerary: ['Hawa Mahal', 'City Palace', 'Amber Fort']
    }
  ]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!['police', 'tourism_dept', 'higher_authority', 'admin'].includes(session.user.role)) {
      router.push('/dashboard/tourist');
      return;
    }
  }, [session, status, router]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setStats(prev => ({
        ...prev,
        activeTourists: prev.activeTourists + Math.floor(Math.random() * 3) - 1,
        avgSafetyScore: Math.max(70, Math.min(85, prev.avgSafetyScore + (Math.random() - 0.5) * 2))
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'panic': return 'bg-red-500';
      case 'missing': return 'bg-red-600';
      case 'geo_fence': return 'bg-orange-500';
      case 'anomaly': return 'bg-yellow-500';
      case 'route_deviation': return 'bg-purple-500';
      case 'inactive': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500';
      case 'high': return 'text-orange-500 border-orange-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'low': return 'text-blue-500 border-blue-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const handleAlertResponse = async (alertId: string, action: 'investigate' | 'resolve') => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: action === 'investigate' ? 'investigating' : 'resolved',
              assignedTo: action === 'investigate' ? session?.user?.name : alert.assignedTo
            }
          : alert
      )
    );
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
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-500" />
                <span>Yatri Rakshak</span>
              </h1>
              <div className="flex items-center space-x-2">
                <Badge 
                  className={`${
                    session.user.role === 'tourism_dept' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {session.user.role === 'tourism_dept' ? 'Tourism Department' : 
                   session.user.role === 'higher_authority' ? 'Higher Authority' : 'Police'}
                </Badge>
                {session.user.badgeNumber && (
                  <Badge variant="outline">Badge: {session.user.badgeNumber}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Auto-refresh</span>
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <span className="text-sm text-muted-foreground">
                {session.user.name} ({session.user.department})
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

      <div className="container mx-auto px-4 py-6">
        {/* Critical Alerts */}
        {alerts.filter(alert => alert.severity === 'critical' && alert.status === 'new').length > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Siren className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-semibold text-red-800">CRITICAL EMERGENCY ALERTS</h3>
              </div>
              <div className="grid gap-3">
                {alerts.filter(alert => alert.severity === 'critical' && alert.status === 'new').map(alert => (
                  <div key={alert.id} className="bg-white border border-red-300 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className="bg-red-500">PANIC</Badge>
                          <span className="font-semibold">{alert.touristName}</span>
                          <span className="text-sm text-muted-foreground">({alert.nationality})</span>
                          <span className="text-sm text-muted-foreground">ID: {alert.digitalId}</span>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleAlertResponse(alert.id, 'investigate')}
                        >
                          RESPOND NOW
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tourists</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeTourists}</p>
                  <p className="text-xs text-muted-foreground">of {stats.totalTourists} total</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{stats.emergencyAlerts}</p>
                  <p className="text-xs text-muted-foreground">requiring immediate action</p>
                </div>
                <Siren className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Safety Score</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.avgSafetyScore}</p>
                  <p className="text-xs text-muted-foreground">across all tourists</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.responseTime}m</p>
                  <p className="text-xs text-muted-foreground">average response</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="tourists">Tourist Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="geofence">Geo-Zones</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Real-time Map Preview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-green-500" />
                    <span>Real-time Tourist Locations</span>
                    {realTimeView && <Badge variant="secondary" className="bg-green-100 text-green-800">LIVE</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Map View</p>
                      <p className="text-sm text-gray-500">Real-time tourist locations and geo-fence zones</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Safe ({stats.activeTourists - stats.emergencyAlerts - stats.geofenceViolations})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Caution ({stats.geofenceViolations})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Emergency ({stats.emergencyAlerts})</span>
                      </div>
                    </div>
                    <Switch 
                      checked={realTimeView} 
                      onCheckedChange={setRealTimeView}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Monitoring</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Geo-fencing</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Emergency Network</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">IoT Devices</span>
                      <Badge variant="secondary">{stats.iotDevicesConnected} Connected</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm" variant="outline">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Broadcast Alert
                    </Button>
                    <Button className="w-full" size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate E-FIR
                    </Button>
                    <Button className="w-full" size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Active Tourist Alerts</h2>
                <p className="text-sm text-muted-foreground">
                  {alerts.filter(a => a.status !== 'resolved').length} active alerts requiring attention
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {alerts.filter(alert => alert.status !== 'resolved').map(alert => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity).replace('text-', 'border-l-')}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={getAlertTypeColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="font-semibold text-lg">{alert.touristName}</span>
                          <Badge variant="outline">{alert.nationality}</Badge>
                          <Badge 
                            variant="outline" 
                            className={`${getSeverityColor(alert.severity)} font-medium`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium">Digital ID:</p>
                            <p className="font-mono">{alert.digitalId}</p>
                          </div>
                          <div>
                            <p className="font-medium">Location:</p>
                            <p>{alert.location.address}</p>
                          </div>
                          <div>
                            <p className="font-medium">Safety Score:</p>
                            <p className={`font-bold ${alert.safetyScore < 50 ? 'text-red-500' : alert.safetyScore < 75 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {alert.safetyScore}/100
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Time:</p>
                            <p>{new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                        </div>

                        {alert.assignedTo && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <p className="text-sm">
                              <strong>Assigned to:</strong> {alert.assignedTo}
                              <Badge variant="secondary" className="ml-2">Investigating</Badge>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {alert.status === 'new' && (
                          <Button
                            size="sm"
                            onClick={() => handleAlertResponse(alert.id, 'investigate')}
                            className={alert.severity === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            {alert.severity === 'critical' ? 'RESPOND NOW' : 'Investigate'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAlertResponse(alert.id, 'resolve')}
                        >
                          Mark Resolved
                        </Button>
                        <Button size="sm" variant="outline">
                          <MapPin className="w-4 h-4 mr-1" />
                          View on Map
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Create Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tourists" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Tourist Monitoring</h2>
                <p className="text-sm text-muted-foreground">
                  Live tracking of {stats.activeTourists} active tourists
                </p>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Search by name, ID, or nationality..." className="w-64" />
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Sample tourist data */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        EJ
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Emma Johnson</h3>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>🇺🇸 USA</span>
                          <span>•</span>
                          <span>TID-2025-001234</span>
                          <span>•</span>
                          <span>Day 3 of visit</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">IN DISTRESS</Badge>
                      <Badge variant="secondary">Score: 25</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Current Location</p>
                      <p className="text-muted-foreground">Hawa Mahal, Jaipur</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Active</p>
                      <p className="text-muted-foreground">2 min ago</p>
                    </div>
                    <div>
                      <p className="font-medium">Emergency Contact</p>
                      <p className="text-muted-foreground">+1-555-0123</p>
                    </div>
                    <div>
                      <p className="font-medium">Planned Route</p>
                      <p className="text-muted-foreground">Hawa Mahal → City Palace</p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Siren className="w-4 h-4 mr-1" />
                      Emergency Response
                    </Button>
                    <Button size="sm" variant="outline">
                      <Navigation className="w-4 h-4 mr-1" />
                      Track Location
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Contact Tourist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tourist Flow Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Tourist Flow Analysis</CardTitle>
                  <CardDescription>Movement patterns and hotspot identification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Analytics Dashboard</p>
                      <p className="text-sm text-gray-500">Heat maps and flow visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span>AI Insights</span>
                  </CardTitle>
                  <CardDescription>Machine learning predictions and anomaly detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Pattern Detection</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Increased tourist activity detected near Amber Fort. Consider additional security deployment.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Prediction</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Peak tourist hours predicted: 2-4 PM. Safety score expected to drop by 5-8 points.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Recommendation</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Deploy additional patrol units to Zone C between 2-4 PM for optimal coverage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geofence" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Geo-fence Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage restricted areas and safety zones
                </p>
              </div>
              <Button>
                <MapPin className="w-4 h-4 mr-2" />
                Create New Zone
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Restricted Area - Amber Fort', type: 'restricted', alerts: 8, status: 'active' },
                { name: 'Safe Zone - City Palace', type: 'safe', alerts: 0, status: 'active' },
                { name: 'Tourist Zone - Hawa Mahal', type: 'tourist', alerts: 2, status: 'active' }
              ].map((zone, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{zone.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`mt-1 ${
                            zone.type === 'restricted' ? 'bg-red-100 text-red-800' :
                            zone.type === 'safe' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {zone.type.toUpperCase()}
                        </Badge>
                      </div>
                      <Badge 
                        variant={zone.status === 'active' ? 'secondary' : 'outline'}
                        className={zone.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {zone.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Recent Alerts:</span>
                        <span className="font-medium">{zone.alerts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tourists in Zone:</span>
                        <span className="font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Reports & Documentation</h2>
                <p className="text-sm text-muted-foreground">
                  Generate reports and manage documentation
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Daily Safety Report', type: 'daily', date: '2025-01-04', status: 'ready' },
                { title: 'Emergency Response Log', type: 'emergency', date: '2025-01-04', status: 'pending' },
                { title: 'Tourist Statistics', type: 'statistics', date: '2025-01-03', status: 'ready' },
                { title: 'Geo-fence Violations', type: 'violations', date: '2025-01-04', status: 'ready' },
                { title: 'AI Analysis Report', type: 'ai', date: '2025-01-03', status: 'ready' },
                { title: 'Monthly Summary', type: 'monthly', date: '2024-12-31', status: 'archived' }
              ].map((report, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.date}</p>
                      </div>
                      <Badge 
                        variant={report.status === 'ready' ? 'secondary' : 'outline'}
                        className={
                          report.status === 'ready' ? 'bg-green-100 text-green-800' :
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        disabled={report.status !== 'ready'}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
