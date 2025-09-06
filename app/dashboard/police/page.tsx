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
  Shield, 
  AlertTriangle, 
  FileText, 
  Clock, 
  MapPin,
  Users,
  Activity,
  Phone,
  Radio,
  Camera,
  Car,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Navigation,
  Siren,
  AlertCircle,
  UserCheck,
  Zap,
  Heart,
  Battery
} from 'lucide-react';

interface PoliceStats {
  activePatrols: number;
  ongoingIncidents: number;
  resolvedToday: number;
  emergencyCalls: number;
  responseTime: string;
  unitsAvailable: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'reported' | 'dispatched' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedBy: string;
  assignedUnit?: string;
  reportedAt: string;
  updatedAt: string;
  type: 'theft' | 'assault' | 'missing_person' | 'traffic' | 'suspicious_activity' | 'emergency';
}

interface PatrolUnit {
  id: string;
  callSign: string;
  officers: string[];
  location: string;
  status: 'available' | 'busy' | 'responding' | 'off_duty';
  lastUpdate: string;
}

export default function PoliceDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('incidents');
  const [stats, setStats] = useState<PoliceStats>({
    activePatrols: 12,
    ongoingIncidents: 8,
    resolvedToday: 15,
    emergencyCalls: 3,
    responseTime: '8.5',
    unitsAvailable: 6
  });

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Tourist Harassment Reported',
      description: 'Foreign tourist reports being followed and harassed near Red Fort',
      location: 'Red Fort, Delhi',
      coordinates: { lat: 28.6562, lng: 77.2410 },
      status: 'reported',
      priority: 'high',
      reportedBy: 'Tourist via Yatri Rakshak App',
      reportedAt: '2025-01-04T14:30:00Z',
      updatedAt: '2025-01-04T14:30:00Z',
      type: 'assault'
    },
    {
      id: '2',
      title: 'Pickpocketing Incident',
      description: 'Multiple reports of pickpocketing in Connaught Place area',
      location: 'Connaught Place, Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      status: 'investigating',
      priority: 'medium',
      reportedBy: 'Multiple witnesses',
      assignedUnit: 'Unit-7',
      reportedAt: '2025-01-04T13:15:00Z',
      updatedAt: '2025-01-04T14:00:00Z',
      type: 'theft'
    },
    {
      id: '3',
      title: 'Missing Tourist',
      description: 'German tourist last seen at India Gate, not returned to hotel',
      location: 'India Gate, Delhi',
      coordinates: { lat: 28.6129, lng: 77.2295 },
      status: 'dispatched',
      priority: 'emergency',
      reportedBy: 'Hotel Manager',
      assignedUnit: 'Unit-3',
      reportedAt: '2025-01-04T12:45:00Z',
      updatedAt: '2025-01-04T13:30:00Z',
      type: 'missing_person'
    }
  ]);

  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>([
    {
      id: '1',
      callSign: 'Unit-1',
      officers: ['Constable Singh', 'Constable Kumar'],
      location: 'Sector 1 - Red Fort Area',
      status: 'available',
      lastUpdate: '2025-01-04T14:25:00Z'
    },
    {
      id: '2',
      callSign: 'Unit-3',
      officers: ['Inspector Sharma', 'Constable Patel'],
      location: 'India Gate Area',
      status: 'responding',
      lastUpdate: '2025-01-04T14:20:00Z'
    },
    {
      id: '3',
      callSign: 'Unit-7',
      officers: ['Sub-Inspector Gupta', 'Constable Yadav'],
      location: 'Connaught Place',
      status: 'busy',
      lastUpdate: '2025-01-04T14:15:00Z'
    }
  ]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (session.user.role !== 'police') {
      if (['higher_authority', 'admin'].includes(session.user.role)) {
        router.push('/dashboard/authority');
      } else {
        router.push('/dashboard/public');
      }
      return;
    }
  }, [session, status, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-500';
      case 'dispatched': return 'bg-blue-500';
      case 'investigating': return 'bg-orange-500';
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

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'responding': return 'bg-blue-500';
      case 'off_duty': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleIncidentAction = (incidentId: string, action: 'dispatch' | 'investigate' | 'resolve') => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: action === 'dispatch' ? 'dispatched' : action === 'investigate' ? 'investigating' : 'resolved',
              updatedAt: new Date().toISOString(),
              assignedUnit: action === 'dispatch' ? 'Unit-1' : incident.assignedUnit
            }
          : incident
      )
    );
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user.role !== 'police') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-2 xs:px-4 py-2 xs:py-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center space-y-2 xs:space-y-0">
            <div className="w-full xs:w-auto">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground flex items-center space-x-2">
                <Shield className="w-5 h-5 xs:w-6 xs:h-6 text-blue-500" />
                <span>Yatri Rakshak</span>
              </h1>
              <div className="flex flex-wrap items-center gap-1 xs:gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-800 text-xs">Police Officer</Badge>
                {session.user.badgeNumber && (
                  <Badge variant="outline" className="text-xs hidden xs:inline-flex">Badge: {session.user.badgeNumber}</Badge>
                )}
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">{session.user.department}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 w-full xs:w-auto justify-between xs:justify-end">
              <Button variant="destructive" size="sm" className="text-xs xs:text-sm px-2 xs:px-3">
                <Siren className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Emergency</span>
                <span className="xs:hidden">SOS</span>
              </Button>
              <span className="text-xs xs:text-sm text-muted-foreground hidden md:inline">
                {session.user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs xs:text-sm px-2 xs:px-3"
                onClick={() => router.push('/api/auth/signout')}
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
        <div className="grid gap-2 xs:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-4 xs:mb-6">
          <Card>
            <CardContent className="pt-3 xs:pt-6 pb-3 xs:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xs:text-sm font-medium text-muted-foreground">Patrols</p>
                  <p className="text-lg xs:text-2xl font-bold text-blue-600">{stats.activePatrols}</p>
                </div>
                <Car className="w-4 h-4 xs:w-6 xs:h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ongoing Cases</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.ongoingIncidents}</p>
                </div>
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Calls</p>
                  <p className="text-2xl font-bold text-red-600">{stats.emergencyCalls}</p>
                </div>
                <Phone className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.responseTime}m</p>
                </div>
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Units Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.unitsAvailable}</p>
                </div>
                <Radio className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 xs:space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="incidents" className="text-xs xs:text-sm py-2 xs:py-2.5">Incidents</TabsTrigger>
            <TabsTrigger value="patrols" className="text-xs xs:text-sm py-2 xs:py-2.5">Patrols</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs xs:text-sm py-2 xs:py-2.5">Reports</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs xs:text-sm py-2 xs:py-2.5">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Active Incidents</h2>
                <p className="text-sm text-muted-foreground">
                  {incidents.filter(i => i.status !== 'resolved').length} incidents requiring attention
                </p>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Search incidents..." className="w-64" />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {incidents.filter(incident => incident.status !== 'resolved').map(incident => (
                <Card key={incident.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{incident.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(incident.reportedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Reported by: {incident.reportedBy}</span>
                          </div>
                        </div>

                        {incident.assignedUnit && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <p className="text-sm">
                              <strong>Assigned Unit:</strong> {incident.assignedUnit}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {incident.status === 'reported' && (
                          <Button
                            size="sm"
                            onClick={() => handleIncidentAction(incident.id, 'dispatch')}
                            className={incident.priority === 'emergency' ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            {incident.priority === 'emergency' ? 'DISPATCH NOW' : 'Dispatch Unit'}
                          </Button>
                        )}
                        {incident.status === 'dispatched' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleIncidentAction(incident.id, 'investigate')}
                          >
                            Start Investigation
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIncidentAction(incident.id, 'resolve')}
                        >
                          Mark Resolved
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Create FIR
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patrols" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Patrol Units Status</h2>
                <p className="text-sm text-muted-foreground">
                  Real-time status of all patrol units
                </p>
              </div>
              <Button>
                <Radio className="w-4 h-4 mr-2" />
                Radio All Units
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patrolUnits.map(unit => (
                <Card key={unit.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{unit.callSign}</h3>
                        <Badge className={getUnitStatusColor(unit.status)}>
                          {unit.status.toUpperCase()}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Radio className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">Officers:</p>
                        <p className="text-muted-foreground">{unit.officers.join(', ')}</p>
                      </div>
                      <div>
                        <p className="font-medium">Current Location:</p>
                        <p className="text-muted-foreground">{unit.location}</p>
                      </div>
                      <div>
                        <p className="font-medium">Last Update:</p>
                        <p className="text-muted-foreground">{new Date(unit.lastUpdate).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        Track
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Navigation className="w-4 h-4 mr-1" />
                        Dispatch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>File Police Report</CardTitle>
                <CardDescription>
                  Create a new incident report or FIR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-24 flex-col space-y-2">
                      <FileText className="w-8 h-8" />
                      <span>Incident Report</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col space-y-2">
                      <ShieldCheck className="w-8 h-8" />
                      <span>Arrest Report</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-24 flex-col space-y-2">
                      <Car className="w-8 h-8" />
                      <span>Traffic Violation</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col space-y-2">
                      <UserCheck className="w-8 h-8" />
                      <span>Missing Person</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Database Search</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Search by name, ID, or phone..." />
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">Criminal Records</Button>
                    <Button size="sm" variant="outline">Vehicle Registry</Button>
                    <Button size="sm" variant="outline">Missing Persons</Button>
                    <Button size="sm" variant="outline">Tourist Database</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>CCTV Access</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Live Camera Feed
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search Footage
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Camera Locations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radio className="w-5 h-5" />
                    <span>Communication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Radio className="w-4 h-4 mr-2" />
                    Police Radio
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Hotline
                  </Button>
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Broadcast Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
