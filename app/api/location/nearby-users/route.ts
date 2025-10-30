import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view other users' locations
    const authorizedRoles = ['police', 'higher_authority', 'admin'];
    if (!authorizedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '10'); // km
    const status = searchParams.get('status'); // filter by safety status
    const role = searchParams.get('role'); // filter by user role

    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude required' },
        { status: 400 }
      );
    }

    // In production, this would query the database for users within the radius
    // with proper privacy filtering based on user preferences and permissions
    
    const mockUsers = [
      {
        userId: 'user-1',
        userName: 'Tourist John',
        userRole: 'tourist',
        location: {
          lat: lat + 0.005,
          lng: lng + 0.005,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          accuracy: 10
        },
        isTracking: true,
        privacyLevel: 'authorities_only',
        lastSeen: '5 minutes ago',
        safetyStatus: 'safe',
        distance: calculateDistance(lat, lng, lat + 0.005, lng + 0.005),
        emergencyContacts: 2,
        digitalId: 'DID-2025-001'
      },
      {
        userId: 'user-2',
        userName: 'Tourist Sarah',
        userRole: 'tourist',
        location: {
          lat: lat - 0.008,
          lng: lng + 0.003,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          accuracy: 15
        },
        isTracking: true,
        privacyLevel: 'authorities_only',
        lastSeen: '2 minutes ago',
        safetyStatus: 'warning',
        distance: calculateDistance(lat, lng, lat - 0.008, lng + 0.003),
        emergencyContacts: 3,
        digitalId: 'DID-2025-002',
        lastAlert: 'Entered high-risk area'
      },
      {
        userId: 'user-3',
        userName: 'Officer Patel',
        userRole: 'police',
        location: {
          lat: lat + 0.002,
          lng: lng - 0.004,
          timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
          accuracy: 5
        },
        isTracking: true,
        privacyLevel: 'public',
        lastSeen: '1 minute ago',
        safetyStatus: 'safe',
        distance: calculateDistance(lat, lng, lat + 0.002, lng - 0.004),
        badgeNumber: 'DLP-2024-001',
        unit: 'Patrol Unit 7'
      },
      {
        userId: 'user-4',
        userName: 'Local Citizen',
        userRole: 'local_citizen',
        location: {
          lat: lat - 0.003,
          lng: lng - 0.002,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          accuracy: 20
        },
        isTracking: false,
        privacyLevel: 'emergency_only',
        lastSeen: '10 minutes ago',
        safetyStatus: 'safe',
        distance: calculateDistance(lat, lng, lat - 0.003, lng - 0.002)
      }
    ];

    // Filter users based on permissions and privacy settings
    let filteredUsers = mockUsers.filter(user => {
      // Respect privacy settings
      if (user.privacyLevel === 'private') {
        return session.user.role === 'admin'; // Only admin can see private users
      }
      
      if (user.privacyLevel === 'emergency_only') {
        return user.safetyStatus === 'emergency' || session.user.role === 'admin';
      }
      
      // Filter by distance
      return user.distance <= radius;
    });

    // Apply additional filters
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.safetyStatus === status);
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.userRole === role);
    }

    // Sort by distance and add formatted distance
    const usersWithFormattedDistance = filteredUsers
      .sort((a, b) => a.distance - b.distance)
      .map(user => ({
        ...user,
        distanceFormatted: user.distance < 1 ? 
          `${Math.round(user.distance * 1000)}m` : 
          `${user.distance.toFixed(1)}km`,
        canContact: user.userRole === 'tourist' || user.userRole === 'police',
        trackingDuration: user.isTracking ? calculateTrackingDuration(user.location.timestamp) : null
      }));

    // Generate summary statistics
    const summary = {
      total: usersWithFormattedDistance.length,
      byStatus: {
        safe: usersWithFormattedDistance.filter(u => u.safetyStatus === 'safe').length,
        warning: usersWithFormattedDistance.filter(u => u.safetyStatus === 'warning').length,
        emergency: usersWithFormattedDistance.filter(u => u.safetyStatus === 'emergency').length
      },
      byRole: {
        tourist: usersWithFormattedDistance.filter(u => u.userRole === 'tourist').length,
        police: usersWithFormattedDistance.filter(u => u.userRole === 'police').length,
        local_citizen: usersWithFormattedDistance.filter(u => u.userRole === 'local_citizen').length
      },
      tracking: {
        active: usersWithFormattedDistance.filter(u => u.isTracking).length,
        inactive: usersWithFormattedDistance.filter(u => !u.isTracking).length
      }
    };

    return NextResponse.json({
      success: true,
      users: usersWithFormattedDistance,
      summary,
      searchParams: {
        location: { lat, lng },
        radius: `${radius}km`,
        filters: { status, role }
      },
      permissions: {
        canViewAll: session.user.role === 'admin',
        canTrack: authorizedRoles.includes(session.user.role),
        role: session.user.role
      }
    });

  } catch (error) {
    console.error('Nearby users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby users' },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two coordinates
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

// Helper function to calculate tracking duration
function calculateTrackingDuration(timestamp: string): string {
  const now = new Date();
  const trackingStart = new Date(timestamp);
  const diffMs = now.getTime() - trackingStart.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) {
    return `${diffMins} min`;
  } else if (diffHours < 24) {
    return `${diffHours}h ${diffMins % 60}m`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${diffHours % 24}h`;
  }
}