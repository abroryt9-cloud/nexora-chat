import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchChats } from '../../store/chatSlice';
import { Search, Plus, MessageCircle } from 'lucide-react';
import GlassCard from '../Common/GlassCard';
import { IChat } from '@nexora/shared';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { chats, loading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const getChatName = (chat: IChat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'personal' && chat.participants) {
      const other = chat.participants.find(p => p !== user?.id);
      return other || 'Unknown';
    }
    return 'Chat';
  };

  const getChatAvatar = (chat: IChat) => {
    if (chat.avatar) return chat.avatar;
    return undefined;
  };

  const getLastMessage = (chat: IChat) => {
    if (chat.lastMessage) {
      return chat.lastMessage;
    }
    return 'No messages yet';
  };

  const getLastMessageTime = (chat: IChat) => {
    if (chat.lastMessageTime) {
      const date = new Date(chat.lastMessageTime);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  const filteredChats = chats.filter((chat: IChat) =>
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = () => {
    // For demo, create a chat with AI assistant
    navigate('/chat/ai-assistant');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] bg-clip-text text-transparent">
            Messages
          </h1>
          <button
            onClick={handleCreateChat}
            className="p-2 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-full hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E9AAF]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-2xl text-white placeholder-[#8E9AAF] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-[#8E9AAF] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No chats yet</h3>
            <p className="text-[#8E9AAF]">Start a new conversation!</p>
          </div>
        ) : (
          filteredChats.map((chat: IChat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="cursor-pointer"
            >
              <GlassCard hover>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {getChatAvatar(chat) ? (
                    <img
                      src={getChatAvatar(chat)}
                      alt={getChatName(chat)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D9FF] flex items-center justify-center text-white font-bold">
                      {getChatName(chat)[0].toUpperCase()}
                    </div>
                  )}
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00FFA3] rounded-full border-2 border-[#0A0C12]"></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white truncate">
                      {getChatName(chat)}
                    </h3>
                    {getLastMessageTime(chat) && (
                      <span className="text-xs text-[#8E9AAF]">
                        {getLastMessageTime(chat)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8E9AAF] truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>

                {/* Unread badge */}
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <div className="w-6 h-6 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
              </GlassCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
