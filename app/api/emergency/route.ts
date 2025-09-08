import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, location, coordinates, message } = body;

    // In a real app, this would:
    // 1. Store emergency alert in database
    // 2. Notify emergency services
    // 3. Send push notifications to nearby users
    // 4. Update real-time location tracking
    // 5. Create incident report automatically

    const emergencyAlert = {
      id: Date.now().toString(),
      type: type || 'SOS',
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      },
      location,
      coordinates,
      message,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    // Simulate emergency response
    console.log('🚨 EMERGENCY ALERT ACTIVATED:', emergencyAlert);

    return NextResponse.json({
      success: true,
      alert: emergencyAlert,
      response: {
        police: { contacted: true, eta: '5-10 minutes' },
        medical: { contacted: true, eta: '8-12 minutes' },
        emergencyContacts: { notified: true, count: 3 }
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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // In a real app, this would fetch user's emergency history
    // For now, return mock data
    const emergencyHistory = [
      {
        id: '1',
        type: 'SOS',
        location: 'Red Fort, Delhi',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        responseTime: '6 minutes'
      }
    ];

    return NextResponse.json({ emergencyHistory }, { status: 200 });

  } catch (error) {
    console.error('Get emergency history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency history' },
      { status: 500 }
    );
  }
}
