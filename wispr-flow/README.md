# Wispr Flow - Speech to Text

A minimal speech-to-text application using ElevenLabs and Next.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your ElevenLabs API key:
```
ELEVENLABS_API_KEY=your_actual_api_key_here
```

3. Get your API key from [ElevenLabs](https://elevenlabs.io)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click "Start Recording" to begin recording your voice
2. Speak clearly into your microphone
3. Click "Stop Recording" to end the recording
4. Wait for the transcription to appear below the button

## Features

- Real-time audio recording using browser MediaRecorder API
- Speech-to-text conversion using ElevenLabs Scribe v1 model
- Clean, minimal UI perfect for demonstrations
- Responsive design with dark mode support
