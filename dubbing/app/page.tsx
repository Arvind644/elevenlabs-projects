'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [status, setStatus] = useState('');
  const [dubbingId, setDubbingId] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLanguage', targetLanguage);

    try {
      const response = await fetch('/api/dub', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setDubbingId(result.dubbingId);
        setStatus('Dubbing started! Checking status...');
        setIsPolling(true);
        pollStatus(result.dubbingId);
      } else {
        setStatus('Error: ' + result.error);
      }
    } catch (error) {
      setStatus('Upload failed');
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/dub/${id}?lang=${targetLanguage}`);
      
      if (response.headers.get('content-type')?.includes('audio')) {
        // Audio is ready - download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dubbed_audio_${targetLanguage}.mp3`;
        a.click();
        window.URL.revokeObjectURL(url);
        setStatus('✅ Dubbing completed! Audio downloaded.');
        setIsPolling(false);
        return;
      }

      const result = await response.json();
      if (result.success === false) {
        setStatus(`🔄 Status: ${result.status || 'Processing...'}`);
        // Continue polling every 5 seconds
        setTimeout(() => pollStatus(id), 5000);
      }
    } catch (error) {
      setStatus('❌ Error checking status');
      setIsPolling(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">ElevenLabs Dubbing</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Audio/Video File
            </label>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
              <option value="pt">Portuguese</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!file || isPolling}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPolling ? 'Processing...' : 'Start Dubbing'}
          </button>
        </form>

        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
