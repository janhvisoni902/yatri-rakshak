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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    let query: any = {};
    
    if (userId === session.user.id) {
      // Get user's own incidents
      query['reportedBy.userId'] = userId;
    } else if (['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      // Authorities can see all incidents with optional filtering
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      if (status) {
        query.status = status;
      }
      if (priority) {
        query.priority = priority;
      }
      if (assignedTo) {
        query.assignedTo = assignedTo;
      }
    } else {
      // Regular users can only see their own incidents
      query['reportedBy.userId'] = session.user.id;
    }

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
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

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only police and higher authorities can update incidents
    if (!['police', 'higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { id, status, assignedTo, notes, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    // Add update to history
    const updateMessage = `Status updated to ${status || 'current status'}${assignedTo ? ` and assigned to ${assignedTo}` : ''} by ${session.user.name}`;
    
    const incident = await Incident.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: {
          updates: {
            message: notes || updateMessage,
            updatedBy: session.user.id,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      incident
    }, { status: 200 });

  } catch (error) {
    console.error('Update incident error:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
