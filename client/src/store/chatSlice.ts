import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../services/chatService';
import { IChat, IMessage } from '@nexora/shared';

interface ChatState {
  chats: IChat[];
  currentChat: IChat | null;
  messages: IMessage[];
  loading: boolean;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const response = await chatService.getChats();
  return response.data;
});

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string) => {
    const response = await chatService.getMessages(chatId);
    return { chatId, messages: response.data };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: any) => {
    const response = await chatService.sendMessage(data);
    return response.data;
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }: { messageId: string; content: string }) => {
    const response = await chatService.editMessage(messageId, content);
    return response.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string) => {
    await chatService.deleteMessage(messageId);
    return messageId;
  }
);

export const addReaction = createAsyncThunk(
  'chat/addReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
    const response = await chatService.addReaction(messageId, emoji);
    return { messageId, reactions: response.data };
  }
);

export const createPoll = createAsyncThunk(
  'chat/createPoll',
  async (data: any) => {
    const response = await chatService.createPoll(data);
    return response.data;
  }
);

export const scheduleMessage = createAsyncThunk(
  'chat/scheduleMessage',
  async (data: any) => {
    const response = await chatService.scheduleMessage(data);
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(m => m.id === action.payload.id);
      if (index !== -1) state.messages[index] = action.payload;
    },
    deleteMessageLocally: (state, action) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    updateReaction: (state, action) => {
      const { messageId, reactions } = action.payload;
      const msg = state.messages.find(m => m.id === messageId);
      if (msg) msg.reactions = reactions;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) state.messages[index] = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.id !== action.payload);
      })
      .addCase(addReaction.fulfilled, (state, action) => {
        const { messageId, reactions } = action.payload;
        const msg = state.messages.find(m => m.id === messageId);
        if (msg) msg.reactions = reactions;
      });
  },
});

export const { setCurrentChat, addMessage, updateMessage, deleteMessageLocally, updateReaction } = chatSlice.actions;
export default chatSlice.reducer;
