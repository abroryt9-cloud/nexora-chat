// Для голосовых/видеозвонков (WebRTC)
export const setupCallHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('callUser', ({ to, signal }) => {
      io.to(`user:${to}`).emit('incomingCall', { from: socket.data.user._id, signal });
    });
    socket.on('answerCall', ({ to, signal }) => {
      io.to(`user:${to}`).emit('callAnswered', { from: socket.data.user._id, signal });
    });
    socket.on('endCall', ({ to }) => {
      io.to(`user:${to}`).emit('callEnded');
    });
  });
};
