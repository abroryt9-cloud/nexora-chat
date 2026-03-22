import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchChats,
  fetchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  createPoll,
  scheduleMessage,
} from '../store/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { chats, currentChat, messages, loading } = useSelector((state: RootState) => state.chat);

  const getChats = useCallback(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const getMessages = useCallback((chatId: string) => {
    dispatch(fetchMessages(chatId));
  }, [dispatch]);

  const send = useCallback((chatId: string, content: string, type: string, mediaUrl?: string) => {
    dispatch(sendMessage({ chatId, content, type, mediaUrl }));
  }, [dispatch]);

  const edit = useCallback((messageId: string, content: string) => {
    dispatch(editMessage({ messageId, content }));
  }, [dispatch]);

  const remove = useCallback((messageId: string) => {
    dispatch(deleteMessage(messageId));
  }, [dispatch]);

  const react = useCallback((messageId: string, emoji: string) => {
    dispatch(addReaction({ messageId, emoji }));
  }, [dispatch]);

  const createNewPoll = useCallback((chatId: string, question: string, options: string[]) => {
    dispatch(createPoll({ chatId, question, options }));
  }, [dispatch]);

  const schedule = useCallback((chatId: string, content: string, scheduledFor: Date) => {
    dispatch(scheduleMessage({ chatId, content, scheduledFor }));
  }, [dispatch]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    fetchChats: getChats,
    fetchMessages: getMessages,
    sendMessage: send,
    editMessage: edit,
    deleteMessage: remove,
    addReaction: react,
    createPoll: createNewPoll,
    scheduleMessage: schedule,
  };
};
