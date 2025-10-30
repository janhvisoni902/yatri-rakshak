import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '5'); // km
    const type = searchParams.get('type'); // filter by zone type

    // Mock safety zones data - in production, this would come from a database
    const allSafetyZones = [
      {
        id: '1',
        name: 'Delhi Police Station - Connaught Place',
        type: 'police_station',
        address: 'Connaught Place, New Delhi, Delhi 110001',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        contact: '011-23341234',
        hours: '24/7',
        rating: 4.8,
        verified: true,
        services: ['Emergency Response', 'Women Safety Cell', 'Tourist Help'],
        facilities: ['CCTV Monitoring', 'Female Officers', 'Interpreter Services'],
        lastUpdated: '2025-01-04T10:00:00Z'
      },
      {
        id: '2',
        name: 'All India Institute of Medical Sciences',
        type: 'hospital',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
        coordinates: { lat: 28.5672, lng: 77.2100 },
        contact: '011-26588500',
        hours: '24/7',
        rating: 4.9,
        verified: true,
        services: ['Emergency Care', 'Trauma Center', 'Women Health'],
        facilities: ['Ambulance Service', 'Female Doctors', 'Pharmacy'],
        lastUpdated: '2025-01-04T09:30:00Z'
      },
      {
        id: '3',
        name: 'Women Safety Center - Janpath',
        type: 'safe_house',
        address: 'Janpath, New Delhi, Delhi 110001',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        contact: '011-23388888',
        hours: '24/7',
        rating: 4.7,
        verified: true,
        services: ['Counseling', 'Legal Aid', 'Temporary Shelter'],
        facilities: ['Female Staff', 'Confidential Support', 'Multilingual Help'],
        lastUpdated: '2025-01-04T11:00:00Z'
      },
      {
        id: '4',
        name: 'Embassy of United States',
        type: 'embassy',
        address: 'Shantipath, Chanakyapuri, New Delhi, Delhi 110021',
        coordinates: { lat: 28.5986, lng: 77.1887 },
        contact: '011-24198000',
        hours: '08:30-17:30 (Mon-Fri)',
        rating: 4.5,
        verified: true,
        services: ['Citizen Services', 'Emergency Assistance', 'Consular Support'],
        facilities: ['Security', 'Interpreter Services', 'Emergency Contact'],
        lastUpdated: '2025-01-04T08:00:00Z'
      },
      {
        id: '5',
        name: 'The Imperial Hotel',
        type: 'hotel',
        address: 'Janpath, New Delhi, Delhi 110001',
        coordinates: { lat: 28.6127, lng: 77.2197 },
        contact: '011-23341234',
        hours: '24/7',
        rating: 4.6,
        verified: true,
        services: ['Safe Accommodation', 'Concierge', 'Tourist Information'],
        facilities: ['Security Guards', 'CCTV', 'Safe Deposit'],
        lastUpdated: '2025-01-04T12:00:00Z'
      },
      {
        id: '6',
        name: 'India Gate - Tourist Information Center',
        type: 'public_place',
        address: 'Rajpath, India Gate, New Delhi, Delhi 110003',
        coordinates: { lat: 28.6129, lng: 77.2295 },
        contact: '011-23386000',
        hours: '06:00-22:00',
        rating: 4.3,
        verified: true,
        services: ['Tourist Information', 'Emergency Contact', 'First Aid'],
        facilities: ['Security Personnel', 'Public Toilets', 'Well-lit Area'],
        lastUpdated: '2025-01-04T13:00:00Z'
      }
    ];

    // Calculate distance between two coordinates (Haversine formula)
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

    // Filter zones by location and type
    let filteredZones = allSafetyZones;

    // Filter by location if coordinates provided
    if (lat !== 0 && lng !== 0) {
      filteredZones = allSafetyZones
        .map(zone => ({
          ...zone,
          distance: calculateDistance(lat, lng, zone.coordinates.lat, zone.coordinates.lng)
        }))
        .filter(zone => zone.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      filteredZones = filteredZones.filter(zone => zone.type === type);
    }

    // Add formatted distance
    const zonesWithFormattedDistance = filteredZones.map(zone => ({
      ...zone,
      distanceFormatted: (zone as any).distance ? 
        (zone as any).distance < 1 ? 
          `${Math.round((zone as any).distance * 1000)}m` : 
          `${(zone as any).distance.toFixed(1)}km` 
        : null
    }));

    return NextResponse.json({
      success: true,
      zones: zonesWithFormattedDistance,
      total: zonesWithFormattedDistance.length,
      searchParams: {
        location: lat !== 0 && lng !== 0 ? { lat, lng } : null,
        radius,
        type: type || 'all'
      }
    });

  } catch (error) {
    console.error('Safety zones API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety zones' },
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
    const { name, type, address, coordinates, contact, hours, description } = body;

    // Validate required fields
    if (!name || !type || !address || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, address, coordinates' },
        { status: 400 }
      );
    }

    // Create new safety zone (in production, save to database)
    const newZone = {
      id: `zone-${Date.now()}`,
      name,
      type,
      address,
      coordinates,
      contact: contact || null,
      hours: hours || null,
      description: description || null,
      rating: 0,
      verified: false, // Requires admin verification
      services: [],
      facilities: [],
      reportedBy: session.user.id,
      reportedByName: session.user.name,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'pending_verification'
    };

    // In production, you would:
    // 1. Save to database
    // 2. Send for admin verification
    // 3. Notify nearby users of new safety zone
    // 4. Validate coordinates and address

    return NextResponse.json({
      success: true,
      zone: newZone,
      message: 'Safety zone reported successfully. It will be verified by our team.'
    });

  } catch (error) {
    console.error('Safety zone creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create safety zone' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update safety zone
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, rating, review, reportIssue } = body;

    if (!id) {
      return NextResponse.json({ error: 'Zone ID required' }, { status: 400 });
    }

    // Mock update response
    const updateResponse: any = {
      id,
      updated: true,
      timestamp: new Date().toISOString()
    };

    if (rating) {
      updateResponse.rating = {
        newRating: rating,
        reviewBy: session.user?.name,
        reviewText: review || null
      };
    }

    if (reportIssue) {
      updateResponse.issueReported = {
        issue: reportIssue,
        reportedBy: session.user?.name,
        status: 'under_review'
      };
    }

    return NextResponse.json({
      success: true,
      update: updateResponse,
      message: 'Safety zone updated successfully'
    });

  } catch (error) {
    console.error('Safety zone update error:', error);
    return NextResponse.json(
      { error: 'Failed to update safety zone' },
      { status: 500 }
    );
  }
}