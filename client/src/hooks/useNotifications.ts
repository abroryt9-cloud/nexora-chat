import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useWebSocket } from './useWebSocket';

export const useNotifications = () => {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: any) => {
      toast(notification.message || 'New notification');
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);
};
