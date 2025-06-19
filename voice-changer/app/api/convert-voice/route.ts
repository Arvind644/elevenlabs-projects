import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      return NextResponse.json({ 
        error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your .env.local file' 
      }, { status: 400 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const voiceId = formData.get('voiceId') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!voiceId) {
      return NextResponse.json({ error: 'No voice ID provided' }, { status: 400 });
    }

    try {
      
      const result = await client.speechToSpeech.convert(voiceId, {
        audio: audioFile,
        outputFormat: "mp3_44100_128",
        modelId: "eleven_multilingual_sts_v2"
      });
      
      const chunks: Uint8Array[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }
      const audioArrayBuffer = Buffer.concat(chunks);

      return new NextResponse(audioArrayBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="converted-voice.mp3"',
        },
      });
      
    } catch (voiceError: any) {
      if (voiceError.statusCode === 401) {
        return NextResponse.json({ 
          error: 'Invalid API key or insufficient permissions. Please check your ElevenLabs API key.' 
        }, { status: 401 });
      }
      throw voiceError;
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Voice conversion failed' }, 
      { status: 500 }
    );
  }
} 