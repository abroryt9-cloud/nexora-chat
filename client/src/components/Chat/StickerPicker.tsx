import React, { useState } from 'react';
import { stickerCategories } from '@nexora/shared';

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(stickerCategories[0].id);

  const currentCategory = stickerCategories.find(c => c.id === activeCategory);

  return (
    <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 w-80 z-50">
      <div className="flex gap-2 border-b pb-2 mb-2">
        {stickerCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-1 text-sm rounded ${
              activeCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
        {currentCategory?.stickers.map((sticker, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(sticker)}
            className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;
