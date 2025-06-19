import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY" 
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang') || 'es';
    const { id: dubbingId } = await params;

    // Get dubbing status first
    const status = await client.dubbing.get(dubbingId);
    
    if (status.status !== 'dubbed') {
      return NextResponse.json({ 
        success: false, 
        status: status.status,
        message: `Dubbing is ${status.status}. Please wait...`
      });
    }

    // If completed, get the audio
    const url = `https://api.elevenlabs.io/v1/dubbing/${dubbingId}/audio/${languageCode}`;
    const options = {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY"
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Failed to get audio: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="dubbed_audio_${languageCode}.mp3"`,
      },
    });

  } catch (error: any) {
    console.error('Get audio error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to get dubbed audio'
    });
  }
} 