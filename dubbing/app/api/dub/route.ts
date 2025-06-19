import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' });
    }

    // Create dubbing job
    const dubbing = await client.dubbing.create({
      name: `Dubbing - ${file.name}`,
      file: file,
      targetLang: targetLanguage,
      sourceLang: "auto", // Auto-detect source language
      numSpeakers: 1,
      watermark: true, // Required for non-Creator+ users
    });

    return NextResponse.json({ 
      success: true, 
      dubbingId: dubbing.dubbingId,
      message: 'Dubbing job created successfully'
    });

  } catch (error: any) {
    console.error('Dubbing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create dubbing job'
    });
  }
} 