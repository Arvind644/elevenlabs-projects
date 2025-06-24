# Voice Adventures Game

A Next.js voice-interactive game where you can talk to multiple AI characters with unique personalities using ElevenLabs for speech-to-text and text-to-speech capabilities.

## Features

- 🎮 Interactive 2D game with multiple characters
- 🎤 Voice input using speech-to-text
- 🔊 AI character responses with unique voices
- 💭 Character personality preservation across conversations
- 📱 Responsive design with beautiful UI

## Characters

- **Merlin the Wise** - Ancient wizard with mystical knowledge
- **Sir Gareth** - Brave and honorable knight
- **Goldie the Trader** - Clever merchant who loves deals
- **Elena the Scholar** - Brilliant researcher and intellectual

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get your API keys:**
   - **ElevenLabs API Key**: Get it from [ElevenLabs API](https://elevenlabs.io/docs/api-reference/introduction)
   - **OpenAI API Key**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Play

1. **Select a Character**: Click on any character on the screen to select them
2. **Start Talking**: Click the "🎤 Start Talking" button
3. **Speak**: Talk to your selected character
4. **Stop Recording**: Click "🛑 Stop Recording" when done
5. **Listen**: The character will respond with their unique voice and personality
6. **Continue**: Have ongoing conversations that maintain context

## Technical Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Voice Processing**: ElevenLabs API
- **AI Conversations**: OpenAI GPT-3.5-turbo
- **TypeScript**: Full type safety

## Character Voices

The game uses specific ElevenLabs voices for each character:
- Merlin: Adam voice (mystical and wise)
- Sir Gareth: Bella voice (strong and confident)
- Goldie: Antoni voice (enthusiastic and friendly)
- Elena: Elli voice (precise and intellectual)

## Development

The game is built with:
- Client-side voice recording using MediaRecorder API
- Server-side API routes for ElevenLabs integration
- Real-time character state management
- Responsive positioning system for characters

## Browser Requirements

- Modern browser with microphone access
- HTTPS connection (required for microphone access)
- JavaScript enabled

## License

MIT License - feel free to modify and expand the game!
