'use client';

import { useState, useRef, useEffect } from 'react';

interface Voice {
  id: string;
  name: string;
  gender: string;
  accent: string;
}

export default function VoiceChanger() {
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [originalAudio, setOriginalAudio] = useState<string | null>(null);
  const [resultAudio, setResultAudio] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [loadingVoices, setLoadingVoices] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        const data = await response.json();
        if (response.ok) {
          setVoices(data.voices);
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch voices');
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setOriginalAudio(URL.createObjectURL(file));
      setResultAudio(null);
    }
  };

  const convertVoice = async () => {
    if (!audioFile || !selectedVoice) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('voiceId', selectedVoice);

      const response = await fetch('/api/convert-voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setResultAudio(audioUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Voice conversion failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🎙️ Voice Changer
        </h1>
        
        <div className="space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Target Voice
            </label>
            {loadingVoices ? (
              <div className="text-gray-500 text-sm">Loading voices...</div>
            ) : (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender}, {voice.accent})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Audio File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Original Audio Preview */}
          {originalAudio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Original Audio
              </label>
              <audio
                controls
                src={originalAudio}
                className="w-full"
              />
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={convertVoice}
            disabled={!audioFile || !selectedVoice || isLoading || loadingVoices}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Converting...' : 'Convert Voice'}
          </button>

          {/* Result Audio */}
          {resultAudio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✨ Converted Audio
              </label>
              <audio
                controls
                src={resultAudio}
                className="w-full"
              />
              <a
                href={resultAudio}
                download="converted-voice.mp3"
                className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
              >
                Download converted audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
