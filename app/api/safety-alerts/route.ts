import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '10'); // km
    const severity = searchParams.get('severity'); // filter by severity
    const type = searchParams.get('type'); // filter by alert type

    // Mock safety alerts data
    const allAlerts = [
      {
        id: '1',
        type: 'harassment',
        title: 'Multiple Harassment Reports',
        message: 'Several women have reported harassment by local vendors in this area',
        location: 'Rajiv Chowk Metro Station, New Delhi',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        severity: 'high',
        status: 'investigating',
        reportedBy: 'Anonymous Users (5)',
        reportedAt: '2025-01-04T14:30:00Z',
        lastUpdated: '2025-01-04T15:00:00Z',
        verifiedReports: 5,
        actionTaken: 'Increased patrol presence, vendor warnings issued',
        safetyTips: [
          'Travel in groups when possible',
          'Use main metro entrances',
          'Report any incidents immediately'
        ]
      },
      {
        id: '2',
        type: 'unsafe_area',
        title: 'Poor Lighting and Isolated Area',
        message: 'Dark, poorly lit area with minimal foot traffic after 8 PM',
        location: 'Lodhi Gardens - East Gate Area',
        coordinates: { lat: 28.5918, lng: 77.2273 },
        severity: 'medium',
        status: 'active',
        reportedBy: 'Tourist Safety Patrol',
        reportedAt: '2025-01-04T13:15:00Z',
        lastUpdated: '2025-01-04T13:15:00Z',
        verifiedReports: 3,
        actionTaken: 'Lighting improvement requested, increased patrol schedule',
        safetyTips: [
          'Avoid this area after sunset',
          'Use well-lit main paths',
          'Consider alternative routes'
        ]
      },
      {
        id: '3',
        type: 'stalking',
        title: 'Stalking Incident Reported',
        message: 'Tourist reported being followed from hotel to shopping area',
        location: 'Karol Bagh Market Area',
        coordinates: { lat: 28.6519, lng: 77.1909 },
        severity: 'high',
        status: 'resolved',
        reportedBy: 'Tourist via App',
        reportedAt: '2025-01-04T12:45:00Z',
        lastUpdated: '2025-01-04T14:00:00Z',
        verifiedReports: 1,
        actionTaken: 'Suspect identified and warned, increased surveillance',
        safetyTips: [
          'Stay alert in crowded markets',
          'Inform hotel staff of your plans',
          'Use official transportation'
        ]
      },
      {
        id: '4',
        type: 'suspicious_activity',
        title: 'Suspicious Individuals Near Tourist Areas',
        message: 'Reports of individuals approaching female tourists with fake offers',
        location: 'Red Fort - Main Entrance',
        coordinates: { lat: 28.6562, lng: 77.2410 },
        severity: 'medium',
        status: 'investigating',
        reportedBy: 'Security Personnel',
        reportedAt: '2025-01-04T11:30:00Z',
        lastUpdated: '2025-01-04T12:00:00Z',
        verifiedReports: 4,
        actionTaken: 'Security briefed, warning signs posted',
        safetyTips: [
          'Be wary of unsolicited offers',
          'Stick to official tour guides',
          'Keep valuables secure'
        ]
      },
      {
        id: '5',
        type: 'emergency',
        title: 'Medical Emergency Response',
        message: 'Female tourist required medical assistance, response successful',
        location: 'India Gate - Central Lawn',
        coordinates: { lat: 28.6129, lng: 77.2295 },
        severity: 'critical',
        status: 'resolved',
        reportedBy: 'Emergency Services',
        reportedAt: '2025-01-04T10:15:00Z',
        lastUpdated: '2025-01-04T11:00:00Z',
        verifiedReports: 1,
        actionTaken: 'Medical team dispatched, tourist safely transported to hospital',
        safetyTips: [
          'Know emergency contact numbers',
          'Carry medical information',
          'Stay hydrated in hot weather'
        ]
      }
    ];

    // Calculate distance and filter alerts
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    let filteredAlerts = allAlerts;

    // Filter by location if coordinates provided
    if (lat !== 0 && lng !== 0) {
      filteredAlerts = allAlerts
        .map(alert => ({
          ...alert,
          distance: calculateDistance(lat, lng, alert.coordinates.lat, alert.coordinates.lng)
        }))
        .filter(alert => alert.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Filter by severity
    if (severity && severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    // Filter by type
    if (type && type !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    // Add formatted distance
    const alertsWithFormattedDistance = filteredAlerts.map(alert => ({
      ...alert,
      distanceFormatted: (alert as any).distance ? 
        (alert as any).distance < 1 ? 
          `${Math.round((alert as any).distance * 1000)}m away` : 
          `${(alert as any).distance.toFixed(1)}km away` 
        : null,
      timeAgo: getTimeAgo(alert.reportedAt)
    }));

    return NextResponse.json({
      success: true,
      alerts: alertsWithFormattedDistance,
      total: alertsWithFormattedDistance.length,
      summary: {
        high: alertsWithFormattedDistance.filter(a => a.severity === 'high').length,
        medium: alertsWithFormattedDistance.filter(a => a.severity === 'medium').length,
        low: alertsWithFormattedDistance.filter(a => a.severity === 'low').length,
        critical: alertsWithFormattedDistance.filter(a => a.severity === 'critical').length,
        active: alertsWithFormattedDistance.filter(a => a.status === 'active').length,
        investigating: alertsWithFormattedDistance.filter(a => a.status === 'investigating').length,
        resolved: alertsWithFormattedDistance.filter(a => a.status === 'resolved').length
      }
    });

  } catch (error) {
    console.error('Safety alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, message, location, coordinates, severity, anonymous } = body;

    // Validate required fields
    if (!type || !message || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message, location' },
        { status: 400 }
      );
    }

    // Create new safety alert
    const newAlert = {
      id: `alert-${Date.now()}`,
      type,
      title: title || `${type.replace('_', ' ')} Report`,
      message,
      location,
      coordinates: coordinates || null,
      severity: severity || 'medium',
      status: 'active',
      reportedBy: anonymous ? 'Anonymous User' : session.user.name,
      reportedByUserId: session.user.id,
      reportedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      verifiedReports: 1,
      actionTaken: null,
      safetyTips: [],
      metadata: {
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        anonymous
      }
    };

    // In production, you would:
    // 1. Save to database
    // 2. Notify nearby users
    // 3. Alert authorities if high severity
    // 4. Trigger safety protocols
    // 5. Send to moderation queue

    // Auto-alert authorities for high severity incidents
    if (severity === 'high' || severity === 'critical') {
      // Mock authority notification
      console.log(`High severity alert created - notifying authorities: ${newAlert.id}`);
      
      // In production:
      // - Send to police dispatch
      // - Alert women safety patrol
      // - Notify nearby safety zones
      // - Trigger emergency protocols
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Safety alert reported successfully. Authorities have been notified.'
    });

  } catch (error) {
    console.error('Safety alert creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create safety alert' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now.getTime() - alertTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}