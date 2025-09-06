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
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  MapPin, 
  FileText, 
  Clock, 
  Navigation,
  Heart,
  Smartphone,
  Users,
  Eye,
  AlertCircle,
  Globe,
  QrCode
} from 'lucide-react';


interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'reported' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedAt: string;
  updatedAt: string;
}

export default function TouristDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [safetyScore, setSafetyScore] = useState(85);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (!['public', 'tourist', 'local_citizen'].includes(session.user.role)) {
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
        },
        (error) => console.log('Location access denied')
      );
    }
  }, [session, status, router]);

  // Mock incidents data
  useEffect(() => {
    setIncidents([
      {
        id: '1',
        title: 'Suspicious Activity at Railway Station',
        description: 'Unattended bag spotted at platform 3',
        location: 'Delhi Central Railway Station',
        status: 'investigating',
        priority: 'high',
        reportedAt: '2025-01-04T10:30:00Z',
        updatedAt: '2025-01-04T11:00:00Z'
      },
      {
        id: '2',
        title: 'Traffic Signal Malfunction',
        description: 'Traffic light not working properly',
        location: 'Connaught Place, New Delhi',
        status: 'resolved',
        priority: 'medium',
        reportedAt: '2025-01-03T16:15:00Z',
        updatedAt: '2025-01-04T09:30:00Z'
      }
    ]);
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call the API to submit the incident report
    console.log('Submitting report:', reportForm);
    
    // Reset form
    setReportForm({
      title: '',
      description: '',
      location: '',
      priority: 'medium'
    });
    
    alert('Incident reported successfully! You will be notified of updates.');
  };

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

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || !['public', 'tourist', 'local_citizen'].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-2 xs:px-4 py-2 xs:py-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center space-y-2 xs:space-y-0">
            <div className="w-full xs:w-auto">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground">Yatri Rakshak</h1>
              <p className="text-xs xs:text-sm text-muted-foreground">Public Dashboard</p>
            </div>
            <div className="flex items-center space-x-2 xs:space-x-4 w-full xs:w-auto justify-between xs:justify-end">
              <span className="text-xs xs:text-sm text-muted-foreground hidden sm:inline">
                Welcome, {session.user.name}
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
        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4 xs:mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: FileText },
            { key: 'report', label: 'Report Incident', icon: AlertTriangle },
            { key: 'status', label: 'My Reports', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-1 xs:space-x-2 rounded-md px-2 xs:px-3 py-2 text-xs xs:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.key === 'overview' ? 'Home' : tab.key === 'report' ? 'Report' : 'Status'}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-3 xs:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 xs:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm xs:text-base">Police Emergency</span>
                  <Badge variant="destructive" className="text-xs">100</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm xs:text-base">Fire Department</span>
                  <Badge variant="destructive" className="text-xs">101</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm xs:text-base">Medical Emergency</span>
                  <Badge variant="destructive" className="text-xs">102</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm xs:text-base">Tourist Helpline</span>
                  <Badge variant="outline" className="text-xs">1363</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Recent Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 xs:space-y-3">
                  <div className="p-2 xs:p-3 border rounded-lg">
                    <p className="text-xs xs:text-sm font-medium">Heavy traffic on NH-1</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                  <div className="p-2 xs:p-3 border rounded-lg">
                    <p className="text-xs xs:text-sm font-medium">Weather alert: Heavy rain expected</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 xs:space-y-3">
                <Button 
                  className="w-full text-xs xs:text-sm" 
                  variant="destructive"
                  onClick={() => setActiveTab('report')}
                >
                  <AlertTriangle className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Report Emergency</span>
                  <span className="xs:hidden">Emergency</span>
                </Button>
                <Button 
                  className="w-full text-xs xs:text-sm" 
                  variant="outline"
                  onClick={() => setActiveTab('status')}
                >
                  <Clock className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Check Report Status</span>
                  <span className="xs:hidden">My Reports</span>
                </Button>
                <Button className="w-full text-xs xs:text-sm" variant="outline">
                  <MapPin className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                  <span className="hidden sm:inline">Find Nearest Police Station</span>
                  <span className="sm:hidden">Find Police</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'report' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Report an Incident</CardTitle>
              <CardDescription>
                Provide details about the incident you want to report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input
                    id="title"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                    placeholder="Brief description of the incident"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                    placeholder="Detailed description of what happened"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                    placeholder="Where did this incident occur?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <select
                    id="priority"
                    value={reportForm.priority}
                    onChange={(e) => setReportForm({...reportForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <Button type="submit" className="w-full">
                  Submit Report
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Incident Reports</h2>
            {incidents.length > 0 ? (
              <div className="grid gap-4">
                {incidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {incident.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{incident.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Reported: {new Date(incident.reportedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No incidents reported yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
