export const socketConfig = {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
};
