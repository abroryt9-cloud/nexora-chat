import React, { useState } from 'react';
import { IMessage } from '@nexora/shared';
import { format } from 'date-fns';
import { MoreVertical, Edit, Trash2, Reply } from 'lucide-react';
import Reactions from './Reactions';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onReaction: (id: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReaction,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setEditing(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1">{message.senderId.username}</div>
        )}
        {editing ? (
          <div>
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              autoFocus
            />
            <button onClick={handleSaveEdit} className="text-xs mt-1 underline">
              Save
            </button>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}
        <div className="flex items-center justify-between mt-1 text-xs opacity-70">
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {message.edited && <span className="ml-2">(edited)</span>}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="ml-2 p-1 hover:bg-black/10 rounded"
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-10">
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(message.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-red-500"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Reactions
          reactions={message.reactions}
          onAddReaction={(emoji) => onReaction(message.id, emoji)}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
