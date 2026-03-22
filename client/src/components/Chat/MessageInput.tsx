import React, { useState, useRef } from 'react';
import { Send, Smile, Sticker, Gif, Mic, Image, Calendar } from 'lucide-react';
import EmojiPicker from 'react-emoji-picker';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';
import VoiceRecorder from './VoiceRecorder';

interface MessageInputProps {
  onSend: (content: string, type?: string, mediaUrl?: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onSend('', 'image', ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStickerSelect = (sticker: string) => {
    onSend(sticker, 'sticker');
    setShowStickers(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    onSend('', 'gif', gifUrl);
    setShowGifs(false);
  };

  const handleVoiceSend = (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      onSend('', 'voice', reader.result as string);
    };
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Smile size={20} />
          </button>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Sticker size={20} />
          </button>
          <button
            onClick={() => setShowGifs(!showGifs)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Gif size={20} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Image size={20} />
          </button>
          <VoiceRecorder onSend={handleVoiceSend} />
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Calendar size={20} />
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
      {showEmoji && (
        <div className="absolute bottom-16">
          <EmojiPicker onEmojiClick={(emoji) => setMessage(message + emoji.emoji)} />
        </div>
      )}
      {showStickers && <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickers(false)} />}
      {showGifs && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifs(false)} />}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
    </div>
  );
};

export default MessageInput;
