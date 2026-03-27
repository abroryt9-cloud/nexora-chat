import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchMessages, sendMessage as sendMsg } from '../../store/chatSlice';
import { ArrowLeft, Send, Mic, Sticker, Image, BarChart2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';
import PollCreator from './PollCreator';
import EmojiPicker from 'emoji-picker-react';
import GlassCard from '../Common/GlassCard';

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string, type: string = 'text', mediaUrl?: string) => {
    if (!chatId || !content.trim()) return;
    
    dispatch(sendMsg({
      chatId,
      content,
      type,
      mediaUrl,
    }));
    
    setInputText('');
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
    setShowGifPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  const handleReaction = (_messageId: string, _emoji: string) => {
    // Dispatch reaction action
  };

  const handleEdit = (_messageId: string, _newContent: string) => {
    // Dispatch edit action
  };

  const handleDelete = (_messageId: string) => {
    // Dispatch delete action
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Send voice message
        const formData = new FormData();
        formData.append('audio', blob);
        // Upload and send logic here
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // MediaRecorder will stop automatically
  };

  const getChatTitle = () => {
    if (chatId === 'ai-assistant') return 'AI Assistant';
    return 'Chat';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[rgba(17,21,31,0.6)] backdrop-blur-xl">
        <button
          onClick={() => navigate('/chats')}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex-1">
          <h2 className="font-semibold text-white">{getChatTitle()}</h2>
          <p className="text-xs text-[#8E9AAF]">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-[#8E9AAF]">Start the conversation!</p>
            </GlassCard>
          </div>
        ) : (
          messages.map((msg: any) => (
            <MessageBubble
              key={msg._id || msg.id}
              message={msg}
              isOwn={msg.senderId?._id === user?.id || msg.senderId === user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReaction={handleReaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[rgba(17,21,31,0.6)] backdrop-blur-xl">
        {/* Pickers */}
        <div className="flex gap-2 mb-3">
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => handleSend(emoji.emoji, 'reaction')}
              />
            </div>
          )}
          
          {showStickerPicker && (
            <StickerPicker
              onSelect={(sticker) => handleSend(sticker, 'sticker')}
              onClose={() => setShowStickerPicker(false)}
            />
          )}
          
          {showGifPicker && (
            <GifPicker
              onSelect={(gif) => handleSend(gif, 'gif')}
              onClose={() => setShowGifPicker(false)}
            />
          )}
          
          {showPollCreator && (
            <PollCreator
              chatId={chatId!}
              onCreate={() => setShowPollCreator(false)}
              onClose={() => setShowPollCreator(false)}
            />
          )}
        </div>

        {/* Input */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Sticker className="w-5 h-5 text-[#8E9AAF]" />
          </button>
          
          <button
            onClick={() => setShowGifPicker(!showGifPicker)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Image className="w-5 h-5 text-[#8E9AAF]" />
          </button>
          
          <button
            onClick={() => setShowPollCreator(!showPollCreator)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <BarChart2 className="w-5 h-5 text-[#8E9AAF]" />
          </button>
          
          <div className="flex-1 relative">
            <MessageInput
              value={inputText}
              onChange={setInputText}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
          </div>
          
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            className={`p-3 rounded-full transition ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'hover:bg-white/10'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#8E9AAF]'}`} />
          </button>
          
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            className="p-3 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
