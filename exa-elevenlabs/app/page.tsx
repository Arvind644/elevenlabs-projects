'use client';

import { useState } from 'react';
import axios from 'axios';
import { PlayIcon, PauseIcon, NewspaperIcon } from '@heroicons/react/24/solid';

const topics = [
  'Technology',
  'Business',
  'Science',
  'Health',
  'Entertainment',
  'Sports'
];

interface Article {
  title: string;
  url: string;
}

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [summary, setSummary] = useState('');

  const handleGetNews = async () => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
      }

      setIsLoading(true);
      setError('');
      setArticles([]);
      setSummary('');
      
      // Call our API route to get news and convert to speech
      const response = await axios.post('/api/get-news', {
        topic: selectedTopic
      });

      console.log('API Response:', response.data); // Debug log

      if (!response.data.audioUrl) {
        throw new Error('No audio URL received from server');
      }

      // Set articles and summary
      setArticles(response.data.articles || []);
      setSummary(response.data.summary || '');

      // Play the audio
      const audio = new Audio(response.data.audioUrl);
      setCurrentAudio(audio);
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio. Please try again.');
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
      
    } catch (err: any) {
      console.error('Error details:', err);
      let errorMessage = 'Failed to get news. Please try again.';
      
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

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">News Reader Assistant</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGetNews}
          disabled={isLoading}
          className="flex items-center justify-center w-full p-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              {isPlaying ? (
                <PauseIcon className="w-6 h-6 mr-2" />
              ) : (
                <PlayIcon className="w-6 h-6 mr-2" />
              )}
              {isPlaying ? 'Playing News' : 'Get News'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Latest Articles</h2>
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start">
                    <NewspaperIcon className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">{article.title}</h3>
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Read full article →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{summary}</p>
          </div>
        )}
      </div>
    </main>
  );
}
