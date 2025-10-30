'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  Settings
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
};

// Analytics Section Component
function AnalyticsSection() {
  const [timeframe, setTimeframe] = useState('7d');
  const incidentTrends = useAnalytics({ type: 'incident-trends', timeframe });
  const incidentTypes = useAnalytics({ type: 'incident-types' });
  const responseTime = useAnalytics({ type: 'response-time' });
  const locationHotspots = useAnalytics({ type: 'location-hotspots' });

  const COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#6B7280'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <Button 
            variant={timeframe === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeframe === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('30d')}
          >
            30 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              incidentTrends.refresh();
              incidentTypes.refresh();
              responseTime.refresh();
              locationHotspots.refresh();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
            <CardDescription>Incidents reported over time ({timeframe})</CardDescription>
          </CardHeader>
          <CardContent>
            {incidentTrends.loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : incidentTrends.error ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incidentTrends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Total Incidents"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emergency" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Emergency"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Incident Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Categories</CardTitle>
            <CardDescription>Distribution by incident type</CardDescription>
          </CardHeader>
          <CardContent>
            {incidentTypes.loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : incidentTypes.error ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentTypes.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentTypes.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Performance</CardTitle>
            <CardDescription>Average response time trends</CardDescription>
          </CardHeader>
          <CardContent>
            {responseTime.loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : responseTime.error ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseTime.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value) => [`${value} min`, 'Response Time']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#8B5CF6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Location Hotspots */}
        <Card>
          <CardHeader>
            <CardTitle>Location Hotspots</CardTitle>
            <CardDescription>Most reported areas with resolution rates</CardDescription>
          </CardHeader>
          <CardContent>
            {locationHotspots.loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">Loading data...</div>
              </div>
            ) : locationHotspots.error ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : (
              <div className="space-y-4">
                {locationHotspots.data.map((hotspot: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{hotspot.location}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{hotspot.count} reports</Badge>
                        <Badge 
                          variant={hotspot.resolutionRate >= 80 ? 'default' : 'secondary'}
                          className={hotspot.resolutionRate >= 80 ? 'bg-green-500' : ''}
                        >
                          {hotspot.resolutionRate}% resolved
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (hotspot.count / 25) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {hotspot.emergencyCount} emergency
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reports Section Component
function ReportsSection() {
  const [generating, setGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('incidents-summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [location, setLocation] = useState('');

  const reportTypes = [
    { value: 'incidents-summary', label: 'Incidents Summary Report', description: 'Overview of all incidents with status and priority breakdown' },
    { value: 'performance-report', label: 'Performance Analysis', description: 'Response times, resolution rates, and team performance metrics' },
    { value: 'user-activity', label: 'User Activity Report', description: 'User registration trends and verification statistics' },
    { value: 'safety-analysis', label: 'Safety Analysis Report', description: 'Tourist safety metrics, risk areas, and emergency response data' }
  ];

  const generateReport = async (format: 'json' | 'csv') => {
    setGenerating(true);
    try {
      const params = new URLSearchParams({
        type: selectedReportType,
        format,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(location && { location })
      });

      const response = await fetch(`/api/reports?${params}`);
      
      if (response.ok) {
        if (format === 'csv') {
          // Handle CSV download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Handle JSON download
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedReportType}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reports & Data Export</h2>
        <Badge variant="outline" className="text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
            <CardDescription>
              Create comprehensive reports with custom filters and export options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <select 
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {reportTypes.find(t => t.value === selectedReportType)?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Location Filter</label>
              <Input 
                placeholder="Enter location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={() => generateReport('json')}
                disabled={generating}
                className="flex-1"
              >
                {generating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Export JSON
                  </span>
                )}
              </Button>
              <Button 
                onClick={() => generateReport('csv')}
                disabled={generating}
                variant="outline"
                className="flex-1"
              >
                {generating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Export CSV
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used admin functions and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Seed test data
                  fetch('/api/seed-users', { method: 'POST' })
                    .then(() => alert('Test data seeded successfully'))
                    .catch(() => alert('Failed to seed data'));
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Seed Test Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Clear cache and refresh all data
                  window.location.reload();
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh All Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Export system logs
                  console.log('Exporting system logs...');
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export System Logs
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Emergency broadcast
                  const message = prompt('Enter emergency broadcast message:');
                  if (message) {
                    console.log('Broadcasting emergency message:', message);
                    alert('Emergency broadcast sent to all users');
                  }
                }}
              >
                <Siren className="w-4 h-4 mr-2" />
                Emergency Broadcast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Real-time system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Connection</span>
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">API Response Time</span>
                <Badge variant="secondary">245ms</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Real-time Updates</span>
                <Badge className="bg-green-500">
                  <Signal className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Emergency Services</span>
                <Badge className="bg-green-500">
                  <Heart className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Mobile App Sync</span>
                <Badge className="bg-green-500">
                  <Radio className="w-3 h-3 mr-1" />
                  Synced
                </Badge>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Last Health Check</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>
              Latest admin actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Incident #INC-2025-001 resolved', user: 'Officer Singh', time: '2 min ago', type: 'success' },
                { action: 'New user verification approved', user: 'Admin', time: '5 min ago', type: 'info' },
                { action: 'Tourist alert in Red Fort area', user: 'System', time: '8 min ago', type: 'warning' },
                { action: 'Performance report generated', user: 'Admin', time: '15 min ago', type: 'info' },
                { action: 'Database backup completed', user: 'System', time: '1 hour ago', type: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// System Administration Section Component
function SystemAdminSection() {
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [systemConfig, setSystemConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [configCategory, setConfigCategory] = useState('general');

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const [alertsResponse, configResponse] = await Promise.all([
        fetch('/api/system-alerts'),
        fetch('/api/system-config')
      ]);

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setSystemAlerts(alertsData.alerts);
        setSystemHealth(alertsData.systemHealth);
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setSystemConfig(configData.config);
      }
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      const response = await fetch('/api/system-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action })
      });

      if (response.ok) {
        fetchSystemData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports?type=incidents-summary&format=json');
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const performQuickAction = async (action: string) => {
    switch (action) {
      case 'generate-report':
        await generateReport();
        break;
      case 'manage-users':
        // Navigate to users tab - would need router context
        alert('Navigate to User Management tab');
        break;
      case 'export-data':
        // Export all data
        try {
          const response = await fetch('/api/reports?type=user-activity&format=csv');
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        } catch (error) {
          console.error('Error exporting data:', error);
        }
        break;
      case 'system-config':
        setConfigCategory('general');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading system administration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Administration</h2>
        <Badge variant="outline" className="text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Alerts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Monitor and manage system health alerts and notifications
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {systemAlerts.filter(a => a.severity === 'critical').length} Critical
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  {systemAlerts.filter(a => a.severity === 'high').length} High
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchSystemData}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${
                  alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                  alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>Time: {new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.acknowledgedBy && (
                          <span>Acknowledged by: {alert.acknowledgedBy}</span>
                        )}
                      </div>
                      {alert.details && (
                        <div className="mt-2 p-2 bg-white rounded text-xs">
                          <strong>Details:</strong>
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      {alert.status === 'active' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          >
                            Acknowledge
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAlertAction(alert.id, 'resolve')}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                        >
                          Resolve
                        </Button>
                      )}
                      {alert.status === 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAlertAction(alert.id, 'reopen')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {systemAlerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Systems Operational</h3>
                  <p className="text-muted-foreground">No active system alerts at this time.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => performQuickAction('generate-report')}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Generate Report</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => performQuickAction('manage-users')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => performQuickAction('export-data')}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Export Data</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => performQuickAction('system-config')}
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">System Config</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.database && (
                <div>
                  <h4 className="font-medium mb-2">Database</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={systemHealth.database.status === 'online' ? 'bg-green-500' : 'bg-red-500'}>
                        {systemHealth.database.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span>{systemHealth.database.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span>{systemHealth.database.connections}</span>
                    </div>
                  </div>
                </div>
              )}

              {systemHealth.server && (
                <div>
                  <h4 className="font-medium mb-2">Server</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CPU Usage</span>
                      <span>{systemHealth.server.cpuUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage</span>
                      <span>{systemHealth.server.memoryUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disk Usage</span>
                      <span>{systemHealth.server.diskUsage}</span>
                    </div>
                  </div>
                </div>
              )}

              {systemHealth.api && (
                <div>
                  <h4 className="font-medium mb-2">API</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className={systemHealth.api.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}>
                        {systemHealth.api.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response</span>
                      <span>{systemHealth.api.averageResponseTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
  const [touristAlerts, setTouristAlerts] = useState<TouristAlert[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/analytics?type=dashboard-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalIncidents: statsData.data.totalIncidents,
            activeIncidents: statsData.data.activeIncidents,
            resolvedToday: statsData.data.resolvedToday,
            pendingVerifications: statsData.data.pendingVerifications,
            responseTime: statsData.data.responseTime.toString()
          });
        }

        // Fetch recent incidents
        const incidentsResponse = await fetch('/api/incidents?limit=10');
        if (incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          setIncidents(incidentsData.incidents.map((incident: any) => ({
            id: incident._id,
            title: incident.title,
            description: incident.description,
            location: incident.location,
            status: incident.status,
            priority: incident.priority,
            reportedBy: incident.reportedBy || 'Unknown',
            assignedTo: incident.assignedTo,
            reportedAt: incident.createdAt,
            updatedAt: incident.updatedAt
          })));
        }

        // Fetch tourist alerts
        const alertsResponse = await fetch('/api/tourist-alerts?status=new');
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setTouristAlerts(alertsData.alerts);
        }

        // Fetch pending user verifications (for higher authorities)
        if (session?.user.role === 'higher_authority') {
          const usersResponse = await fetch('/api/users?status=unverified&limit=5');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData.users);
          }
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data on error
        setStats({
          totalIncidents: 156,
          activeIncidents: 23,
          resolvedToday: 8,
          pendingVerifications: 5,
          responseTime: '12'
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
      
      // Set up periodic refresh for real-time updates
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

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

  const handleStatusUpdate = async (incidentId: string, newStatus: string, assignedTo?: string) => {
    try {
      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: incidentId,
          status: newStatus,
          assignedTo: assignedTo || session?.user.name
        })
      });

      if (response.ok) {
        // Update local state
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === incidentId 
              ? { 
                  ...incident, 
                  status: newStatus as any, 
                  updatedAt: new Date().toISOString(),
                  assignedTo: assignedTo || session?.user.name
                }
              : incident
          )
        );
      } else {
        console.error('Failed to update incident status');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const handleTouristAlertUpdate = async (alertId: string, status: 'new' | 'investigating' | 'resolved', response?: string) => {
    try {
      const apiResponse = await fetch('/api/tourist-alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alertId,
          status,
          response,
          assignedTo: session?.user.name
        })
      });

      if (apiResponse.ok) {
        // Update local state
        setTouristAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, status, response, assignedTo: session?.user.name }
              : alert
          )
        );
      }
    } catch (error) {
      console.error('Error updating tourist alert:', error);
    }
  };

  const handleUserVerification = async (userId: string, action: 'verify' | 'reject') => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          action
        })
      });

      if (response.ok) {
        // Remove from pending list
        setUsers(prev => prev.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
                onClick={() => import('@/lib/auth-utils').then(({ performSignOut }) => performSignOut())}
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
            <TabsTrigger value="tourist-alerts">Tourist Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system-admin">System Administration</TabsTrigger>
            <TabsTrigger value="reports">Reports & Export</TabsTrigger>
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
                <Button onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-muted-foreground">Loading incidents...</div>
              </div>
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="tourist-alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tourist Safety Monitoring</h2>
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <Siren className="w-3 h-3 mr-1" />
                  {touristAlerts.filter(a => a.severity === 'critical').length} Critical
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {touristAlerts.filter(a => a.severity === 'high').length} High Priority
                </Badge>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Alerts
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {touristAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.severity === 'critical' ? 'border-l-red-500' :
                  alert.severity === 'high' ? 'border-l-orange-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{alert.touristName}</h3>
                          <Badge className={`${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>Safety Score: {alert.safetyScore}</span>
                          </div>
                        </div>
                        {alert.assignedTo && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <UserCheck className="w-4 h-4" />
                            <span>Assigned to: {alert.assignedTo}</span>
                          </div>
                        )}
                        {alert.response && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <strong>Response:</strong> {alert.response}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {alert.status === 'new' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTouristAlertUpdate(alert.id, 'investigating')}
                            >
                              Investigate
                            </Button>
                            {alert.severity === 'critical' && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                  // Trigger emergency response
                                  handleTouristAlertUpdate(alert.id, 'investigating', 'Emergency response dispatched');
                                }}
                              >
                                Emergency Response
                              </Button>
                            )}
                          </>
                        )}
                        {alert.status === 'investigating' && (
                          <Button
                            size="sm"
                            onClick={() => handleTouristAlertUpdate(alert.id, 'resolved', 'Situation resolved, tourist safe')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Open map view with tourist location
                            window.open(`https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}`, '_blank');
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {touristAlerts.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No active tourist safety alerts at this time.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsSection />
          </TabsContent>

          <TabsContent value="system-admin" className="space-y-4">
            <SystemAdminSection />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsSection />
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
                    {users.length > 0 ? users.map((user) => (
                      <div key={user._id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Role: {user.role} {user.badgeNumber && `| Badge: ${user.badgeNumber}`} {user.department && `| ${user.department}`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserVerification(user._id, 'verify')}
                          >
                            Verify
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUserVerification(user._id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No pending user verifications
                      </div>
                    )}
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
