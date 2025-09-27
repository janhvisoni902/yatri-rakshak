import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Tourist Alert interface
interface TouristAlert {
  id: string;
  touristId: string;
  touristName: string;
  type: 'panic' | 'geo_fence' | 'anomaly' | 'missing' | 'route_deviation' | 'inactive' | 'emergency';
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

// Mock tourist alert data - In production, this would come from real-time monitoring systems
const mockAlerts: TouristAlert[] = [
  {
    id: '1',
    touristId: 'tourist_001',
    touristName: 'John Smith',
    type: 'panic',
    message: 'Emergency SOS button activated - immediate assistance required',
    location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
    severity: 'critical',
    status: 'new',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    lastLocation: 'Connaught Place Metro Station',
    safetyScore: 85
  },
  {
    id: '2',
    touristId: 'tourist_002',
    touristName: 'Emma Johnson',
    type: 'geo_fence',
    message: 'Tourist has moved outside designated safe zone',
    location: { lat: 28.6562, lng: 77.2410, address: 'Old Delhi Railway Station' },
    severity: 'medium',
    status: 'investigating',
    assignedTo: 'Officer Sharma',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    lastLocation: 'Red Fort area',
    safetyScore: 72
  },
  {
    id: '3',
    touristId: 'tourist_003',
    touristName: 'Michael Chen',
    type: 'anomaly',
    message: 'Unusual movement pattern detected - possible distress',
    location: { lat: 28.6129, lng: 77.2295, address: 'India Gate' },
    severity: 'high',
    status: 'new',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    lastLocation: 'Raj Path',
    safetyScore: 68
  },
  {
    id: '4',
    touristId: 'tourist_004',
    touristName: 'Sarah Williams',
    type: 'inactive',
    message: 'No movement detected for extended period - wellness check required',
    location: { lat: 28.6273, lng: 77.1716, address: 'Karol Bagh Market' },
    severity: 'medium',
    status: 'new',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    lastLocation: 'Karol Bagh Shopping Area',
    safetyScore: 79
  },
  {
    id: '5',
    touristId: 'tourist_005',
    touristName: 'David Rodriguez',
    type: 'route_deviation',
    message: 'Tourist significantly off planned route - potential navigation issue',
    location: { lat: 28.5494, lng: 77.2500, address: 'Mehrauli Archaeological Park' },
    severity: 'low',
    status: 'resolved',
    assignedTo: 'Constable Kumar',
    response: 'Tourist contacted and provided with correct directions. Safe route guidance sent to mobile app.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    lastLocation: 'Qutub Minar Complex',
    safetyScore: 88
  }
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only authorities can access tourist alerts
    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');

    let filteredAlerts = mockAlerts;

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    if (assignedTo) {
      filteredAlerts = filteredAlerts.filter(alert => alert.assignedTo === assignedTo);
    }

    // Sort by timestamp (newest first) and severity
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    filteredAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Generate statistics
    const stats = {
      total: filteredAlerts.length,
      new: filteredAlerts.filter(a => a.status === 'new').length,
      investigating: filteredAlerts.filter(a => a.status === 'investigating').length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
      medium: filteredAlerts.filter(a => a.severity === 'medium').length,
      low: filteredAlerts.filter(a => a.severity === 'low').length,
      averageSafetyScore: filteredAlerts.length > 0 
        ? Math.round(filteredAlerts.reduce((sum, alert) => sum + alert.safetyScore, 0) / filteredAlerts.length)
        : 0
    };

    return NextResponse.json({
      alerts: filteredAlerts,
      stats,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Get tourist alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tourist alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      touristId, 
      type, 
      message, 
      location, 
      severity = 'medium',
      safetyScore = 75 
    } = body;

    if (!touristId || !type || !message || !location) {
      return NextResponse.json({ 
        error: 'Missing required fields: touristId, type, message, location' 
      }, { status: 400 });
    }

    // In production, you would:
    // 1. Save to database
    // 2. Send push notifications to nearby officers
    // 3. Update real-time monitoring systems
    // 4. Trigger automatic response protocols
    // 5. Log the alert in incident management system

    const newAlert: TouristAlert = {
      id: Date.now().toString(),
      touristId,
      touristName: `Tourist ${touristId}`, // Would fetch from user database
      type,
      message,
      location,
      severity,
      status: 'new',
      timestamp: new Date().toISOString(),
      lastLocation: location.address,
      safetyScore
    };

    // Add to mock data (in production, save to database)
    mockAlerts.unshift(newAlert);

    // Simulate emergency response for critical alerts
    if (severity === 'critical' || type === 'panic') {
      // Auto-assign to nearest available officer
      newAlert.assignedTo = 'Nearest Available Officer';
      newAlert.status = 'investigating';
      
      console.log('🚨 CRITICAL TOURIST ALERT:', newAlert);
      
      // In production, trigger:
      // - SMS to emergency contacts
      // - Push notification to nearby officers
      // - Update on admin dashboard
      // - Coordinate with emergency services
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: severity === 'critical' 
        ? 'Critical alert created and emergency response initiated'
        : 'Tourist alert created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create tourist alert error:', error);
    return NextResponse.json(
      { error: 'Failed to create tourist alert' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only authorities can update alerts
    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, assignedTo, response, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const alertIndex = mockAlerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Update the alert
    if (status) mockAlerts[alertIndex].status = status;
    if (assignedTo) mockAlerts[alertIndex].assignedTo = assignedTo;
    if (response) mockAlerts[alertIndex].response = response;

    // Log the update (in production, save to database)
    console.log(`Tourist alert ${id} updated by ${session.user.name}:`, {
      status,
      assignedTo,
      response
    });

    return NextResponse.json({
      success: true,
      alert: mockAlerts[alertIndex],
      message: 'Tourist alert updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Update tourist alert error:', error);
    return NextResponse.json(
      { error: 'Failed to update tourist alert' },
      { status: 500 }
    );
  }
}
