import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      outputFormat: "mp3_44100_128",
      text,
      modelId: "eleven_multilingual_v2"
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
} 