const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const write = (relativePath, content) => {
  const filePath = path.join(root, relativePath);
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
};

const reactComponent = (name) => `import React from 'react';

export const ${name} = (): JSX.Element => {
  return <div className="glass-card">${name}</div>;
};

export default ${name};
`;

const hookTemplate = (name) => `export const ${name} = () => ({});

export default ${name};
`;

const serviceTemplate = (name) => `import { apiClient } from './api';

export const ${name} = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default ${name};
`;

const clientComponents = [
  ['Auth/LoginForm.tsx', 'LoginForm'],
  ['Auth/RegisterForm.tsx', 'RegisterForm'],
  ['Auth/TwoFactorAuth.tsx', 'TwoFactorAuth'],
  ['Auth/RecoveryCodes.tsx', 'RecoveryCodes'],
  ['Chat/ChatList.tsx', 'ChatList'],
  ['Chat/ChatWindow.tsx', 'ChatWindow'],
  ['Chat/MessageBubble.tsx', 'MessageBubble'],
  ['Chat/MessageInput.tsx', 'MessageInput'],
  ['Chat/Reactions.tsx', 'Reactions'],
  ['Chat/ReplyPreview.tsx', 'ReplyPreview'],
  ['Chat/PinnedMessage.tsx', 'PinnedMessage'],
  ['Chat/ScheduledMessages.tsx', 'ScheduledMessages'],
  ['Chat/DisappearingMessages.tsx', 'DisappearingMessages'],
  ['Chat/LinkPreview.tsx', 'LinkPreview'],
  ['Chat/VoiceRecorder.tsx', 'VoiceRecorder'],
  ['Stickers/StickerPicker.tsx', 'StickerPicker'],
  ['Stickers/StickerPack.tsx', 'StickerPack'],
  ['Stickers/StickerUploader.tsx', 'StickerUploader'],
  ['Stickers/AnimatedSticker.tsx', 'AnimatedSticker'],
  ['Gif/GifPicker.tsx', 'GifPicker'],
  ['Gif/GifSearch.tsx', 'GifSearch'],
  ['Poll/PollCreator.tsx', 'PollCreator'],
  ['Poll/PollVote.tsx', 'PollVote'],
  ['Poll/PollResults.tsx', 'PollResults'],
  ['Status/StatusList.tsx', 'StatusList'],
  ['Status/StatusViewer.tsx', 'StatusViewer'],
  ['Status/StatusCreator.tsx', 'StatusCreator'],
  ['Status/StatusReactions.tsx', 'StatusReactions'],
  ['Channel/ChannelList.tsx', 'ChannelList'],
  ['Channel/ChannelWindow.tsx', 'ChannelWindow'],
  ['Channel/ChannelPost.tsx', 'ChannelPost'],
  ['Channel/ChannelSettings.tsx', 'ChannelSettings'],
  ['Bot/BotList.tsx', 'BotList'],
  ['Bot/BotChat.tsx', 'BotChat'],
  ['Bot/BotAPIKeys.tsx', 'BotAPIKeys'],
  ['Call/VoiceCall.tsx', 'VoiceCall'],
  ['Call/VideoCall.tsx', 'VideoCall'],
  ['Call/GroupCall.tsx', 'GroupCall'],
  ['Call/CallControls.tsx', 'CallControls'],
  ['Profile/ProfilePanel.tsx', 'ProfilePanel'],
  ['Profile/AvatarUploader.tsx', 'AvatarUploader'],
  ['Profile/Wallet.tsx', 'Wallet'],
  ['Profile/WalletHistory.tsx', 'WalletHistory'],
  ['Profile/ReferralSystem.tsx', 'ReferralSystem'],
  ['Profile/Achievements.tsx', 'Achievements'],
  ['Profile/Statistics.tsx', 'Statistics'],
  ['Profile/PrivacySettings.tsx', 'PrivacySettings'],
  ['Profile/SavedMessages.tsx', 'SavedMessages'],
  ['Settings/Settings.tsx', 'Settings'],
  ['Settings/ThemeSelector.tsx', 'ThemeSelector'],
  ['Settings/LanguageSelector.tsx', 'LanguageSelector'],
  ['Settings/NotificationSettings.tsx', 'NotificationSettings'],
  ['Settings/ChatSettings.tsx', 'ChatSettings'],
  ['Folder/FolderList.tsx', 'FolderList'],
  ['Folder/FolderCreator.tsx', 'FolderCreator'],
  ['Folder/FolderChat.tsx', 'FolderChat'],
  ['Common/Modal.tsx', 'Modal'],
  ['Common/Loader.tsx', 'Loader'],
  ['Common/Notification.tsx', 'Notification'],
  ['Common/GlassCard.tsx', 'GlassCard'],
  ['Common/CosmicBackground.tsx', 'CosmicBackground'],
  ['Common/StarsAnimation.tsx', 'StarsAnimation'],
  ['Common/FloatingParticles.tsx', 'FloatingParticles'],
  ['Layout/Sidebar.tsx', 'Sidebar'],
  ['Layout/Header.tsx', 'Header'],
  ['Layout/BottomNav.tsx', 'BottomNav'],
  ['Layout/MobileMenu.tsx', 'MobileMenu'],
  ['Layout/CosmicMenu.tsx', 'CosmicMenu'],
  ['Admin/Dashboard.tsx', 'Dashboard'],
  ['Admin/Users.tsx', 'Users'],
  ['Admin/Reports.tsx', 'Reports'],
  ['Admin/Channels.tsx', 'Channels'],
  ['Admin/Bots.tsx', 'Bots'],
  ['Admin/Analytics.tsx', 'Analytics'],
  ['Admin/SystemLogs.tsx', 'SystemLogs'],
];

