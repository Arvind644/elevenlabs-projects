'use client';

interface CharacterProps {
  character: {
    id: string;
    name: string;
    position: { x: number; y: number };
    color: string;
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

export default function Character({ character, isSelected, onClick, onEdit }: CharacterProps) {
  const hasSpoken = character.conversation.length > 0;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{
        left: `${character.position.x}%`,
        top: `${character.position.y}%`,
      }}
      onClick={onClick}
    >
      {/* Character Avatar */}
      <div
        className={`
          w-20 h-20 rounded-full border-4 transition-all duration-300 flex items-center justify-center
          ${isSelected 
            ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/50' 
            : 'border-white/50 hover:border-white hover:scale-105'
          }
          ${character.color}
          ${hasSpoken ? 'animate-pulse' : ''}
        `}
      >
        {/* Character Icon/Initial */}
        <span className="text-white text-2xl font-bold">
          {character.name.charAt(0)}
        </span>
      </div>

      {/* Character Name */}
      <div
        className={`
          mt-2 text-center px-2 py-1 rounded-lg text-sm font-semibold transition-all
          ${isSelected 
            ? 'bg-yellow-400 text-black' 
            : 'bg-black/50 text-white'
          }
        `}
      >
        {character.name}
      </div>

      {/* Speaking Indicator */}
      {hasSpoken && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-xs">💬</span>
        </div>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <div className="absolute -inset-4 border-2 border-yellow-400 rounded-full animate-ping opacity-75"></div>
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={handleEditClick}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
          title="Edit Character"
        >
          ✏️
        </button>
      )}
    </div>
  );
} 