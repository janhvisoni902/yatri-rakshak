import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import TripPlan from '@/models/TripPlan';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const trips = await TripPlan.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Trips GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    await connectDB();

    const created = await TripPlan.create({ ...data, userId: session.user.id });
    return NextResponse.json({ trip: created }, { status: 201 });
  } catch (error) {
    console.error('Trips POST error:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, ...updates } = data || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await connectDB();
    const updated = await TripPlan.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updates,
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ trip: updated });
  } catch (error) {
    console.error('Trips PUT error:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await connectDB();
    await TripPlan.deleteOne({ _id: id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trips DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}