clientComponents.forEach(([rel, name]) => {
  write(`client/src/components/${rel}`, reactComponent(name));
});

[
  'useAuth',
  'useChat',
  'useWebSocket',
  'useWallet',
  'useTheme',
  'useLanguage',
  'useNotifications',
  'useFolder',
  'useStatus',
  'useChannel',
  'useBot',
  'useCall',
  'useStickerPack',
  'useAI',
].forEach((h) => write(`client/src/hooks/${h}.ts`, hookTemplate(h)));

[
  'authService',
  'chatService',
  'walletService',
  'stickerService',
  'gifService',
  'statusService',
  'channelService',
  'botService',
  'callService',
  'folderService',
  'aiService',
  'adminService',
].forEach((service) => write(`client/src/services/${service}.ts`, serviceTemplate(service)));

[
  'authSlice',
  'chatSlice',
  'walletSlice',
  'themeSlice',
  'folderSlice',
  'statusSlice',
  'channelSlice',
  'botSlice',
  'callSlice',
].forEach((slice) => {
  write(
    `client/src/store/${slice}.ts`,
    `import { createSlice } from '@reduxjs/toolkit';

const ${slice.replace(/\.ts$/, '')} = createSlice({
  name: '${slice.replace('Slice', '')}',
  initialState: {},
  reducers: {},
});

export default ${slice.replace(/\.ts$/, '')}.reducer;
`,
  );
});

write(
  'client/src/services/api.ts',
  `import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});
`,
);

write(
  'client/src/store/index.ts',
  `import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import chat from './chatSlice';
import wallet from './walletSlice';
import theme from './themeSlice';
import folder from './folderSlice';
import status from './statusSlice';
import channel from './channelSlice';
import bot from './botSlice';
import call from './callSlice';

export const store = configureStore({
  reducer: { auth, chat, wallet, theme, folder, status, channel, bot, call },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`,
);

write(
  'client/src/routes.tsx',
  `import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([{ path: '/', element: <App /> }]);
`,
);

write(
  'client/src/main.tsx',
  `import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './routes';
import './styles/globals.css';
import './styles/animations.css';
import './styles/cosmic-effects.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
`,
);

write('client/src/index.tsx', `import './main';\n`);

write(
  'client/src/App.tsx',
  `import React from 'react';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import Sidebar from './components/Layout/Sidebar';

const App = (): JSX.Element => {
  return (
    <div className="app-shell cosmic-theme">
      <Sidebar />
      <main className="main-content">
        <ChatList />
        <ChatWindow />
      </main>
    </div>
  );
};

export default App;
`,
);

write(
  'client/src/styles/globals.css',
  `:root{color-scheme:dark light;}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#0b1020;color:#ecf2ff}.app-shell{display:grid;grid-template-columns:280px 1fr;min-height:100vh}.main-content{padding:16px;display:grid;grid-template-columns:320px 1fr;gap:16px}.glass-card{background:rgba(255,255,255,.08);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:16px}`,
);

