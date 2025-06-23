'use client';

import { useState, useRef } from 'react';

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.text) {
        setTranscribedText(data.text);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Speech to Text</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Speak clearly in English for best results
      </p>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        className={`px-8 py-4 rounded-full text-white font-semibold text-lg transition-all ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {transcribedText && (
        <div className="w-full p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Transcribed Text:</h3>
          <textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            className="w-full min-h-[100px] p-3 rounded border bg-white dark:bg-gray-700 
                     text-gray-700 dark:text-gray-300 leading-relaxed focus:outline-none 
                     focus:ring-2 focus:ring-blue-500"
            placeholder="Your transcribed text will appear here..."
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(transcribedText);
                  alert('Text copied to clipboard!');
                } catch (err) {
                  console.error('Failed to copy text:', err);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                       transition-colors text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 