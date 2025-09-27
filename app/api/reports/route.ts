import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Incident from '@/models/Incident';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only authorities can generate reports
    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');

    let data: any = {};

    switch (type) {
      case 'incidents-summary':
        data = await generateIncidentsSummaryReport(startDate, endDate, location);
        break;
      case 'performance-report':
        data = await generatePerformanceReport(startDate, endDate);
        break;
      case 'user-activity':
        data = await generateUserActivityReport(startDate, endDate);
        break;
      case 'safety-analysis':
        data = await generateSafetyAnalysisReport(startDate, endDate, location);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      report: data,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: session.user.name,
        type,
        filters: { startDate, endDate, location }
      }
    });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateIncidentsSummaryReport(startDate?: string | null, endDate?: string | null, location?: string | null) {
  const query: any = {};
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const [
    totalIncidents,
    incidentsByStatus,
    incidentsByPriority,
    incidentsByType,
    recentIncidents
  ] = await Promise.all([
    Incident.countDocuments(query),
    Incident.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Incident.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Incident.aggregate([
      { $match: query },
      { $group: { _id: { $substr: ['$title', 0, 20] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title description location status priority createdAt updatedAt')
  ]);

  return {
    summary: {
      totalIncidents,
      reportPeriod: startDate && endDate ? { startDate, endDate } : 'All time',
      locationFilter: location || 'All locations'
    },
    statusBreakdown: incidentsByStatus,
    priorityBreakdown: incidentsByPriority,
    commonIncidentTypes: incidentsByType,
    recentIncidents: recentIncidents.map(incident => ({
      id: incident._id,
      title: incident.title,
      location: incident.location,
      status: incident.status,
      priority: incident.priority,
      reportedAt: incident.createdAt,
      lastUpdated: incident.updatedAt
    }))
  };
}

async function generatePerformanceReport(startDate?: string | null, endDate?: string | null) {
  const query: any = {};
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const [
    totalIncidents,
    resolvedIncidents,
    avgResolutionTime,
    responseMetrics
  ] = await Promise.all([
    Incident.countDocuments(query),
    Incident.countDocuments({ ...query, status: 'resolved' }),
    calculateAverageResolutionTime(query),
    calculateResponseMetrics(query)
  ]);

  const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents * 100).toFixed(2) : '0';

  return {
    summary: {
      totalIncidents,
      resolvedIncidents,
      resolutionRate: `${resolutionRate}%`,
      avgResolutionTime: avgResolutionTime || 'N/A'
    },
    metrics: responseMetrics,
    recommendations: generatePerformanceRecommendations(resolutionRate, avgResolutionTime)
  };
}

async function generateUserActivityReport(startDate?: string | null, endDate?: string | null) {
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verified: { $sum: { $cond: ['$verified', 1, 0] } }
      }
    }
  ]);

  const recentRegistrations = await User.find({
    createdAt: startDate && endDate ? {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    } : { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })
    .select('name email role verified createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

  return {
    userStatistics: userStats,
    recentRegistrations: recentRegistrations.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      registeredAt: user.createdAt
    })),
    summary: {
      totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
      verificationPending: userStats.reduce((sum, stat) => sum + (stat.count - stat.verified), 0)
    }
  };
}

async function generateSafetyAnalysisReport(startDate?: string | null, endDate?: string | null, location?: string | null) {
  // This would include tourist safety metrics, geo-fence violations, emergency responses, etc.
  // For now, providing mock data structure that would be populated from real monitoring systems
  
  const mockSafetyData = {
    touristSafety: {
      totalTourists: 1247,
      activeTourists: 89,
      safetyAlerts: 23,
      emergencyResponses: 5,
      avgSafetyScore: 82
    },
    locationSafety: {
      highRiskAreas: [
        { area: 'Old Delhi Railway Station', riskLevel: 'High', incidents: 15 },
        { area: 'Connaught Place Night Market', riskLevel: 'Medium', incidents: 8 },
        { area: 'Chandni Chowk', riskLevel: 'Medium', incidents: 12 }
      ],
      safeZones: [
        { area: 'India Gate', safetyScore: 95 },
        { area: 'Red Fort', safetyScore: 88 },
        { area: 'Lotus Temple', safetyScore: 92 }
      ]
    },
    emergencyResponse: {
      avgResponseTime: '8.5 minutes',
      successfulRescues: 42,
      falseAlarms: 7,
      systemUptime: '99.8%'
    },
    recommendations: [
      'Increase security patrol frequency in Old Delhi Railway Station area',
      'Install additional emergency call boxes in high-risk zones',
      'Implement real-time crowd monitoring in popular tourist areas',
      'Enhance mobile app geo-fence accuracy for better tourist tracking'
    ]
  };

  return mockSafetyData;
}

async function calculateAverageResolutionTime(query: any) {
  // Mock calculation - in production, this would calculate based on incident timestamps
  return '4.2 hours';
}

async function calculateResponseMetrics(query: any) {
  // Mock metrics - in production, these would be calculated from real data
  return {
    avgFirstResponseTime: '12 minutes',
    avgResolutionTime: '4.2 hours',
    escalationRate: '8%',
    customerSatisfaction: '4.3/5'
  };
}

function generatePerformanceRecommendations(resolutionRate: string, avgResolutionTime: string) {
  const recommendations = [];
  
  if (parseFloat(resolutionRate) < 80) {
    recommendations.push('Resolution rate below 80%. Consider additional training for response teams.');
  }
  
  recommendations.push('Implement automated incident triage to improve response times.');
  recommendations.push('Set up real-time dashboards for better incident tracking.');
  
  return recommendations;
}

function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') {
    return 'No data available';
  }

  // Simple CSV conversion - in production, use a proper CSV library
  const headers = Object.keys(data);
  const csvRows = [headers.join(',')];
  
  // This is a simplified CSV conversion
  // In production, you'd want to handle nested objects properly
  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });
  } else {
    // For object data, create a simple key-value CSV
    csvRows.push('Field,Value');
    Object.entries(data).forEach(([key, value]) => {
      csvRows.push(`"${key}","${JSON.stringify(value).replace(/"/g, '""')}"`);
    });
  }
  
  return csvRows.join('\n');
}
