import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KycDocument, { KycDocumentType, IKycDocument } from '@/models/KycDocument';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

export const dynamic = 'force-dynamic';

function sha256(buffer: Buffer): string {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();

    // Accept either specific fields (identityDocument, addressProof, photo, etc.)
    // or multiple files under a common field name like "documents".
    const entries = Array.from(formData.entries());
    const filesToProcess: Array<{ typeKey: string; file: File }> = [];

    for (const [key, value] of entries) {
      if (value instanceof File) {
        filesToProcess.push({ typeKey: key, file: value });
      }
    }

    const explicitTypes = ['identityDocument', 'addressProof', 'photo', 'passport', 'aadhaar', 'driving_license', 'voter_id', 'other'];

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const userId = session.user.id;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', userId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const saved: any[] = [];

    for (const item of filesToProcess) {
      const file = item.file;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hashHex = sha256(buffer);

      const ext = path.extname(file.name) || '';
      const safeType = explicitTypes.includes(item.typeKey) ? item.typeKey : 'other';
      const base = `${safeType}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const fileName = `${base}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      const publicPath = `/uploads/kyc/${userId}/${fileName}`;

      // Save the file
      await writeFile(filePath, buffer);

      // Persist metadata
      const doc = (await KycDocument.create({
        userId,
        type: (safeType.replace('Document', '').replace('Proof', '').toLowerCase() as KycDocumentType) || 'other',
        originalName: file.name,
        fileName,
        filePath,
        publicPath,
        size: file.size,
        mimeType: file.type,
        checksumSha256: hashHex,
        status: 'pending'
      })) as IKycDocument;

      const idStr = (doc as any)?._id?.toString?.() ?? '';
      saved.push({
        id: idStr,
        type: doc.type,
        originalName: doc.originalName,
        url: publicPath,
        size: doc.size,
        mimeType: doc.mimeType,
        status: doc.status,
        uploadedAt: doc.createdAt
      });
    }

    return NextResponse.json({ success: true, documents: saved }, { status: 201 });
  } catch (error) {
    console.error('KYC wallet upload error:', error);
    return NextResponse.json({ error: 'Failed to upload documents' }, { status: 500 });
  }
}


