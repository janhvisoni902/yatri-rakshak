import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const { type, location, contacts, timestamp, additionalInfo } = body;

    // Create emergency record
    const emergencyData = {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      type,
      location,
      timestamp,
      status: 'active',
      priority: 'critical',
      contacts: contacts || [],
      additionalInfo: additionalInfo || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send SMS/calls to emergency contacts
    // 3. Alert nearby authorities
    // 4. Start live tracking
    // 5. Send push notifications

    // Mock emergency response
    const emergencyResponse = {
      emergencyId: `EMG-${Date.now()}`,
      status: 'dispatched',
      estimatedResponseTime: '5-8 minutes',
      nearestUnit: 'Unit-7 (Women Safety Patrol)',
      trackingActive: true,
      contactsNotified: contacts?.length || 0,
      message: 'Emergency services have been alerted. Stay calm and stay safe.'
    };

    // Simulate sending alerts to contacts
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        // In production, integrate with SMS/calling service
        console.log(`Sending emergency alert to ${contact.name} at ${contact.phone}`);
        
        // Mock SMS content
        const smsMessage = `EMERGENCY ALERT: ${session.user.name} has triggered an SOS. Location: ${location?.lat}, ${location?.lng}. Time: ${new Date().toLocaleString()}. Please contact immediately or call authorities.`;
        
        // Here you would integrate with services like:
        // - Twilio for SMS
        // - Voice calling APIs
        // - WhatsApp Business API
        // - Email services
      }
    }

    // Alert authorities
    const authorityAlert = {
      type: 'women_safety_emergency',
      userId: session.user.id,
      location,
      timestamp,
      severity: 'critical',
      autoDispatch: true
    };

    // In production, this would trigger:
    // - Police dispatch system
    // - Women safety patrol units
    // - Nearby hospitals/medical services
    // - Tourist helpline centers

    return NextResponse.json({
      success: true,
      emergency: emergencyResponse,
      message: 'Emergency SOS activated successfully'
    });

  } catch (error) {
    console.error('Emergency SOS error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency SOS' },
      { status: 500 }
    );
  }
}

// GET endpoint to check emergency status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const emergencyId = searchParams.get('id');

    if (!emergencyId) {
      return NextResponse.json({ error: 'Emergency ID required' }, { status: 400 });
    }

    // Mock emergency status check
    const emergencyStatus = {
      id: emergencyId,
      status: 'responding',
      location: { lat: 28.6139, lng: 77.2090 },
      responseUnit: 'Unit-7 (Women Safety Patrol)',
      estimatedArrival: '3 minutes',
      contactsNotified: 3,
      lastUpdate: new Date().toISOString(),
      timeline: [
        { time: '14:30:00', event: 'SOS triggered', status: 'alert' },
        { time: '14:30:15', event: 'Contacts notified', status: 'info' },
        { time: '14:30:30', event: 'Unit dispatched', status: 'success' },
        { time: '14:32:00', event: 'Unit en route', status: 'info' }
      ]
    };

    return NextResponse.json({
      success: true,
      emergency: emergencyStatus
    });

  } catch (error) {
    console.error('Emergency status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check emergency status' },
      { status: 500 }
    );
  }
}