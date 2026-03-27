import React from 'react';
import { X } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

const gifLibrary = [
  { id: '1', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Hello' },
  { id: '2', url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif', title: 'Thanks' },
  { id: '3', url: 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', title: 'Cool' },
  { id: '4', url: 'https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif', title: 'Love' },
  { id: '5', url: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif', title: 'Wow' },
  { id: '6', url: 'https://media.giphy.com/media/3o7abGQa0aRJUurpII/giphy.gif', title: 'Laugh' },
  { id: '7', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', title: 'Yes' },
  { id: '8', url: 'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif', title: 'No' },
  { id: '9', url: 'https://media.giphy.com/media/26BRzozg4TCXvXnsR/giphy.gif', title: 'Bye' },
];

interface GifPickerProps {
  onSelect: (gif: string) => void;
  onClose: () => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  return (
    <GlassCard className="absolute bottom-20 right-4 w-96 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">GIFs</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-5 h-5 text-[#8E9AAF]" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
        {gifLibrary.map((gif) => (
          <button
            key={gif.id}
            onClick={() => {
              onSelect(gif.url);
              onClose();
            }}
            className="rounded-lg overflow-hidden hover:opacity-80 transition"
          >
            <img
              src={gif.url}
              alt={gif.title}
              className="w-full h-24 object-cover"
            />
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

export default GifPicker;
