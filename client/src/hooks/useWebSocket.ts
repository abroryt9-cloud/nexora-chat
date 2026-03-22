import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage, updateMessage, deleteMessage, updateReaction } from '../store/chatSlice';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('newMessage', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('messageEdited', (message) => {
      dispatch(updateMessage(message));
    });

    socket.on('messageDeleted', (messageId) => {
      dispatch(deleteMessage(messageId));
    });

    socket.on('reactionUpdated', ({ messageId, reactions }) => {
      dispatch(updateReaction({ messageId, reactions }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return { socket: socketRef.current };
};