write(
  'client/src/styles/animations.css',
  `@keyframes fadeIn{from{opacity:0}to{opacity:1}}.fade-in{animation:fadeIn .2s ease-out}`,
);

write(
  'client/src/styles/cosmic-effects.css',
  `.cosmic-theme{background:radial-gradient(circle at top,#1c2757 0,#0a0f1f 50%,#060a14 100%)}`,
);

['dark', 'light', 'cosmic', 'aurora', 'nebula', 'galaxy'].forEach((theme) => {
  write(`client/src/styles/themes/${theme}.css`, `:root[data-theme="${theme}"]{}`);
});

[
  'authController',
  'chatController',
  'messageController',
  'userController',
  'walletController',
  'stickerController',
  'statusController',
  'channelController',
  'botController',
  'callController',
  'folderController',
  'aiController',
  'adminController',
  'webhookController',
].forEach((c) => {
  write(
    `server/src/controllers/${c}.ts`,
    `import { Request, Response } from 'express';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: '${c}' });
};
`,
  );
});

[
  'User',
  'Chat',
  'Message',
  'Reaction',
  'Wallet',
  'Transaction',
  'StickerPack',
  'Sticker',
  'Status',
  'StatusReaction',
  'Channel',
  'ChannelPost',
  'Bot',
  'BotSession',
  'Folder',
  'ScheduledMessage',
  'Poll',
  'Report',
  'Achievement',
  'Call',
  'SystemLog',
].forEach((m) => write(`server/src/models/${m}.ts`, `export interface ${m} { id: string }\n`));

['auth', 'rateLimiter', 'validation', 'errorHandler', 'roleCheck', 'botAuth'].forEach((m) => {
  write(
    `server/src/middleware/${m}.ts`,
    `import { Request, Response, NextFunction } from 'express';

export const ${m} = (_req: Request, _res: Response, next: NextFunction): void => next();
`,
  );
});

[
  'auth',
  'chat',
  'message',
  'user',
  'wallet',
  'sticker',
  'status',
  'channel',
  'bot',
  'call',
  'folder',
  'ai',
  'admin',
  'webhook',
].forEach((route) => {
  write(
    `server/src/routes/v1/${route}Routes.ts`,
    `import { Router } from 'express';
import { health } from '../../controllers/${route}Controller';

const router = Router();
router.get('/', health);

export default router;
`,
  );
});

write(
  'server/src/routes/index.ts',
  `import { Router } from 'express';
import authRoutes from './v1/authRoutes';
import chatRoutes from './v1/chatRoutes';
import messageRoutes from './v1/messageRoutes';
import userRoutes from './v1/userRoutes';
import walletRoutes from './v1/walletRoutes';
import stickerRoutes from './v1/stickerRoutes';
import statusRoutes from './v1/statusRoutes';
import channelRoutes from './v1/channelRoutes';
import botRoutes from './v1/botRoutes';
import callRoutes from './v1/callRoutes';
import folderRoutes from './v1/folderRoutes';
import aiRoutes from './v1/aiRoutes';
import adminRoutes from './v1/adminRoutes';
import webhookRoutes from './v1/webhookRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/stickers', stickerRoutes);
router.use('/status', statusRoutes);
router.use('/channels', channelRoutes);
router.use('/bots', botRoutes);
router.use('/calls', callRoutes);
router.use('/folders', folderRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
`,
);

['chatSocket', 'typingSocket', 'callSocket', 'statusSocket'].forEach((socketName) => {
  const fn = `register${socketName.charAt(0).toUpperCase()}${socketName.slice(1)}`;
  write(
    `server/src/sockets/${socketName}.ts`,
    `import { Server } from 'socket.io';

export const ${fn} = (_io: Server): void => {};
`,
  );
});

write(
  'server/src/sockets/index.ts',
  `import { Server } from 'socket.io';
import { registerChatSocket } from './chatSocket';
import { registerTypingSocket } from './typingSocket';
import { registerCallSocket } from './callSocket';
import { registerStatusSocket } from './statusSocket';

export const registerSockets = (io: Server): void => {
  registerChatSocket(io);
  registerTypingSocket(io);
  registerCallSocket(io);
  registerStatusSocket(io);
};
`,
);

