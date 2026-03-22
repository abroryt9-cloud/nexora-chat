import React from 'react';
import { IReaction } from '@nexora/shared';

interface ReactionsProps {
  reactions: IReaction[];
  onAddReaction: (emoji: string) => void;
}

const emojiList = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const Reactions: React.FC<ReactionsProps> = ({ reactions, onAddReaction }) => {
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onAddReaction(emoji)}
          className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {emoji} {count}
        </button>
      ))}
      <div className="relative group">
        <button className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 hover:bg-gray-300 dark:hover:bg-gray-600">
          +
        </button>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1">
          {emojiList.map(emoji => (
            <button
              key={emoji}
              onClick={() => onAddReaction(emoji)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reactions;
