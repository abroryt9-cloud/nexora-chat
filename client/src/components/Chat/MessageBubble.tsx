import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MoreHorizontal, Reply, Edit, Trash2 } from 'lucide-react';

import { RootState } from '../../store';
import { reactToMessage } from '../../store/chatSlice';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  replyToId?: string;
  reactions: Record<string, string[]>;
  readBy: string[];
  editedAt?: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  chatType: 'direct' | 'group';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  chatType,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleReaction = async (emoji: string) => {
    try {
      await dispatch(reactToMessage({ messageId: message.id, emoji }) as any).unwrap();
      setShowReactions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };
  
  const getReactionCount = (emoji: string): number => {
    return message.reactions[emoji]?.length || 0;
  };
  
  const hasUserReacted = (emoji: string): boolean => {
    return message.reactions[emoji]?.includes(user?.id || '') || false;
  };
  
  const reactions = Object.entries(message.reactions).filter(([, users]) => users.length > 0);
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className={`message-container ${isOwnMessage ? 'own' : 'other'}`}>
      {/* Avatar for group chats */}
      {showAvatar && chatType === 'group' && !isOwnMessage && (
        <div className="message-avatar">
          <span className="avatar-text">
            {message.senderName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className="message-content">
        {/* Sender name for group chats */}
        {showAvatar && chatType === 'group' && !isOwnMessage && (
          <p className="message-sender">{message.senderName}</p>
        )}
        
        {/* Reply indicator */}
        {message.replyToId && (
          <div className="message-reply-indicator">
            <Reply className="w-3 h-3" />
            <span>Ответ на сообщение</span>
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <p className="message-text">{message.text}</p>
          
          {/* Message info */}
          <div className="message-info">
            {message.editedAt && (
              <span className="message-edited">изменено</span>
            )}
            <span className="message-time">
              {formatTime(message.createdAt)}
            </span>
            {isOwnMessage && (
              <span className="message-status">
                {message.readBy.length > 1 ? '✓✓' : '✓'}
              </span>
            )}
          </div>
          
          {/* Quick actions */}
          {showActions && (
            <div className="message-actions">
              <button
                className="action-btn"
                onClick={() => setShowReactions(!showReactions)}
                title="Добавить реакцию"
              >
                😊
              </button>
              <button className="action-btn" title="Ответить">
                <Reply className="w-4 h-4" />
              </button>
              {isOwnMessage && (
                <>
                  <button className="action-btn" title="Редактировать">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="action-btn danger" title="Удалить">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button className="action-btn" title="Ещё">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Quick reactions panel */}
          {showReactions && (
            <div className="quick-reactions">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  className="quick-reaction-btn"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="message-reactions">
            {reactions.map(([emoji, users]) => (
              <button
                key={emoji}
                className={`reaction ${hasUserReacted(emoji) ? 'active' : ''}`}
                onClick={() => handleReaction(emoji)}
                title={`${users.length} ${users.length === 1 ? 'реакция' : 'реакций'}`}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{getReactionCount(emoji)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
