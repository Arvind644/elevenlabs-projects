# AI Content Summarizer

This is a [Next.js](https://nextjs.org) project that uses Exa AI to fetch and summarize content from URLs, then uses ElevenLabs to convert the summaries to speech.

## Features

- **URL Summarizer**: Enter any URL (research papers, articles, blogs) to get an AI-powered summary with audio playback
- **Text-to-Speech**: Uses ElevenLabs to convert summaries to natural-sounding speech
- **Clean Interface**: Simple, focused UI for content summarization

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your API keys:

```bash
# Exa AI API Key - Get from https://exa.ai/
EXA_API_KEY=your_exa_api_key_here

# ElevenLabs API Key - Get from https://elevenlabs.io/
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Get API Keys

- **Exa AI**: Sign up at [https://exa.ai/](https://exa.ai/) to get your API key
- **ElevenLabs**: Sign up at [https://elevenlabs.io/](https://elevenlabs.io/) to get your API key

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Enter any URL in the input field (default: arXiv paper)
2. Click "Summarize & Play" to get an AI summary and audio playback
3. View the full content in the expandable section

## Example URLs to Try

- Research Papers: `https://arxiv.org/abs/2307.06435`
- News Articles: Any news website URL
- Blog Posts: Medium, Substack, or personal blog URLs
- Documentation: Technical documentation sites

## How It Works

1. **Content Extraction**: Exa AI fetches and extracts content from the provided URL
2. **Summarization**: The system generates a concise summary of the content
3. **Text-to-Speech**: ElevenLabs converts the summary to natural-sounding audio
4. **Playback**: The audio plays automatically while displaying the summary and full content

## Technologies Used

- **Next.js 15** - React framework
- **Exa AI** - Web search and content extraction
- **ElevenLabs** - Text-to-speech conversion
- **Tailwind CSS** - Styling
- **Heroicons** - Icons

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add your environment variables in the Vercel dashboard under Settings > Environment Variables.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
