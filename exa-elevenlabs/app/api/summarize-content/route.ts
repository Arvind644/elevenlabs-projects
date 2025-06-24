import { NextResponse } from 'next/server';
import axios from 'axios';

// You'll need to replace these with your actual API keys
const EXA_API_KEY = process.env.EXA_API_KEY;
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

// Default voice ID from ElevenLabs
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice

export async function POST(req: Request) {
  try {
    // 1. Validate request and API keys
    if (!req.body) {
      return NextResponse.json(
        { error: 'Missing request body' },
        { status: 400 }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    if (!EXA_API_KEY) {
      console.error('Exa API key not configured');
      return NextResponse.json(
        { error: 'Exa API key not configured. Please set EXA_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    if (!ELEVEN_LABS_API_KEY) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please set ELEVEN_LABS_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // 2. Get content using Exa
    console.log('Fetching content from Exa for URL:', url);
    let exaResponse;
    try {
      exaResponse = await axios.post(
        'https://api.exa.ai/contents',
        {
          ids: [url],
          text: true
        },
        {
          headers: {
            'x-api-key': EXA_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Exa API error:', error.response?.data || error.message);
      return NextResponse.json(
        { 
          error: 'Failed to fetch content from Exa',
          details: error.response?.data?.error || error.message
        },
        { status: 500 }
      );
    }

    // 3. Process the content
    const results = exaResponse.data.results || [];
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No content found for the provided URL' },
        { status: 404 }
      );
    }

    const content = results[0];
    const title = content.title || 'Untitled Content';
    const text = content.text || '';

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No text content found at the provided URL' },
        { status: 404 }
      );
    }

    // 4. Generate a summary (take first 1000 characters for now, or implement AI summarization)
    const summary = `Title: ${title}\n\nSummary: ${text.slice(0, 1000)}${text.length > 1000 ? '...' : ''}`;

    // 5. Convert to speech using ElevenLabs
    console.log('Converting summary to speech with ElevenLabs');
    let elevenLabsResponse;
    try {
      elevenLabsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          text: summary,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
    } catch (error: any) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      return NextResponse.json(
        { 
          error: 'Failed to convert text to speech',
          details: error.response?.data?.error || error.message
        },
        { status: 500 }
      );
    }

    // 6. Process the audio
    const audioBase64 = Buffer.from(elevenLabsResponse.data).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // 7. Return the response
    return NextResponse.json({ 
      audioUrl,
      summary,
      title,
      url: content.url,
      fullText: text
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error.message
      },
      { status: 500 }
    );
  }
} 