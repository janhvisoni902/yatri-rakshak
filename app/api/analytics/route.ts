import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock database functions - replace with actual database queries
async function getIncidentTrends(role: string, timeframe: string = '7d') {
  // Simulate database query with dynamic data
  const now = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic data based on role and current trends
    let baseValue = Math.floor(Math.random() * 20) + 5;
    if (role === 'police') baseValue = Math.floor(baseValue * 0.8);
    if (role === 'authority') baseValue = Math.floor(baseValue * 1.2);
    
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: baseValue + Math.floor(Math.random() * 10),
      date: date.toISOString()
    });
  }
  
  return data;
}

async function getResponseTimeData(role: string) {
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const baseTime = role === 'police' ? 8.5 : role === 'authority' ? 6.2 : 9.1;
    const improvement = i * 0.3; // Shows improvement over time
    weeks.push({
      name: `Week ${6 - i}`,
      value: Math.max(4.0, baseTime - improvement + (Math.random() * 1.5 - 0.75)),
      time: Math.max(4.0, baseTime - improvement + (Math.random() * 1.5 - 0.75))
    });
  }
  return weeks;
}

async function getIncidentTypeData(role: string) {
  const baseData = [
    { name: 'Theft', value: 0, fill: '#3B82F6' },
    { name: 'Traffic', value: 0, fill: '#F59E0B' },
    { name: 'Harassment', value: 0, fill: '#EF4444' },
    { name: 'Missing Person', value: 0, fill: '#10B981' },
    { name: 'Emergency', value: 0, fill: '#8B5CF6' }
  ];
  
  // Generate dynamic percentages that add up to 100
  const total = 100;
  let remaining = total;
  
  for (let i = 0; i < baseData.length - 1; i++) {
    const maxValue = Math.min(40, remaining - (baseData.length - i - 1) * 5);
    const value = Math.floor(Math.random() * maxValue) + 5;
    baseData[i].value = value;
    remaining -= value;
  }
  baseData[baseData.length - 1].value = remaining;
  
  return baseData;
}

async function getSafetyTrends(role: string) {
  const data = [];
  const baseScore = role === 'tourist' ? 85 : role === 'authority' ? 87 : 82;
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: baseScore + Math.floor(Math.random() * 10) - 5,
      date: date.toISOString()
    });
  }
  
  return data;
}

async function getVisitTrends() {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      name: `Day ${7 - i}`,
      value: Math.floor(Math.random() * 5) + 1,
      date: date.toISOString()
    });
  }
  return data;
}

async function getPlaceTypeData() {
  return [
    { name: 'Monuments', value: Math.floor(Math.random() * 20) + 15, fill: '#3B82F6' },
    { name: 'Markets', value: Math.floor(Math.random() * 15) + 10, fill: '#F59E0B' },
    { name: 'Restaurants', value: Math.floor(Math.random() * 25) + 20, fill: '#EF4444' },
    { name: 'Hotels', value: Math.floor(Math.random() * 10) + 5, fill: '#10B981' },
    { name: 'Transport', value: Math.floor(Math.random() * 15) + 8, fill: '#8B5CF6' }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const role = session.user.role;
    const timeframe = searchParams.get('timeframe') || '7d';

    let data;

    switch (type) {
      case 'incident-trends':
        data = await getIncidentTrends(role, timeframe);
        break;
      case 'response-time':
        data = await getResponseTimeData(role);
        break;
      case 'incident-types':
        data = await getIncidentTypeData(role);
        break;
      case 'safety-trends':
        data = await getSafetyTrends(role);
        break;
      case 'visit-trends':
        data = await getVisitTrends();
        break;
      case 'place-types':
        data = await getPlaceTypeData();
        break;
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
      role,
      type
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
