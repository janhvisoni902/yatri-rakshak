import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KycDocument from '@/models/KycDocument';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const doc = await KycDocument.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileStats = await stat(doc.filePath);
    const stream = createReadStream(doc.filePath);

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Length': String(fileStats.size),
        'Content-Disposition': `attachment; filename="${doc.fileName}"`
      }
    });
  } catch (error) {
    console.error('KYC wallet download error:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}


