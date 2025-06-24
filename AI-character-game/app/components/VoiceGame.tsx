'use client';

import { useState, useRef, useCallback } from 'react';
import Character from './Character';

interface GameCharacter {
  id: string;
  name: string;
  personality: string;
  position: { x: number; y: number };
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  color: string;
  voice: string;
}

const INITIAL_CHARACTERS: GameCharacter[] = [
  {
    id: 'wizard',
    name: 'Merlin the Wise',
    personality: 'You are Merlin, an ancient and wise wizard. You speak in a mystical way, often referencing magic, ancient knowledge, and cosmic forces. You are helpful but cryptic, giving advice through metaphors and riddles.',
    position: { x: 20, y: 30 },
    conversation: [],
    color: 'bg-purple-600',
    voice: 'pNInz6obpgDQGcFmaJgB' // Adam voice
  },
  {
    id: 'warrior',
    name: 'Sir Gareth',
    personality: 'You are Sir Gareth, a brave and honorable knight. You speak with confidence and honor, always ready for battle and adventure. You value courage, loyalty, and justice above all else.',
    position: { x: 70, y: 40 },
    conversation: [],
    color: 'bg-red-600',
    voice: 'EXAVITQu4vr4xnSDxMaL' // Bella voice
  },
  {
    id: 'merchant',
    name: 'Goldie the Trader',
    personality: 'You are Goldie, a clever merchant who loves making deals and talking about business. You are friendly but always looking for opportunities. You speak enthusiastically about trade, gold, and profitable ventures.',
    position: { x: 45, y: 60 },
    conversation: [],
    color: 'bg-yellow-600',
    voice: 'ErXwobaYiN019PkySvjV' // Antoni voice
  },
  {
    id: 'scholar',
    name: 'Elena the Scholar',
    personality: 'You are Elena, a brilliant scholar and researcher. You love books, knowledge, and intellectual discussions. You speak precisely and are always eager to share fascinating facts and theories.',
    position: { x: 25, y: 70 },
    conversation: [],
    color: 'bg-blue-600',
    voice: 'MF3mGyEYCl7XYWbV9V6O' // Elli voice
  }
];

