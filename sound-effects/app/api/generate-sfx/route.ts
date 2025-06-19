import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const audioResponse = await client.textToSoundEffects.convert({
      text,
      durationSeconds: 10, // Set a reasonable default duration
      promptInfluence: 0.3, // Balanced creativity
    });

    // Convert the audio response to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioResponse) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating sound effect:", error);
    return NextResponse.json(
      { error: "Failed to generate sound effect" },
      { status: 500 }
    );
  }
} 