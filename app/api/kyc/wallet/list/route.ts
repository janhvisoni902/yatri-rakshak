import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KycDocument from '@/models/KycDocument';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    const query: any = { userId: session.user.id };
    if (type) query.type = type;

    const docs = await KycDocument.find(query).sort({ createdAt: -1 }).lean();

    const items = docs.map((d: any) => ({
      id: d._id.toString(),
      type: d.type,
      originalName: d.originalName,
      url: d.publicPath,
      size: d.size,
      mimeType: d.mimeType,
      status: d.status,
      uploadedAt: d.createdAt
    }));

    return NextResponse.json({ success: true, documents: items });
  } catch (error) {
    console.error('KYC wallet list error:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}