export default function VoiceGame() {
  const [characters, setCharacters] = useState<GameCharacter[]>(INITIAL_CHARACTERS);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<GameCharacter | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    if (!selectedCharacter) {
      alert('Please select a character to talk to!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [selectedCharacter]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processAudio = async (audioBlob: Blob) => {
    if (!selectedCharacter) return;

    setIsProcessing(true);
    try {
      // Convert speech to text
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const transcriptionResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { text } = await transcriptionResponse.json();
      
      if (!text.trim()) {
        setIsProcessing(false);
        return;
      }

      // Get character response
      const character = characters.find(c => c.id === selectedCharacter);
      if (!character) return;

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          character: character,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get character response');
      }

      const { response } = await chatResponse.json();

      // Convert response to speech
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: response,
          voice: character.voice,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audio = new Audio();
      audio.src = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));
      audio.play();

      // Update character conversation
      setCharacters(prev => prev.map(c => 
        c.id === selectedCharacter 
          ? {
              ...c,
              conversation: [
                ...c.conversation,
                { role: 'user', content: text },
                { role: 'assistant', content: response }
              ]
            }
          : c
      ));

    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditCharacter = (character: GameCharacter) => {
    setEditingCharacter({ ...character });
    setIsAddingNew(false);
    setShowEditor(true);
  };

  const handleAddCharacter = () => {
    const newCharacter: GameCharacter = {
      id: `character_${Date.now()}`,
      name: 'New Character',
      personality: 'You are a helpful and friendly character.',
      position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 },
      conversation: [],
      color: 'bg-gray-600',
      voice: 'pNInz6obpgDQGcFmaJgB' // Default voice
    };
    setEditingCharacter(newCharacter);
    setIsAddingNew(true);
    setShowEditor(true);
  };

  const handleSaveCharacter = () => {
    if (!editingCharacter) return;

    if (isAddingNew) {
      setCharacters(prev => [...prev, editingCharacter]);
    } else {
      setCharacters(prev => prev.map(c => 
        c.id === editingCharacter.id ? editingCharacter : c
      ));
    }

    setShowEditor(false);
    setEditingCharacter(null);
    setIsAddingNew(false);
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (characters.length <= 1) {
      alert('You must have at least one character!');
      return;
    }
    
    setCharacters(prev => prev.filter(c => c.id !== characterId));
    if (selectedCharacter === characterId) {
      setSelectedCharacter(null);
    }
    setShowEditor(false);
    setEditingCharacter(null);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingCharacter(null);
    setIsAddingNew(false);
  };

  const selectedChar = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Voice Adventures
        </h1>
        <p className="text-white/80 text-center">
          Click on a character and talk to them!
        </p>
      </div>

      {/* Characters */}
      {characters.map((character) => (
        <Character
          key={character.id}
          character={character}
          isSelected={selectedCharacter === character.id}
          onClick={() => setSelectedCharacter(character.id)}
          onEdit={() => handleEditCharacter(character)}
        />
      ))}

      {/* Add Character Button */}
      <button
        onClick={handleAddCharacter}
        className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors z-20"
      >
        + Add Character
      </button>

      {/* Voice Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-center">
          {selectedCharacter ? (
            <div className="space-y-4">
              <p className="text-white mb-4">
                Talking to: <span className="font-bold text-yellow-400">{selectedChar?.name}</span>
              </p>
              
              {!isListening && !isProcessing && (
                <button
                  onClick={startListening}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  🎤 Start Talking
                </button>
              )}

              {isListening && (
                <button
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors animate-pulse"
                >
                  🛑 Stop Recording
                </button>
              )}

              {isProcessing && (
                <div className="text-white">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  Processing...
                </div>
              )}
            </div>
          ) : (
            <p className="text-white">Select a character to start talking!</p>
          )}
        </div>
      </div>

      {/* Conversation History */}
      {selectedChar && selectedChar.conversation.length > 0 && (
        <div className="absolute top-20 right-4 w-80 max-h-96 overflow-y-auto bg-black/70 backdrop-blur-sm rounded-lg p-4 z-20">
          <h3 className="text-white font-bold mb-2">Conversation with {selectedChar.name}</h3>
          <div className="space-y-2">
            {selectedChar.conversation.slice(-6).map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/50 text-white ml-4' 
                    : 'bg-gray-600/50 text-white mr-4'
                }`}
              >
                <strong>{msg.role === 'user' ? 'You' : selectedChar.name}:</strong> {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character Editor Modal */}
      {showEditor && editingCharacter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {isAddingNew ? 'Add New Character' : `Edit ${editingCharacter.name}`}
            </h2>

            <div className="space-y-4">
              {/* Character Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={(e) => setEditingCharacter(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter character name"
                />
              </div>

              {/* Character Personality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Character Personality & Prompt
                </label>
                <textarea
                  value={editingCharacter.personality}
                  onChange={(e) => setEditingCharacter(prev => prev ? {...prev, personality: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Describe the character's personality, speaking style, and behavior..."
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Character Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {['bg-purple-600', 'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-gray-600'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCharacter(prev => prev ? {...prev, color} : null)}
                      className={`w-8 h-8 rounded-full ${color} border-2 ${editingCharacter.color === color ? 'border-black' : 'border-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice ID (ElevenLabs)
                </label>
                <select
                  value={editingCharacter.voice}
                  onChange={(e) => setEditingCharacter(prev => prev ? {...prev, voice: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pNInz6obpgDQGcFmaJgB">Adam (Male, Deep)</option>
                  <option value="EXAVITQu4vr4xnSDxMaL">Bella (Female, Young)</option>
                  <option value="ErXwobaYiN019PkySvjV">Antoni (Male, Well-rounded)</option>
                  <option value="MF3mGyEYCl7XYWbV9V6O">Elli (Female, Emotional)</option>
                  <option value="TxGEqnHWrfWFTfGW9XjX">Josh (Male, Young)</option>
                  <option value="VR6AewLTigWG4xSOukaG">Arnold (Male, Crisp)</option>
                  <option value="pqHfZKP75CvOlQylNhV4">Bill (Male, Strong)</option>
                  <option value="nPczCjzI2devNBz1zQrb">Brian (Male, Deep)</option>
                </select>
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={editingCharacter.position.x}
                    onChange={(e) => setEditingCharacter(prev => prev ? {
                      ...prev, 
                      position: {...prev.position, x: parseInt(e.target.value) || 0}
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="85"
                    value={editingCharacter.position.y}
                    onChange={(e) => setEditingCharacter(prev => prev ? {
                      ...prev, 
                      position: {...prev.position, y: parseInt(e.target.value) || 0}
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {!isAddingNew && (
                  <button
                    onClick={() => handleDeleteCharacter(editingCharacter.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete Character
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCharacter}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isAddingNew ? 'Add Character' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 