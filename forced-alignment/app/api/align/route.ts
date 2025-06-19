import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY' 
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;

    if (!file || !text) {
      return NextResponse.json({ error: 'File and text are required' }, { status: 400 });
    }

    // Convert File to Blob for ElevenLabs
    const result = await client.forcedAlignment.create({
      file: file,
      text: text,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Alignment error:', error);
    return NextResponse.json(
      { error: 'Failed to process alignment' },
      { status: 500 }
    );
  }
} 