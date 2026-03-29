import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../services/api';

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

interface Chat {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participantIds: string[];
  lastMessage?: {
    text: string;
    createdAt: string;
    senderName: string;
  };
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: string;
}

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  typing: Record<string, string[]>; // chatId -> usernames typing
}

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  messages: {},
  loading: false,
  messagesLoading: false,
  error: null,
  typing: {},
};

// Асинхронные действия
export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/chats/list');
      return data.chats || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки чатов');
    }
  }
);

export const loadMessages = createAsyncThunk(
  'chat/loadMessages',
  async ({ chatId, page = 1 }: { chatId: string; page?: number }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/messages/${chatId}?page=${page}`);
      return { chatId, messages: data.messages || [], page, total: data.total || 0 };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки сообщений');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text, replyToId }: { chatId: string; text: string; replyToId?: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/messages/${chatId}`, { text, replyToId });
      return { chatId, message: data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отправки сообщения');
    }
  }
);

export const createDirectChat = createAsyncThunk(
  'chat/createDirectChat',
  async (usernameOrEmail: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/chats/direct', { usernameOrEmail });
      return data.chat;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания чата');
    }
  }
);

export const reactToMessage = createAsyncThunk(
  'chat/reactToMessage',
  async ({ messageId, emoji }: { messageId: string; emoji: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/messages/${messageId}/react`, { emoji });
      return { messageId, message: data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка реакции');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectChat: (state, action: PayloadAction<string>) => {
      state.selectedChatId = action.payload;
      // Сбрасываем счетчик непрочитанных для выбранного чата
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
      
      // Обновляем последнее сообщение в чате
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = {
          text: message.text,
          createdAt: message.createdAt,
          senderName: message.senderName,
        };
        
        // Увеличиваем счетчик непрочитанных, если чат не выбран
        if (state.selectedChatId !== chatId) {
          chat.unreadCount += 1;
        }
      }
    },
    
    updateMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const index = messages.findIndex(m => m.id === message.id);
        if (index !== -1) {
          messages[index] = message;
        }
      }
    },
    
    setTyping: (state, action: PayloadAction<{ chatId: string; usernames: string[] }>) => {
      const { chatId, usernames } = action.payload;
      if (usernames.length > 0) {
        state.typing[chatId] = usernames;
      } else {
        delete state.typing[chatId];
      }
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
  },
  
  extraReducers: (builder) => {
    // Load Chats
    builder
      .addCase(loadChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.map((chat: any) => ({
          ...chat,
          unreadCount: 0,
          isOnline: Math.random() > 0.5, // Mock online status
          isPinned: false,
          isArchived: false,
        }));
        state.error = null;
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load Messages
    builder
      .addCase(loadMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages.map((msg: any) => ({
          ...msg,
          senderName: msg.senderName || 'Неизвестный',
          reactions: msg.reactions || {},
          readBy: msg.readBy || [],
        }));
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      });

    // Send Message
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        state.messages[chatId].push({
          ...message,
          senderName: message.senderName || 'Вы',
          reactions: {},
          readBy: [message.senderId],
        });
        
        // Обновляем последнее сообщение в чате
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
          chat.lastMessage = {
            text: message.text,
            createdAt: message.createdAt,
            senderName: 'Вы',
          };
        }
      });

    // Create Direct Chat
    builder
      .addCase(createDirectChat.fulfilled, (state, action) => {
        const newChat = {
          ...action.payload,
          unreadCount: 0,
          isOnline: true,
          isPinned: false,
          isArchived: false,
        };
        
        // Добавляем чат, если его еще нет
        const exists = state.chats.find(c => c.id === newChat.id);
        if (!exists) {
          state.chats.unshift(newChat);
        }
        
        // Выбираем новый чат
        state.selectedChatId = newChat.id;
      });

    // React to Message
    builder
      .addCase(reactToMessage.fulfilled, (state, action) => {
        const { messageId, message } = action.payload;
        // Найти сообщение во всех чатах и обновить его
        Object.values(state.messages).forEach((messages) => {
          const msgIndex = messages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            messages[msgIndex] = {
              ...messages[msgIndex],
              reactions: message.reactions || {},
            };
          }
        });
      });
  },
});

export const {
  selectChat,
  clearError,
  addMessage,
  updateMessage,
  setTyping,
  markAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;
