import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { title, description, location, coordinates, priority = 'medium' } = body;

    if (!title || !description || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const incident = await Incident.create({
      title,
      description,
      location,
      coordinates: coordinates ? {
        latitude: coordinates.lat,
        longitude: coordinates.lng
      } : undefined,
      priority,
      reportedBy: session.user.id,
      status: 'reported',
      updates: [{
        message: `Incident reported: ${title}`,
        updatedBy: session.user.id,
        timestamp: new Date()
      }]
    });

    // In a real app, you might want to:
    // 1. Send notification to local authorities
    // 2. Create safety alert for nearby users
    // 3. Update area safety scores

    return NextResponse.json({
      success: true,
      incident: {
        id: incident._id,
        title: incident.title,
        status: incident.status,
        priority: incident.priority,
        createdAt: incident.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Incident reporting error:', error);
    return NextResponse.json(
      { error: 'Failed to report incident' },
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

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const userId = searchParams.get('userId');

    let query: any = {};
    
    if (userId === session.user.id) {
      // Get user's own incidents
      query['reportedBy.userId'] = userId;
    } else if (location && ['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      // Get incidents by location for authorities
      query.location = { $regex: location, $options: 'i' };
    } else if (['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      // Get all incidents for authorities
      // No additional query restrictions
    } else {
      // Regular users can only see their own incidents
      query['reportedBy.userId'] = session.user.id;
    }

    const incidents = await Incident.find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ incidents }, { status: 200 });

  } catch (error) {
    console.error('Get incidents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
