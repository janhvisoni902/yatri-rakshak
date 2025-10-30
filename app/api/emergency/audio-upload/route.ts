import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'emergency-audio');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `emergency-${session.user.id}-${timestamp}.wav`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create audio record metadata
    const audioRecord = {
      id: `AUDIO-${Date.now()}`,
      userId: session.user.id,
      userName: session.user.name,
      filename,
      filepath,
      fileSize: buffer.length,
      duration: null, // Would be calculated in production
      uploadedAt: new Date().toISOString(),
      type: 'emergency_recording',
      status: 'uploaded',
      transcription: null, // Would be processed by speech-to-text service
      metadata: {
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      }
    };

    // In production, you would:
    // 1. Upload to secure cloud storage (AWS S3, Google Cloud Storage)
    // 2. Process with speech-to-text API
    // 3. Store metadata in database
    // 4. Trigger analysis for emergency keywords
    // 5. Alert authorities if distress detected

    // Mock transcription service response
    const mockTranscription = {
      text: "Help me, I'm in trouble...", // This would come from actual speech-to-text
      confidence: 0.95,
      keywords: ['help', 'trouble'],
      sentiment: 'distress',
      urgency: 'high'
    };

    // If distress detected, trigger additional alerts
    if (mockTranscription.urgency === 'high') {
      // Alert authorities with audio evidence
      console.log('High urgency detected in audio - alerting authorities');
      
      // In production:
      // - Send to emergency dispatch
      // - Flag for immediate review
      // - Trigger additional safety protocols
    }

    return NextResponse.json({
      success: true,
      audioRecord: {
        id: audioRecord.id,
        filename: audioRecord.filename,
        uploadedAt: audioRecord.uploadedAt,
        status: audioRecord.status,
        transcription: mockTranscription
      },
      message: 'Emergency audio uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload emergency audio' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve audio records
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock audio records for the user
    const audioRecords = [
      {
        id: 'AUDIO-1704454800000',
        filename: 'emergency-user123-2025-01-04T14-30-00.wav',
        uploadedAt: '2025-01-04T14:30:00Z',
        duration: '00:02:15',
        status: 'processed',
        transcription: {
          text: 'Help me, someone is following me near the metro station',
          confidence: 0.92,
          keywords: ['help', 'following', 'metro station'],
          sentiment: 'distress',
          urgency: 'high'
        },
        actionTaken: 'Authorities alerted, unit dispatched'
      },
      {
        id: 'AUDIO-1704451200000',
        filename: 'emergency-user123-2025-01-04T13-30-00.wav',
        uploadedAt: '2025-01-04T13:30:00Z',
        duration: '00:01:45',
        status: 'processed',
        transcription: {
          text: 'Testing emergency recording feature',
          confidence: 0.98,
          keywords: ['testing', 'emergency'],
          sentiment: 'neutral',
          urgency: 'low'
        },
        actionTaken: 'Test recording - no action required'
      }
    ];

    return NextResponse.json({
      success: true,
      records: audioRecords,
      total: audioRecords.length
    });

  } catch (error) {
    console.error('Audio records retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audio records' },
      { status: 500 }
    );
  }
}