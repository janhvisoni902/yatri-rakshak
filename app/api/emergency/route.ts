import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    const body = await req.json();
    const { type, location, coordinates, message, timestamp, additionalInfo } = body;

    // Create emergency alert (works with or without session)
    const emergencyAlert = {
      id: `EMG-${Date.now()}`,
      type: type || 'panic_button',
      user: session ? {
        id: session.user?.id || 'anonymous',
        name: session.user?.name || 'Anonymous User',
        email: session.user?.email || null
      } : {
        id: 'anonymous',
        name: 'Anonymous User',
        email: null
      },
      location: location || null,
      coordinates: coordinates || null,
      message: message || 'Emergency assistance requested',
      timestamp: timestamp || new Date().toISOString(),
      status: 'active',
      priority: 'critical',
      additionalInfo: additionalInfo || {}
    };

    // Get nearby emergency services if location provided
    let nearbyServices = null;
    if (location?.lat && location?.lng) {
      nearbyServices = await getNearbyEmergencyServices(location.lat, location.lng);
    }

    // Simulate emergency response
    console.log('🚨 EMERGENCY ALERT ACTIVATED:', emergencyAlert);

    // In production, this would:
    // 1. Store in database
    // 2. Send SMS/calls to emergency contacts
    // 3. Alert police dispatch system
    // 4. Notify nearby patrol units
    // 5. Start live tracking
    // 6. Send push notifications

    return NextResponse.json({
      success: true,
      alert: emergencyAlert,
      nearbyServices,
      response: {
        emergencyId: emergencyAlert.id,
        status: 'dispatched',
        police: { contacted: true, eta: '5-10 minutes', unit: 'Unit-7' },
        medical: { contacted: true, eta: '8-12 minutes', unit: 'Ambulance-3' },
        emergencyContacts: { notified: session ? true : false, count: session ? 3 : 0 },
        trackingActive: true,
        message: 'Emergency services have been alerted. Help is on the way.'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Emergency alert error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency alert' },
      { status: 500 }
    );
  }
}

// Helper function to get nearby emergency services
async function getNearbyEmergencyServices(lat: number, lng: number) {
  // Mock nearby services - in production, use Google Places API
  const services = [
    {
      type: 'police_station',
      name: 'Delhi Police Station - Connaught Place',
      address: 'Connaught Place, New Delhi',
      distance: calculateDistance(lat, lng, 28.6315, 77.2167),
      contact: '011-23341234',
      available: true
    },
    {
      type: 'hospital',
      name: 'AIIMS Emergency',
      address: 'All India Institute of Medical Sciences',
      distance: calculateDistance(lat, lng, 28.5672, 77.2100),
      contact: '011-26588500',
      available: true
    },
    {
      type: 'women_safety',
      name: 'Women Safety Center',
      address: 'Janpath, New Delhi',
      distance: calculateDistance(lat, lng, 28.6139, 77.2090),
      contact: '011-23388888',
      available: true
    }
  ];

  return services
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(service => ({
      ...service,
      distanceFormatted: service.distance < 1 ? 
        `${Math.round(service.distance * 1000)}m` : 
        `${service.distance.toFixed(1)}km`,
      eta: Math.ceil(service.distance * 2) + ' min' // Rough estimate
    }));
}

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    // If coordinates provided, return nearby emergency services
    if (lat !== 0 && lng !== 0) {
      const nearbyServices = await getNearbyEmergencyServices(lat, lng);
      return NextResponse.json({ 
        success: true, 
        nearbyServices,
        location: { lat, lng }
      });
    }

    // Otherwise return emergency history (if user is logged in)
    if (!session) {
      return NextResponse.json({ 
        success: true, 
        emergencyHistory: [],
        message: 'Login required for emergency history' 
      });
    }

    // Mock emergency history
    const emergencyHistory = [
      {
        id: 'EMG-1704454800000',
        type: 'panic_button',
        location: 'Red Fort, Delhi',
        coordinates: { lat: 28.6562, lng: 77.2410 },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        responseTime: '6 minutes',
        respondingUnit: 'Unit-7'
      },
      {
        id: 'EMG-1704368400000',
        type: 'women_safety_sos',
        location: 'Connaught Place, Delhi',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        responseTime: '4 minutes',
        respondingUnit: 'Women Safety Patrol'
      }
    ];

    return NextResponse.json({ 
      success: true, 
      emergencyHistory 
    });

  } catch (error) {
    console.error('Get emergency data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency data' },
      { status: 500 }
    );
  }
}
