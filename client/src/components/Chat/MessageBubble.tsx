import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Smile } from 'lucide-react';

interface Message {
  _id?: string;
  id?: string;
  content: string;
  type: string;
  senderId?: any;
  createdAt: string;
  edited?: boolean;
  reactions?: Array<{
    userId: string;
    emoji: string;
  }>;
  mediaUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
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
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message._id || message.id || '', editContent);
    }
    setEditing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageId = () => message._id || message.id || '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group max-w-[70%]">
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] text-white'
              : 'bg-[rgba(30,30,42,0.8)] backdrop-blur-xl border border-white/10 text-white'
          }`}
        >
          {/* Content */}
          {editing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded text-white"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-3 py-1 bg-[#6C5CE7] rounded hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs px-3 py-1 bg-[rgba(26,29,45,0.6)] rounded hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : message.type === 'sticker' ? (
            <div className="text-6xl">{message.content}</div>
          ) : message.type === 'gif' ? (
            <img src={message.mediaUrl} alt="GIF" className="rounded-lg max-w-full" />
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}

          {/* Footer */}
          {!editing && (
            <div className="flex items-center justify-between mt-1 text-xs opacity-70">
              <span>{formatTime(message.createdAt)}</span>
              {message.edited && <span className="ml-2">(edited)</span>}
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <MoreVertical size={14} />
                </button>
                
                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-1 bg-[rgba(17,21,31,0.9)] backdrop-blur-xl border border-white/10 shadow-lg rounded-xl overflow-hidden z-50 min-w-[120px]">
                    {isOwn && (
                      <>
                        <button
                          onClick={() => {
                            setEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 w-full text-left"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(getMessageId());
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 w-full text-left text-red-400"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowReactions(!showReactions);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 w-full text-left"
                    >
                      <Smile size={14} /> React
                    </button>
                  </div>
                )}

                {/* Reactions Picker */}
                {showReactions && (
                  <div className="absolute bottom-full right-0 mb-1 bg-[rgba(17,21,31,0.9)] backdrop-blur-xl border border-white/10 shadow-lg rounded-xl p-2 z-50">
                    <div className="flex gap-1">
                      {reactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReaction(getMessageId(), emoji);
                            setShowReactions(false);
                          }}
                          className="text-xl hover:scale-125 transition p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Existing Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="absolute -bottom-3 left-2 flex gap-1 bg-[rgba(17,21,31,0.9)] backdrop-blur-xl border border-white/10 rounded-full px-2 py-1">
            {message.reactions.slice(0, 3).map((reaction, index) => (
              <span key={index} className="text-xs">{reaction.emoji}</span>
            ))}
            {message.reactions.length > 3 && (
              <span className="text-xs text-[#8E9AAF]">+{message.reactions.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
