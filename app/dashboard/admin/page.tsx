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
  Camera
} from 'lucide-react';

interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  pendingVerifications: number;
  responseTime: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'reported' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  updatedAt: string;
}

interface TouristAlert {
  id: string;
  touristId: string;
  touristName: string;
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
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    pendingVerifications: 0,
    responseTime: '0'
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session.user.role === 'public') {
      router.push('/dashboard/public');
      return;
    }
  }, [session, status, router]);

  // Mock data
  useEffect(() => {
    setStats({
      totalIncidents: 156,
      activeIncidents: 23,
      resolvedToday: 8,
      pendingVerifications: 5,
      responseTime: '12'
    });

    setIncidents([
      {
        id: '1',
        title: 'Suspicious Activity at Railway Station',
        description: 'Unattended bag spotted at platform 3, security team notified',
        location: 'Delhi Central Railway Station',
        status: 'investigating',
        priority: 'high',
        reportedBy: 'john.doe@email.com',
        assignedTo: 'Officer Singh',
        reportedAt: '2025-01-04T10:30:00Z',
        updatedAt: '2025-01-04T11:00:00Z'
      },
      {
        id: '2',
        title: 'Traffic Accident',
        description: 'Multi-vehicle collision causing traffic jam',
        location: 'NH-1 near Gurgaon',
        status: 'reported',
        priority: 'emergency',
        reportedBy: 'witness@email.com',
        reportedAt: '2025-01-04T14:15:00Z',
        updatedAt: '2025-01-04T14:15:00Z'
      },
      {
        id: '3',
        title: 'Lost Tourist',
        description: 'Foreign tourist lost in Old Delhi area',
        location: 'Chandni Chowk, Delhi',
        status: 'resolved',
        priority: 'medium',
        reportedBy: 'tourist.guide@email.com',
        assignedTo: 'Constable Kumar',
        reportedAt: '2025-01-03T16:20:00Z',
        updatedAt: '2025-01-04T09:45:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    // Update incident status
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: newStatus as any, updatedAt: new Date().toISOString() }
          : incident
      )
    );
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user.role === 'public') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Yatri Rakshak</h1>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <p className="text-muted-foreground">
                  {session.user.role === 'higher_authority' ? 'Higher Authority' : 'Police'} Dashboard
                </p>
                {session.user.badgeNumber && (
                  <Badge variant="outline">Badge: {session.user.badgeNumber}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Incidents</p>
                  <p className="text-2xl font-bold">{stats.totalIncidents}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.activeIncidents}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-500">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{stats.responseTime} min</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incidents">Incident Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {session.user.role === 'higher_authority' && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Incidents</h2>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search incidents..." 
                  className="w-64"
                />
                <Button variant="outline">Filter</Button>
              </div>
            </div>

            <div className="grid gap-4">
              {incidents.map((incident) => (
                <Card key={incident.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{incident.title}</h3>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {incident.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(incident.reportedAt).toLocaleString()}</span>
                          </div>
                          {incident.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Assigned to: {incident.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {incident.status !== 'resolved' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(incident.id, 'investigating')}
                              disabled={incident.status === 'investigating'}
                            >
                              {incident.status === 'investigating' ? 'Investigating' : 'Start Investigation'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                            >
                              Mark Resolved
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Trends</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <p className="text-muted-foreground">Chart: Incident trends over time</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Current active cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Emergency</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>High</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Medium</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">40%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Low</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Performance</CardTitle>
                  <CardDescription>Department metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Response Time</span>
                      <Badge variant="secondary">12 minutes</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolution Rate</span>
                      <Badge variant="secondary">87%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Satisfaction</span>
                      <Badge variant="secondary">4.2/5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Hotspots</CardTitle>
                  <CardDescription>Most reported areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { location: 'Delhi Central Railway Station', count: 23 },
                      { location: 'Connaught Place', count: 18 },
                      { location: 'India Gate', count: 15 },
                      { location: 'Red Fort', count: 12 }
                    ].map((hotspot, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{hotspot.location}</span>
                        <Badge variant="outline">{hotspot.count} reports</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {session.user.role === 'higher_authority' && (
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Button>Add New User</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                  <CardDescription>
                    Police officers and authorities awaiting account verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Officer Patel', email: 'patel@police.gov.in', badge: 'MP001', department: 'Traffic Police' },
                      { name: 'Inspector Singh', email: 'singh@police.gov.in', badge: 'MP002', department: 'Crime Branch' }
                    ].map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Badge: {user.badge} | {user.department}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Verify</Button>
                          <Button size="sm" variant="destructive">Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>All registered users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">Public</Badge>
                        <span>1,247 users</span>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">Police</Badge>
                        <span>45 officers</span>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">Higher Authority</Badge>
                        <span>8 officials</span>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
