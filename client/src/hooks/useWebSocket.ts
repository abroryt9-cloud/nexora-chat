import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage, updateMessage, deleteMessage, updateReaction } from '../store/chatSlice';

interface UseWebSocketOptions {
  onIncomingCall?: (data: { from: string; signal: RTCSessionDescriptionInit; isVideo: boolean }) => void;
  onCallAnswered?: (data: { from: string; signal: RTCSessionDescriptionInit }) => void;
  onCallEnded?: () => void;
  onIceCandidate?: (data: { from: string; candidate: RTCIceCandidate }) => void;
}

export const useWebSocket = (options?: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:5000';
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    // Message events
    socket.on('newMessage', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('messageEdited', (message) => {
      dispatch(updateMessage(message));
    });

    socket.on('messageDeleted', (messageId) => {
      (dispatch as any)(deleteMessage(messageId));
    });

    socket.on('reactionUpdated', ({ messageId, reactions }) => {
      (dispatch as any)(updateReaction({ messageId, reactions }));
    });

    // Call events
    socket.on('incomingCall', options?.onIncomingCall || (() => {}));
    socket.on('callAnswered', options?.onCallAnswered || (() => {}));
    socket.on('callEnded', options?.onCallEnded || (() => {}));
    socket.on('iceCandidate', options?.onIceCandidate || (() => {}));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [dispatch, options]);

  return { socket: socketRef.current };
};
