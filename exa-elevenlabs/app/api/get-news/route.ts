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

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing topic parameter' },
        { status: 400 }
      );
    }

    if (!EXA_API_KEY) {
      console.error('Exa API key not configured');
      return NextResponse.json(
        { error: 'Exa API key not configured' },
        { status: 500 }
      );
    }

    if (!ELEVEN_LABS_API_KEY) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // 2. Get news using Exa
    console.log('Fetching news from Exa for topic:', topic);
    let exaResponse;
    try {
      exaResponse = await axios.post(
        'https://api.exa.ai/search',
        {
          query: `Latest ${topic} news`,
          numResults: 3,
          text: true,
          highlights: {
            numSentences: 3,
            highlightsPerUrl: 1
          }
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
          error: 'Failed to fetch news from Exa',
          details: error.response?.data?.error || error.message
        },
        { status: 500 }
      );
    }

    // 3. Process the articles
    const articles = exaResponse.data.results || [];
    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No news articles found' },
        { status: 404 }
      );
    }

    const summary = `Here are the latest ${topic} news updates:\n\n` +
      articles.map((article: any, index: number) => {
        const title = article.title || 'Untitled';
        const highlight = article.highlights?.[0] || article.text?.slice(0, 200) || '';
        return `Article ${index + 1}: ${title}. ${highlight}`;
      }).join('\n\n');

    // 4. Convert to speech using ElevenLabs
    console.log('Converting text to speech with ElevenLabs');
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

    // 5. Process the audio
    const audioBase64 = Buffer.from(elevenLabsResponse.data).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // 6. Return the response
    return NextResponse.json({ 
      audioUrl,
      summary,
      articles: articles.map((a: any) => ({ 
        title: a.title,
        url: a.url 
      }))
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