[
  'authService',
  'encryptionService',
  'notificationService',
  'aiService',
  'walletService',
  'blockchainService',
  'stickerService',
  'statusService',
  'channelService',
  'botService',
  'callService',
  'webrtcService',
  'emailService',
  'analyticsService',
  'backupService',
].forEach((service) => write(`server/src/services/${service}.ts`, `export const ${service} = {};\n`));

['logger', 'jwt', 'hash', 'validators', 'constants', 'webrtc-helpers', 'openGraph'].forEach((u) => {
  write(`server/src/utils/${u}.ts`, `export const ${u.replace(/-/g, '_')} = {};\n`);
});

['database', 'redis', 'socket', 'webrtc', 'index'].forEach((c) => {
  write(`server/src/config/${c}.ts`, `export const ${c}Config = {};\n`);
});

['scheduledMessages', 'disappearingMessages', 'statusCleanup', 'backupWorker'].forEach((worker) => {
  write(
    `server/src/workers/${worker}.ts`,
    `export const run${worker.charAt(0).toUpperCase()}${worker.slice(1)} = async (): Promise<void> => {};
`,
  );
});

write(
  'server/src/types/express.d.ts',
  `declare namespace Express {
  interface Request {
    userId?: string;
    role?: string;
  }
}
`,
);

write('server/src/types/socket.d.ts', `export interface SocketUser { id: string }\n`);
write('server/src/types/webrtc.d.ts', `export interface WebRTCSignal { type: string; payload: unknown }\n`);

write(
  'server/src/app.ts',
  `import 'dotenv/config';
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
`,
);

write(
  'server/server.js',
  `require('ts-node/register');
require('./src/app');
`,
);

[
  'user',
  'chat',
  'message',
  'wallet',
  'sticker',
  'status',
  'channel',
  'bot',
  'call',
  'folder',
  'api',
  'socket',
].forEach((type) => {
  write(
    `shared/types/${type}.ts`,
    `export type ${type.charAt(0).toUpperCase()}${type.slice(1)} = Record<string, unknown>;
`,
  );
});

['languages', 'stickers', 'gifs', 'achievements', 'themes'].forEach((c) => {
  write(`shared/constants/${c}.ts`, `export const ${c.toUpperCase()} = [];\n`);
});

['encryption', 'formatters', 'validators'].forEach((u) => {
  write(`shared/utils/${u}.ts`, `export const ${u} = {};\n`);
});

write(
  'shared/index.ts',
  `export * from './types/user';
export * from './types/chat';
export * from './types/message';
export * from './types/wallet';
export * from './types/sticker';
export * from './types/status';
export * from './types/channel';
export * from './types/bot';
export * from './types/call';
export * from './types/folder';
export * from './types/api';
export * from './types/socket';
`,
);

['Dashboard', 'Users', 'Reports', 'Chats', 'Channels', 'Bots', 'Analytics', 'Settings', 'SystemLogs'].forEach((page) => {
  write(`admin/src/pages/${page}.tsx`, reactComponent(page));
});

['Sidebar', 'Header', 'StatsCard', 'Charts', 'DataTable'].forEach((component) => {
  write(`admin/src/components/${component}.tsx`, reactComponent(component));
});

write(
  'admin/src/services/adminApi.ts',
  `import axios from 'axios';

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5000/api/v1/admin',
});
`,
);

write(
  'admin/src/store/adminSlice.ts',
  `import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {},
  reducers: {},
});

export default adminSlice.reducer;
`,
);

write(
  'admin/src/index.tsx',
  `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
);

write(
  'admin/src/App.tsx',
  `import React from 'react';
import Dashboard from './pages/Dashboard';

const App = (): JSX.Element => <Dashboard />;

export default App;
`,
);

write(
  'admin/tsconfig.json',
  `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
`,
);

write(
  'admin/index.html',
  `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexora Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`,
);

write(
  'docker/Dockerfile.server',
  `FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install
COPY server .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
`,
);

write(
  'docker/Dockerfile.worker',
  `FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server .
CMD ["node", "dist/workers/statusCleanup.js"]
`,
);

write(
  'docker-compose.prod.yml',
  `version: '3.8'
services:
  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    ports:
      - "5000:5000"
`,
);

write('scripts/migrate.ts', `console.log('Migrations are up to date.');\n`);
write('LICENSE', 'MIT License\n');
write('client/public/favicon.ico', '');
