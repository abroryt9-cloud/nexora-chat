import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Users, Archive, Pin } from 'lucide-react';

import { RootState } from '../../store';
import { loadChats } from '../../store/chatSlice';
import GlassCard from '../Common/GlassCard';
import Loader from '../Common/Loader';

interface Chat {
  id: string;
  title: string;
  type: 'direct' | 'group';
  lastMessage?: {
    text: string;
    createdAt: string;
    senderName: string;
  };
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

const ChatList: React.FC = () => {
  const dispatch = useDispatch();
  const { chats, loading, selectedChatId } = useSelector((state: RootState) => state.chat);
  
  useEffect(() => {
    dispatch(loadChats() as any);
  }, [dispatch]);
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };
  
  const handleChatClick = (chatId: string) => {
    // TODO: Dispatch select chat action
    console.log('Selected chat:', chatId);
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <GlassCard className="chat-list-loading">
          <Loader text="Загрузка чатов..." />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <GlassCard className="chat-list" padding="none">
        {/* Header */}
        <div className="chat-list-header">
          <h3 className="chat-list-title">Чаты</h3>
          <button className="new-chat-btn">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chat items */}
        <div className="chat-items">
          {chats.length === 0 ? (
            <div className="empty-state">
              <MessageCircle className="empty-icon" />
              <p className="empty-text">Нет чатов</p>
              <p className="empty-subtitle">Начните новый разговор!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${
                  selectedChatId === chat.id ? 'active' : ''
                } ${chat.isPinned ? 'pinned' : ''}`}
                onClick={() => handleChatClick(chat.id)}
              >
                {/* Avatar */}
                <div className="chat-avatar">
                  {chat.type === 'group' ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    <span className="avatar-text">
                      {chat.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {chat.isOnline && chat.type === 'direct' && (
                    <span className="online-indicator" />
                  )}
                </div>
                
                {/* Content */}
                <div className="chat-content">
                  <div className="chat-header">
                    <h4 className="chat-title">
                      {chat.title}
                      {chat.isPinned && <Pin className="pin-icon" />}
                    </h4>
                    {chat.lastMessage && (
                      <span className="chat-time">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage ? (
                    <p className="chat-last-message">
                      {chat.type === 'group' && (
                        <span className="sender-name">
                          {chat.lastMessage.senderName}: 
                        </span>
                      )}
                      {chat.lastMessage.text.length > 50 
                        ? `${chat.lastMessage.text.substring(0, 50)}...`
                        : chat.lastMessage.text
                      }
                    </p>
                  ) : (
                    <p className="chat-no-messages">Нет сообщений</p>
                  )}
                </div>
                
                {/* Badges */}
                <div className="chat-badges">
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                  {chat.isArchived && (
                    <Archive className="archive-icon" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatList;
