# ElevenLabs Forced Alignment

A minimal Next.js app for ElevenLabs forced alignment API.

## Setup

1. Create a `.env.local` file in the root directory:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload an audio file (supported formats: mp3, wav, etc.)
2. Enter the corresponding text transcript
3. Click "Align Audio" to get time-aligned transcript
4. View the JSON result with word-level timing information

## API Key

Get your API key from [ElevenLabs Dashboard](https://beta.elevenlabs.io/speech-synthesis)
