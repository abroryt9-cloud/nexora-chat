import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Smile, Paperclip, MoreHorizontal } from 'lucide-react';

import { RootState } from '../../store';
import { loadMessages, sendMessage, selectChat } from '../../store/chatSlice';
import GlassCard from '../Common/GlassCard';
import MessageBubble from './MessageBubble';
import Loader from '../Common/Loader';

const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  
  const { 
    selectedChatId, 
    messages, 
    chats, 
    messagesLoading,
    typing 
  } = useSelector((state: RootState) => state.chat);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const chatMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  const typingUsers = selectedChatId ? typing[selectedChatId] || [] : [];
  
  useEffect(() => {
    if (selectedChatId) {
      dispatch(loadMessages({ chatId: selectedChatId }) as any);
    }
  }, [dispatch, selectedChatId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedChatId) return;
    
    try {
      await dispatch(sendMessage({ 
        chatId: selectedChatId, 
        text: messageText.trim() 
      }) as any).unwrap();
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // TODO: Implement typing indicators
    // dispatch(sendTypingIndicator(selectedChatId, true));
  };
  
  if (!selectedChatId) {
    return (
      <div className="chat-window-container">
        <GlassCard className="chat-window-empty">
          <div className="empty-state">
            <Send className="empty-icon" />
            <h3 className="empty-title">Выберите чат</h3>
            <p className="empty-subtitle">
              Выберите чат из списка или начните новый разговор
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }
  
  return (
    <div className="chat-window-container">
      <GlassCard className="chat-window" padding="none">
        {/* Chat Header */}
        <div className="chat-window-header">
          <div className="chat-info">
            <div className="chat-avatar">
              {selectedChat?.title.charAt(0).toUpperCase()}
              {selectedChat?.isOnline && <span className="online-dot" />}
            </div>
            <div className="chat-details">
              <h3 className="chat-name">{selectedChat?.title}</h3>
              <p className="chat-status">
                {typingUsers.length > 0 
                  ? `${typingUsers.join(', ')} печатает...`
                  : selectedChat?.isOnline 
                    ? 'В сети' 
                    : 'Был в сети недавно'
                }
              </p>
            </div>
          </div>
          
          <div className="chat-actions">
            <button className="chat-action-btn">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="chat-messages-container">
          {messagesLoading ? (
            <div className="messages-loading">
              <Loader text="Загрузка сообщений..." />
            </div>
          ) : (
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  <p>Начните разговор!</p>
                </div>
              ) : (
                chatMessages.map((message, index) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const showAvatar = !isOwnMessage && (
                    index === 0 || 
                    chatMessages[index - 1].senderId !== message.senderId
                  );
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                      chatType={selectedChat?.type || 'direct'}
                    />
                  );
                })
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="typing-text">
                    {typingUsers.join(', ')} печатает...
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="chat-input-container">
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="input-toolbar">
              <button type="button" className="toolbar-btn">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="toolbar-btn">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            <div className="input-field-container">
              <textarea
                value={messageText}
                onChange={handleInputChange}
                placeholder="Введите сообщение..."
                className="message-input"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <button 
                type="submit" 
                className={`send-btn ${messageText.trim() ? 'active' : ''}`}
                disabled={!messageText.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatWindow;
