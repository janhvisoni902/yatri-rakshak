import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '5'); // km

    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude required' },
        { status: 400 }
      );
    }

    // In production, this would query a database of risk zones based on:
    // - Historical crime data
    // - Recent incident reports
    // - Time of day analysis
    // - Crowd density data
    // - Lighting conditions
    // - Police patrol coverage
    // - Community reports

    const mockRiskZones = [
      {
        id: 'risk-1',
        name: 'High Crime Area - Old Delhi Market',
        center: { lat: lat + 0.008, lng: lng + 0.012 },
        radius: 400, // meters
        riskLevel: 'high',
        reasons: [
          'Multiple theft incidents reported in last 30 days',
          'Poor lighting conditions after sunset',
          'Limited police patrol coverage',
          'Crowded narrow lanes with limited escape routes'
        ],
        recommendations: [
          'Avoid visiting after 8 PM',
          'Travel in groups of 2 or more',
          'Keep valuables in front pockets',
          'Use main roads and avoid narrow alleys',
          'Stay alert and avoid distractions'
        ],
        lastUpdated: new Date().toISOString(),
        incidentCount: 12,
        severity: 'theft_hotspot'
      },
      {
        id: 'risk-2',
        name: 'Moderate Risk Zone - Tourist Market Area',
        center: { lat: lat - 0.005, lng: lng + 0.008 },
        radius: 300,
        riskLevel: 'medium',
        reasons: [
          'Pickpocket incidents during peak hours',
          'Aggressive vendors reported',
          'Fake goods and overcharging common',
          'Crowded area with limited security'
        ],
        recommendations: [
          'Keep bags zipped and in front',
          'Negotiate prices beforehand',
          'Avoid displaying expensive items',
          'Stay with your group',
          'Use official shops when possible'
        ],
        lastUpdated: new Date().toISOString(),
        incidentCount: 6,
        severity: 'tourist_scam_area'
      },
      {
        id: 'risk-3',
        name: 'Low Risk - Well Patrolled Area',
        center: { lat: lat + 0.003, lng: lng - 0.006 },
        radius: 200,
        riskLevel: 'low',
        reasons: [
          'Regular police patrols',
          'Good lighting and CCTV coverage',
          'Active community watch',
          'Well-maintained public spaces'
        ],
        recommendations: [
          'Generally safe for tourists',
          'Still maintain basic precautions',
          'Good area for evening walks',
          'Reliable transportation available'
        ],
        lastUpdated: new Date().toISOString(),
        incidentCount: 1,
        severity: 'safe_zone'
      },
      {
        id: 'risk-4',
        name: 'Critical Risk - Isolated Construction Area',
        center: { lat: lat - 0.012, lng: lng - 0.008 },
        radius: 500,
        riskLevel: 'critical',
        reasons: [
          'Isolated area with no foot traffic',
          'Active construction with safety hazards',
          'No lighting or security presence',
          'Recent reports of harassment incidents',
          'No mobile network coverage in some areas'
        ],
        recommendations: [
          'AVOID THIS AREA COMPLETELY',
          'Use alternative routes',
          'If must pass, travel in large groups',
          'Inform someone of your route',
          'Carry emergency whistle or alarm'
        ],
        lastUpdated: new Date().toISOString(),
        incidentCount: 8,
        severity: 'danger_zone'
      }
    ];

    // Calculate distance and filter zones within radius
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const zonesWithDistance = mockRiskZones
      .map(zone => ({
        ...zone,
        distance: calculateDistance(lat, lng, zone.center.lat, zone.center.lng)
      }))
      .filter(zone => zone.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // Add time-based risk adjustments
    const currentHour = new Date().getHours();
    const isNightTime = currentHour < 6 || currentHour > 22;
    
    const adjustedZones = zonesWithDistance.map(zone => {
      let adjustedRiskLevel = zone.riskLevel;
      let timeBasedWarning = null;

      if (isNightTime) {
        // Increase risk level at night
        if (zone.riskLevel === 'low') adjustedRiskLevel = 'medium';
        else if (zone.riskLevel === 'medium') adjustedRiskLevel = 'high';
        
        timeBasedWarning = 'Risk level increased due to nighttime hours';
      }

      return {
        ...zone,
        adjustedRiskLevel,
        timeBasedWarning,
        distanceFormatted: zone.distance < 1 ? 
          `${Math.round(zone.distance * 1000)}m away` : 
          `${zone.distance.toFixed(1)}km away`
      };
    });

    // Generate risk summary
    const riskSummary = {
      totalZones: adjustedZones.length,
      highRiskZones: adjustedZones.filter(z => z.adjustedRiskLevel === 'high' || z.adjustedRiskLevel === 'critical').length,
      mediumRiskZones: adjustedZones.filter(z => z.adjustedRiskLevel === 'medium').length,
      lowRiskZones: adjustedZones.filter(z => z.adjustedRiskLevel === 'low').length,
      nearestHighRisk: adjustedZones.find(z => z.adjustedRiskLevel === 'high' || z.adjustedRiskLevel === 'critical'),
      overallAreaRisk: adjustedZones.length > 0 ? 
        adjustedZones.some(z => z.adjustedRiskLevel === 'critical') ? 'critical' :
        adjustedZones.some(z => z.adjustedRiskLevel === 'high') ? 'high' :
        adjustedZones.some(z => z.adjustedRiskLevel === 'medium') ? 'medium' : 'low'
        : 'low',
      timeOfDay: isNightTime ? 'night' : 'day',
      recommendations: isNightTime ? [
        'Extra caution advised during nighttime',
        'Stay in well-lit areas',
        'Travel in groups when possible',
        'Keep emergency contacts ready'
      ] : [
        'Maintain standard safety precautions',
        'Stay aware of your surroundings',
        'Follow local guidelines'
      ]
    };

    return NextResponse.json({
      success: true,
      zones: adjustedZones,
      summary: riskSummary,
      searchParams: {
        location: { lat, lng },
        radius: `${radius}km`,
        timeOfDay: isNightTime ? 'night' : 'day'
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk zones API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk zones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { location, riskType, description, severity } = body;

    // In production, this would allow users to report new risk areas
    const newRiskReport = {
      id: `report-${Date.now()}`,
      location,
      riskType,
      description,
      severity: severity || 'medium',
      reportedAt: new Date().toISOString(),
      status: 'pending_verification',
      reportedBy: 'anonymous' // In production, use session data
    };

    // Mock response - in production, save to database and trigger review process
    return NextResponse.json({
      success: true,
      report: newRiskReport,
      message: 'Risk area report submitted successfully. It will be reviewed by our safety team.'
    });

  } catch (error) {
    console.error('Risk report submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit risk report' },
      { status: 500 }
    );
  }
}