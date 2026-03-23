import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import VideoCall from './VideoCall';
import { IMessage, IChat } from '@nexora/shared';
import { Loader } from '../Common/Loader';
import { Phone, Video } from 'lucide-react';

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentChat, messages, fetchMessages, sendMessage, editMessage, deleteMessage, addReaction } = useChat();
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [callState, setCallState] = useState<{
    isActive: boolean;
    isVideo: boolean;
    participantId: string;
    participantName: string;
    participantAvatar?: string;
  } | null>(null);

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

  const startCall = (isVideo: boolean) => {
    if (!currentChat) return;
    const otherParticipant = currentChat.participants.find(p => p !== user?.id);
    if (otherParticipant) {
      setCallState({
        isActive: true,
        isVideo,
        participantId: otherParticipant,
        participantName: currentChat.name || 'User',
        participantAvatar: (currentChat as IChat).avatar,
      });
    }
  };

  const endCall = () => {
    setCallState(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header with Call Buttons */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {(currentChat as IChat)?.avatar && (
            <img
              src={(currentChat as IChat).avatar}
              alt={currentChat?.name || 'Chat'}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{currentChat?.name || 'Chat'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentChat?.type === 'group' ? `${currentChat.participants?.length} participants` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => startCall(false)}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition"
            title="Voice Call"
          >
            <Phone size={20} />
          </button>
          <button
            onClick={() => startCall(true)}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
            title="Video Call"
          >
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <MessageInput onSend={handleSend} />

      {/* Video Call Modal */}
      {callState && (
        <VideoCall
          chatId={chatId!}
          participantId={callState.participantId}
          participantName={callState.participantName}
          participantAvatar={callState.participantAvatar}
          isVideoCall={callState.isVideo}
          onClose={endCall}
        />
      )}
    </div>
  );
};

export default ChatWindow;
