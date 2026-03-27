import React, { useState } from 'react';
import { X } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

const stickerCategories = [
  {
    id: 'happy',
    name: 'Happy',
    stickers: ['😊', '😂', '😍', '🥳', '😎', '🤗', '😁', '🥰', '😇', '😄'],
  },
  {
    id: 'funny',
    name: 'Funny',
    stickers: ['🤪', '😜', '🫠', '🤣', '😹', '🙃', '🤡', '👻', '🤖', '🦄'],
  },
  {
    id: 'love',
    name: 'Love',
    stickers: ['❤️', '😘', '💕', '🥰', '💖', '💗', '💓', '💞', '💝', '❣️'],
  },
  {
    id: 'cool',
    name: 'Cool',
    stickers: ['😎', '🔥', '💪', '👑', '🌟', '✨', '⭐', '⚡', '🎸', '🚀'],
  },
  {
    id: 'animals',
    name: 'Animals',
    stickers: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  },
];

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('happy');

  const currentStickers = stickerCategories.find(c => c.id === selectedCategory)?.stickers || [];

  return (
    <GlassCard className="absolute bottom-20 right-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Stickers</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-5 h-5 text-[#8E9AAF]" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {stickerCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] text-white'
                : 'bg-[rgba(26,29,45,0.6)] text-[#8E9AAF] hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
        {currentStickers.map((sticker, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(sticker);
              onClose();
            }}
            className="text-3xl hover:scale-125 transition p-2 hover:bg-white/10 rounded-lg"
          >
            {sticker}
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

export default StickerPicker;
