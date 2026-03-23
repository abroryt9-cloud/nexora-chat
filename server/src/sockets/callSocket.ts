import { Server, Socket } from 'socket.io';

// Для голосовых/видеозвонков (WebRTC)
export const setupCallHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Call initiation
    socket.on('callUser', ({ to, signal, isVideo }) => {
      socket.to(`user:${to}`).emit('incomingCall', { 
        from: (socket.data as any).user?._id, 
        signal,
        isVideo 
      });
    });

    // Call answer
    socket.on('answerCall', ({ to, signal }) => {
      socket.to(`user:${to}`).emit('callAnswered', { 
        from: (socket.data as any).user?._id, 
        signal 
      });
    });

    // Call end
    socket.on('endCall', ({ to }) => {
      socket.to(`user:${to}`).emit('callEnded');
    });

    // ICE candidate exchange
    socket.on('iceCandidate', ({ to, candidate }) => {
      socket.to(`user:${to}`).emit('iceCandidate', { 
        from: (socket.data as any).user?._id, 
        candidate 
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      socket.broadcast.emit('callEnded');
    });
  });
};
