'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const generateSFX = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-sfx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          🎵 ElevenLabs Sound Effects
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your sound effect... e.g., 'Thunder rumbling in the distance'"
            className="w-full h-32 p-4 border rounded-lg resize-none text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600"
          />
          
          <button
            onClick={generateSFX}
            disabled={loading || !text.trim()}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? '🔄 Generating...' : '✨ Generate Sound Effect'}
          </button>
          
          {audioUrl && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-300 mb-2">✅ Sound effect generated!</p>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
