import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import apiRoutes from './routes';
import { registerSockets } from './sockets';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'nexora-server' }));
app.use('/api/v1', apiRoutes);

registerSockets(io);

const port = Number(process.env.PORT || 5000);
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('Nexora server started on :' + port);
  });
}

export default app;
