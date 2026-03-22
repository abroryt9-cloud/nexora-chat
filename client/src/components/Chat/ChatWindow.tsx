import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { IMessage } from '@nexora/shared';
import { Loader } from '../Common/Loader';

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentChat, messages, fetchMessages, sendMessage, editMessage, deleteMessage, addReaction } = useChat();
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId).finally(() => setLoading(false));
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit('joinChat', chatId);
    return () => {
      socket.emit('leaveChat', chatId);
    };
  }, [socket, chatId]);

  const handleSend = (content: string, type: string = 'text', mediaUrl?: string) => {
    if (!chatId) return;
    sendMessage(chatId, content, type, mediaUrl);
  };

  const handleEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg: IMessage) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReaction={handleReaction}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
