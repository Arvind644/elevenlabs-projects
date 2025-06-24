'use client';

import { useState } from 'react';
import axios from 'axios';
import { PlayIcon, PauseIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState('https://arxiv.org/abs/2307.06435');
  const [urlContent, setUrlContent] = useState<{
    title: string;
    summary: string;
    fullText: string;
    url: string;
  } | null>(null);

  const handleSummarizeUrl = async () => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
      }

      setIsLoading(true);
      setError('');
      setUrlContent(null);
      
      // Call our API route to summarize URL content and convert to speech
      const response = await axios.post('/api/summarize-content', {
        url
      });

      console.log('URL Summarization Response:', response.data);

      if (!response.data.audioUrl) {
        throw new Error('No audio URL received from server');
      }

      // Set content
      setUrlContent({
        title: response.data.title,
        summary: response.data.summary,
        fullText: response.data.fullText,
        url: response.data.url
      });

      // Setup audio
      const audio = new Audio(response.data.audioUrl);
      setCurrentAudio(audio);
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to load audio. Please try again.');
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      // Auto-play the audio
      await audio.play();
      setIsPlaying(true);
      
    } catch (err: any) {
      console.error('Error details:', err);
      let errorMessage = 'Failed to summarize content. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          errorMessage += `: ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      currentAudio.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold mb-2">AI Content Summarizer</h1>
          <p className="text-gray-600">Enter any URL to get an AI-powered summary with audio playback</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Enter URL to Summarize</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://arxiv.org/abs/2307.06435"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter any URL (research papers, articles, blogs, etc.) to get an AI-powered summary
          </p>
        </div>

        <button
          onClick={handleSummarizeUrl}
          disabled={isLoading || !url.trim()}
          className="flex items-center justify-center w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              Summarize & Play
            </>
          )}
        </button>

        {/* Play/Pause Controls - Only show when audio is available */}
        {currentAudio && urlContent && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-5 h-5 mr-2" />
                  Pause Audio
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Play Audio
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {urlContent && (
          <div className="mt-8 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">{urlContent.title}</h2>
              <a 
                href={urlContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mb-4 inline-block"
              >
                View original source →
              </a>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">AI Summary</h3>
                <p className="text-gray-700 whitespace-pre-line">{urlContent.summary}</p>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                  View Full Content
                </summary>
                <div className="mt-4 p-4 bg-gray-50 rounded text-sm max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-line">{urlContent.fullText}</p>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
