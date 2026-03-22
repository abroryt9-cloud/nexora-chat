import api from './api';

export const chatService = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (data: any) => api.post('/chats/messages', data),
  editMessage: (messageId: string, content: string) =>
    api.put(`/chats/messages/${messageId}`, { content }),
  deleteMessage: (messageId: string) =>
    api.delete(`/chats/messages/${messageId}`),
  addReaction: (messageId: string, emoji: string) =>
    api.post(`/chats/messages/${messageId}/reactions`, { emoji }),
  createPoll: (data: any) => api.post('/chats/polls', data),
  scheduleMessage: (data: any) => api.post('/chats/schedule', data),
};
