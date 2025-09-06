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
  Eye, 
  AlertTriangle, 
  Users, 
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Clock,
  Phone,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Globe,
  Building,
  Car,
  Camera,
  Radio,
  MessageCircle,
  Bell,
  Settings,
  User,
  Calendar,
  Map,
  Navigation,
  ExternalLink,
  Send,
  Mic,
  Video,
  Image,
  Database,
  Server,
  Lock,
  Unlock,
  RefreshCw,
  Target,
  Award,
  Flag,
  Star,
  Heart,
  Battery,
  Wifi,
  Compass,
  Share2,
  Copy,
  Archive,
  Trash,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  X,
  Check,
  Plus as PlusIcon,
  Minus,
  Divide,
  Equal,
  Percent,
  DollarSign,
  Euro,
  IndianRupee,
  Bitcoin,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer,
  Hourglass,

 
} from 'lucide-react';

interface AuthorityStats {
  totalIncidents: number;
  resolvedIncidents: number;
  activePatrols: number;
  touristCount: number;
  responseTime: string;
  safetyScore: number;
  pendingKYC: number;
  systemAlerts: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'reported' | 'dispatched' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedBy: string;
  assignedUnit?: string;
  reportedAt: string;
  updatedAt: string;
  type: 'theft' | 'assault' | 'missing_person' | 'traffic' | 'suspicious_activity' | 'emergency' | 'tourist_harassment';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  affectedTourists?: number;
}

interface KYCApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  fullName: string;
  nationality: string;
  idType: string;
  idNumber: string;
  badgeNumber?: string;
  department?: string;
  visitPurpose?: string;
  visitDuration?: string;
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'performance' | 'maintenance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

interface PatrolUnit {
  id: string;
  callSign: string;
  officers: string[];
  location: string;
  status: 'available' | 'busy' | 'responding' | 'off_duty';
  lastUpdate: string;
  efficiency: number;
}

