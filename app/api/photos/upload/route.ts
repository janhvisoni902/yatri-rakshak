import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File;
    const locationId = formData.get('locationId') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${session.user.id}_${timestamp}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    await writeFile(filePath, buffer);

    // In a real app, you would:
    // 1. Store photo metadata in database
    // 2. Associate with location/incident
    // 3. Generate thumbnails
    // 4. Upload to cloud storage (AWS S3, Cloudinary, etc.)

    const photoData = {
      id: timestamp.toString(),
      filename,
      originalName: file.name,
      url: `/uploads/photos/${filename}`,
      size: file.size,
      type: file.type,
      locationId,
      description,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString()
    };

    console.log('📷 Photo uploaded:', photoData);

    return NextResponse.json({
      success: true,
      photo: photoData
    }, { status: 201 });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
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

    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const userId = searchParams.get('userId');

    // In a real app, this would fetch photos from database
    // For now, return mock data
    const photos = [
      {
        id: '1',
        filename: 'red_fort_photo.jpg',
        url: '/uploads/photos/red_fort_photo.jpg',
        locationId: locationId || '1',
        description: 'Beautiful view of Red Fort',
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({ photos }, { status: 200 });

  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
