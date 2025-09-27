import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

interface SystemAlert {
  id: string;
  type: 'performance' | 'data' | 'security' | 'system' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  details?: any;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

// Mock system alerts - In production, these would come from monitoring systems
let systemAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'performance',
    severity: 'medium',
    title: 'High Server Load',
    description: 'Server CPU usage at 85% - monitoring required',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    source: 'System Monitor',
    details: {
      cpuUsage: '85%',
      memoryUsage: '72%',
      diskUsage: '68%',
      activeConnections: 245
    }
  },
  {
    id: '2',
    type: 'data',
    severity: 'high',
    title: 'Database Backup Failed',
    description: 'Scheduled backup failed - manual intervention required',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: 'active',
    source: 'Backup Service',
    details: {
      backupType: 'scheduled',
      lastSuccessful: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      errorCode: 'DISK_FULL',
      retryCount: 3
    }
  },
  {
    id: '3',
    type: 'security',
    severity: 'critical',
    title: 'Suspicious Login Attempts',
    description: 'Multiple failed login attempts detected from unusual locations',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
    source: 'Security Monitor',
    details: {
      attemptCount: 15,
      sourceIPs: ['192.168.1.100', '10.0.0.25'],
      targetAccounts: ['admin', 'operator'],
      blocked: true
    }
  },
  {
    id: '4',
    type: 'system',
    severity: 'low',
    title: 'Certificate Expiring Soon',
    description: 'SSL certificate expires in 7 days',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'acknowledged',
    source: 'Certificate Monitor',
    acknowledgedBy: 'System Admin',
    acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    details: {
      domain: 'yatrirakshak.gov.in',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      issuer: 'DigiCert'
    }
  },
  {
    id: '5',
    type: 'network',
    severity: 'medium',
    title: 'API Rate Limit Exceeded',
    description: 'High API usage detected - consider scaling',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'resolved',
    source: 'API Gateway',
    resolvedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    details: {
      endpoint: '/api/analytics',
      requestCount: 1250,
      timeWindow: '1 hour',
      threshold: 1000
    }
  }
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only authorities can access system alerts
    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');

    let filteredAlerts = systemAlerts;

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    // Sort by severity and timestamp
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    filteredAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Generate system health metrics
    const systemHealth = await getSystemHealth();

    return NextResponse.json({
      alerts: filteredAlerts,
      summary: {
        total: systemAlerts.length,
        active: systemAlerts.filter(a => a.status === 'active').length,
        acknowledged: systemAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: systemAlerts.filter(a => a.status === 'resolved').length,
        critical: systemAlerts.filter(a => a.severity === 'critical').length,
        high: systemAlerts.filter(a => a.severity === 'high').length
      },
      systemHealth,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('System alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system alerts' },
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

    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    const alertIndex = systemAlerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const alert = systemAlerts[alertIndex];

    switch (action) {
      case 'acknowledge':
        alert.status = 'acknowledged';
        alert.acknowledgedBy = session.user.name;
        alert.acknowledgedAt = new Date().toISOString();
        break;
      case 'resolve':
        alert.status = 'resolved';
        alert.resolvedAt = new Date().toISOString();
        if (!alert.acknowledgedBy) {
          alert.acknowledgedBy = session.user.name;
          alert.acknowledgedAt = new Date().toISOString();
        }
        break;
      case 'reopen':
        alert.status = 'active';
        alert.acknowledgedBy = undefined;
        alert.acknowledgedAt = undefined;
        alert.resolvedAt = undefined;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alert,
      message: `Alert ${action}d successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('Update system alert error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
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

    if (!['higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { type, severity, title, description, details } = body;

    if (!type || !severity || !title || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, severity, title, description' 
      }, { status: 400 });
    }

    const newAlert: SystemAlert = {
      id: Date.now().toString(),
      type,
      severity,
      title,
      description,
      timestamp: new Date().toISOString(),
      status: 'active',
      source: `Manual - ${session.user.name}`,
      details
    };

    systemAlerts.unshift(newAlert);

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'System alert created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create system alert error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

async function getSystemHealth() {
  // In production, these would be real system metrics
  try {
    await connectDB();
    
    return {
      database: {
        status: 'online',
        responseTime: Math.floor(Math.random() * 50) + 10 + 'ms',
        connections: Math.floor(Math.random() * 20) + 5
      },
      server: {
        uptime: '15 days, 3 hours',
        cpuUsage: Math.floor(Math.random() * 30) + 20 + '%',
        memoryUsage: Math.floor(Math.random() * 25) + 45 + '%',
        diskUsage: Math.floor(Math.random() * 20) + 30 + '%'
      },
      api: {
        status: 'healthy',
        averageResponseTime: Math.floor(Math.random() * 100) + 150 + 'ms',
        requestsPerMinute: Math.floor(Math.random() * 200) + 50
      },
      security: {
        status: 'secure',
        lastSecurityScan: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        threatLevel: 'low'
      }
    };
  } catch (error) {
    return {
      database: { status: 'offline', responseTime: 'N/A', connections: 0 },
      server: { uptime: 'Unknown', cpuUsage: 'N/A', memoryUsage: 'N/A', diskUsage: 'N/A' },
      api: { status: 'error', averageResponseTime: 'N/A', requestsPerMinute: 0 },
      security: { status: 'unknown', lastSecurityScan: 'N/A', threatLevel: 'unknown' }
    };
  }
}
