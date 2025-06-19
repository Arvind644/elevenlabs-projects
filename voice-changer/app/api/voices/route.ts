import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      return NextResponse.json({ 
        error: 'ElevenLabs API key not configured' 
      }, { status: 400 });
    }

    const voices = await client.voices.getAll();
    
    const voiceList = voices.voices.map(voice => ({
      id: voice.voiceId,
      name: voice.name,
      gender: voice.labels?.gender || 'Unknown',
      accent: voice.labels?.accent || 'Unknown'
    }));

    return NextResponse.json({ voices: voiceList });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch voices' }, 
      { status: 500 }
    );
  }
} 