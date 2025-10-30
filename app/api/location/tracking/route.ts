import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isTracking, privacyLevel } = body;

    // Update user's tracking preferences
    const trackingUpdate = {
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      isTracking: isTracking || false,
      privacyLevel: privacyLevel || 'authorities_only',
      updatedAt: new Date().toISOString(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };

    // In production, save to database
    console.log('Tracking status updated:', trackingUpdate);

    // If tracking is disabled, clean up location data based on privacy settings
    if (!isTracking) {
      await cleanupLocationData(session.user.id, privacyLevel);
    }

    return NextResponse.json({
      success: true,
      tracking: {
        isEnabled: isTracking,
        privacyLevel: privacyLevel,
        updatedAt: trackingUpdate.updatedAt
      },
      message: isTracking ? 'Location tracking enabled' : 'Location tracking disabled'
    });

  } catch (error) {
    console.error('Tracking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking status' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current tracking status
    // In production, fetch from database
    const mockTrackingStatus = {
      userId: session.user.id,
      isTracking: false,
      privacyLevel: 'authorities_only',
      lastLocationUpdate: null,
      trackingHistory: {
        totalSessions: 5,
        totalDuration: '2h 30m',
        lastSession: '2025-01-04T10:30:00Z'
      },
      permissions: {
        canBeTracked: true,
        canTrackOthers: ['police', 'higher_authority', 'admin'].includes(session.user.role),
        privacyOptions: ['private', 'emergency_only', 'authorities_only', 'public']
      }
    };

    return NextResponse.json({
      success: true,
      tracking: mockTrackingStatus
    });

  } catch (error) {
    console.error('Get tracking status error:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking status' },
      { status: 500 }
    );
  }
}

// Helper function to cleanup location data
async function cleanupLocationData(userId: string, privacyLevel: string) {
  try {
    // In production, this would:
    // 1. Remove or anonymize location history based on privacy level
    // 2. Stop real-time location sharing
    // 3. Clear cached location data
    // 4. Notify authorized personnel if needed
    // 5. Update user preferences

    console.log(`Cleaning up location data for user ${userId} with privacy level ${privacyLevel}`);

    const cleanupActions = {
      private: 'All location data removed',
      emergency_only: 'Location data kept for emergency use only',
      authorities_only: 'Location data accessible to authorities only',
      public: 'Location data remains public'
    };

    return {
      action: cleanupActions[privacyLevel as keyof typeof cleanupActions] || 'Default cleanup applied',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Location cleanup error:', error);
    return null;
  }
}