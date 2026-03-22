import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const ChatList: React.FC = () => {
  const { chats, fetchChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const getChatName = (chat: any) => {
    if (chat.type === 'private') {
      const other = chat.participants.find((p: any) => p._id !== user?.id);
      return other?.username || 'Unknown';
    }
    return chat.name || 'Group Chat';
  };

  const getAvatar = (chat: any) => {
    if (chat.type === 'private') {
      const other = chat.participants.find((p: any) => p._id !== user?.id);
      return other?.avatar || `https://ui-avatars.com/api/?name=${other?.username}&background=random`;
    }
    return chat.avatar || 'https://ui-avatars.com/api/?name=Group&background=random';
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <img src={getAvatar(chat)} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{getChatName(chat)}</h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage.content}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