export default function AuthorityDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AuthorityStats>({
    totalIncidents: 156,
    resolvedIncidents: 142,
    activePatrols: 24,
    touristCount: 1247,
    responseTime: '6.2',
    safetyScore: 87,
    pendingKYC: 23,
    systemAlerts: 3
  });

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Tourist Harassment - Red Fort',
      description: 'Multiple reports of tourist harassment near Red Fort area',
      location: 'Red Fort, Delhi',
      coordinates: { lat: 28.6562, lng: 77.2410 },
      status: 'investigating',
      priority: 'high',
      severity: 'major',
      reportedBy: 'Tourist via App',
      assignedUnit: 'Unit-7',
      reportedAt: '2025-01-04T14:30:00Z',
      updatedAt: '2025-01-04T15:00:00Z',
      type: 'tourist_harassment',
      affectedTourists: 5
    },
    {
      id: '2',
      title: 'Pickpocketing Spree',
      description: 'Organized pickpocketing in Connaught Place',
      location: 'Connaught Place, Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      status: 'dispatched',
      priority: 'medium',
      severity: 'moderate',
      reportedBy: 'Multiple witnesses',
      assignedUnit: 'Unit-3',
      reportedAt: '2025-01-04T13:15:00Z',
      updatedAt: '2025-01-04T14:00:00Z',
      type: 'theft',
      affectedTourists: 8
    },
    {
      id: '3',
      title: 'Missing Tourist - German National',
      description: 'German tourist missing since yesterday evening',
      location: 'India Gate, Delhi',
      coordinates: { lat: 28.6129, lng: 77.2295 },
      status: 'investigating',
      priority: 'emergency',
      severity: 'critical',
      reportedBy: 'Hotel Manager',
      assignedUnit: 'Unit-1',
      reportedAt: '2025-01-04T12:45:00Z',
      updatedAt: '2025-01-04T13:30:00Z',
      type: 'missing_person',
      affectedTourists: 1
    }
  ]);

  const [kycApplications, setKYCApplications] = useState<KYCApplication[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      role: 'tourist',
      submittedAt: '2025-01-04T10:30:00Z',
      status: 'pending',
      fullName: 'John Smith',
      nationality: 'USA',
      idType: 'passport',
      idNumber: 'US123456789',
      visitPurpose: 'tourism',
      visitDuration: '2 weeks'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Rajesh Kumar',
      userEmail: 'rajesh@police.gov.in',
      role: 'police',
      submittedAt: '2025-01-04T09:15:00Z',
      status: 'pending',
      fullName: 'Rajesh Kumar',
      nationality: 'India',
      idType: 'aadhaar',
      idNumber: '123456789012',
      badgeNumber: 'DLP-2024-001',
      department: 'Traffic Police'
    }
  ]);

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      title: 'High Server Load',
      message: 'Server CPU usage at 85% - monitoring required',
      type: 'performance',
      severity: 'medium',
      timestamp: '2025-01-04T14:30:00Z',
      resolved: false
    },
    {
      id: '2',
      title: 'Database Backup Failed',
      message: 'Scheduled backup failed - manual intervention required',
      type: 'data',
      severity: 'high',
      timestamp: '2025-01-04T13:00:00Z',
      resolved: false
    },
    {
      id: '3',
      title: 'Security Scan Complete',
      message: 'No vulnerabilities detected in latest security scan',
      type: 'security',
      severity: 'low',
      timestamp: '2025-01-04T12:00:00Z',
      resolved: true
    }
  ]);

  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>([
    {
      id: '1',
      callSign: 'Unit-1',
      officers: ['Inspector Sharma', 'Constable Patel'],
      location: 'India Gate Area',
      status: 'responding',
      lastUpdate: '2025-01-04T14:20:00Z',
      efficiency: 92
    },
    {
      id: '2',
      callSign: 'Unit-3',
      officers: ['Sub-Inspector Gupta', 'Constable Yadav'],
      location: 'Connaught Place',
      status: 'busy',
      lastUpdate: '2025-01-04T14:15:00Z',
      efficiency: 88
    },
    {
      id: '3',
      callSign: 'Unit-7',
      officers: ['Constable Singh', 'Constable Kumar'],
      location: 'Red Fort Area',
      status: 'available',
      lastUpdate: '2025-01-04T14:25:00Z',
      efficiency: 95
    }
  ]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!['higher_authority', 'admin', 'tourism_dept'].includes(session.user.role)) {
      if (session.user.role === 'police') {
        router.push('/dashboard/police');
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
      case 'closed': return 'bg-gray-500';
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'major': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-500';
      case 'performance': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'data': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleKYCApproval = (applicationId: string, approved: boolean) => {
    setKYCApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: approved ? 'approved' : 'rejected' }
          : app
      )
    );
  };

  const handleIncidentAction = (incidentId: string, action: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: action as any,
              updatedAt: new Date().toISOString()
            }
          : incident
      )
    );
  };

  const resolveSystemAlert = (alertId: string) => {
    setSystemAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || !['higher_authority', 'admin', 'tourism_dept'].includes(session.user.role)) {
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
                <Eye className="w-6 h-6 text-purple-500" />
                <span>Yatri Rakshak</span>
              </h1>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800">
                  {session.user.role === 'admin' ? 'Administrator' : 
                   session.user.role === 'higher_authority' ? 'Higher Authority' : 
                   'Tourism Department'}
                </Badge>
                {session.user.department && (
                  <Badge variant="outline">{session.user.department}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <span className="text-sm text-muted-foreground">
                {session.user.name}
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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-8 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Incidents</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalIncidents}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Patrols</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activePatrols}</p>
                </div>
                <Car className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tourists</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.touristCount}</p>
                </div>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold text-red-600">{stats.responseTime}m</p>
                </div>
                <Clock className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold text-green-600">{stats.safetyScore}/100</p>
                </div>
                <Shield className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingKYC}</p>
                </div>
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.systemAlerts}</p>
                </div>
                <Bell className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="kyc">KYC Management</TabsTrigger>
            <TabsTrigger value="patrols">Patrol Units</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>System Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systemAlerts.filter(alert => !alert.resolved).map(alert => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getAlertTypeColor(alert.type)}>
                              {alert.type.toUpperCase()}
                            </Badge>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveSystemAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {systemAlerts.filter(alert => !alert.resolved).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No active system alerts
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
                      <BarChart3 className="w-6 h-6" />
                      <span>Generate Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Users className="w-6 h-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Settings className="w-6 h-6" />
                      <span>System Config</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Download className="w-6 h-6" />
                      <span>Export Data</span>
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
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">New incident reported at Red Fort</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="outline">High Priority</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">KYC application approved</p>
                      <p className="text-sm text-muted-foreground">4 hours ago</p>
                    </div>
                    <Badge variant="outline">Tourist</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">System maintenance scheduled</p>
                      <p className="text-sm text-muted-foreground">6 hours ago</p>
                    </div>
                    <Badge variant="outline">Maintenance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Incident Management</h2>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage all reported incidents
                </p>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Search incidents..." className="w-64" />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {incidents.map(incident => (
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
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{incident.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
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
                          {incident.affectedTourists && (
                            <div className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <span>{incident.affectedTourists} tourists affected</span>
                            </div>
                          )}
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
                        <Button
                          size="sm"
                          onClick={() => handleIncidentAction(incident.id, 'investigating')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIncidentAction(incident.id, 'resolved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">KYC Applications</h2>
                <p className="text-sm text-muted-foreground">
                  Review and approve user verification applications
                </p>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Search applications..." className="w-64" />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {kycApplications.map(application => (
                <Card key={application.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{application.fullName}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {application.role.toUpperCase()}
                          </Badge>
                          <Badge className={application.status === 'pending' ? 'bg-yellow-500' : 
                                           application.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                            {application.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <p className="font-medium">Email:</p>
                            <p>{application.userEmail}</p>
                          </div>
                          <div>
                            <p className="font-medium">Nationality:</p>
                            <p>{application.nationality}</p>
                          </div>
                          <div>
                            <p className="font-medium">ID Type:</p>
                            <p>{application.idType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Submitted:</p>
                            <p>{new Date(application.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>

                        {application.badgeNumber && (
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded mb-3">
                            <p className="text-sm">
                              <strong>Badge Number:</strong> {application.badgeNumber} | 
                              <strong> Department:</strong> {application.department}
                            </p>
                          </div>
                        )}

                        {application.visitPurpose && (
                          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded">
                            <p className="text-sm">
                              <strong>Visit Purpose:</strong> {application.visitPurpose} | 
                              <strong> Duration:</strong> {application.visitDuration}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleKYCApproval(application.id, true)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleKYCApproval(application.id, false)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          View Documents
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
                <h2 className="text-xl font-semibold">Patrol Unit Management</h2>
                <p className="text-sm text-muted-foreground">
                  Monitor patrol units and their performance
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patrolUnits.map(unit => (
                <Card key={unit.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{unit.callSign}</h3>
                        <Badge className={unit.status === 'available' ? 'bg-green-500' : 
                                         unit.status === 'busy' ? 'bg-orange-500' : 
                                         unit.status === 'responding' ? 'bg-blue-500' : 'bg-gray-500'}>
                          {unit.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                        <p className="text-lg font-bold text-green-600">{unit.efficiency}%</p>
                      </div>
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
                        <Radio className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
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
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Incident Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Incident trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Incident Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Incident type distribution would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Services</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authentication</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    <Badge className="bg-yellow-500">Warning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>System Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Database Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    System Maintenance
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