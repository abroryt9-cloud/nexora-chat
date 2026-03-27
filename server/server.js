const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Раздача статики
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/dist')));

// API маршруты
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ВСЕ остальные GET запросы — отдаём React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

// In-memory storage
const users = new Map();
const chats = new Map();
const messages = new Map();

// Helper: send to user
function sendToUser(userId, data) {
  const user = users.get(userId);
  if (user?.ws?.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify(data));
  }
}

// Broadcast to chat
function broadcastToChat(chatId, data, excludeUserId = null) {
  const chat = chats.get(chatId);
  if (!chat) return;
  chat.participants.forEach(pid => {
    if (pid !== excludeUserId) sendToUser(pid, data);
  });
}

// Generate ID
function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 6);
}

// Initialize demo data
function initData() {
  // Demo users
  const demoUsers = [
    { id: 'alex', name: 'Алексей', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', status: 'online', ws: null, lastActive: Date.now() },
    { id: 'maria', name: 'Мария', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', status: 'online', ws: null, lastActive: Date.now() },
    { id: 'dmitry', name: 'Дмитрий', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry', status: 'away', ws: null, lastActive: Date.now() },
    { id: 'elena', name: 'Елена', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', status: 'online', ws: null, lastActive: Date.now() }
  ];
  demoUsers.forEach(u => users.set(u.id, u));

  // Demo chats
  const demoChats = [
    { id: 'chat1', name: 'Алексей', type: 'personal', participants: ['current', 'alex'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 'chat2', name: 'Dev Team', type: 'group', participants: ['current', 'alex', 'maria', 'dmitry'], avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=dev' },
    { id: 'chat3', name: 'Дизайн-студия', type: 'group', participants: ['current', 'maria', 'elena'], avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=design' },
    { id: 'chat4', name: 'Мария', type: 'personal', participants: ['current', 'maria'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' }
  ];
  demoChats.forEach(c => {
    chats.set(c.id, c);
    messages.set(c.id, []);
  });

  // Sample messages
  const sampleMessages = [
    { id: genId(), text: 'Привет! Добро пожаловать в Nexora! 🎉', senderId: 'alex', senderName: 'Алексей', time: Date.now() - 3600000, reactions: [] },
    { id: genId(), text: 'Крутой мессенджер, много функций!', senderId: 'maria', senderName: 'Мария', time: Date.now() - 3500000, reactions: ['👍'] },
    { id: genId(), text: '🔥', senderId: 'dmitry', senderName: 'Дмитрий', time: Date.now() - 3400000, reactions: [] }
  ];
  messages.get('chat1')?.push(...sampleMessages);
}
initData();

// WebSocket
wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      switch (data.type) {
        case 'auth':
          userId = data.userId;
          const user = users.get(userId);
          if (user) {
            user.ws = ws;
            user.status = 'online';
            user.lastActive = Date.now();
            ws.send(JSON.stringify({ type: 'auth_ok', data: { userId, name: user.name, avatar: user.avatar, bio: user.bio || '' } }));
          }
          break;
        case 'get_messages':
          const msgs = messages.get(data.chatId) || [];
          ws.send(JSON.stringify({ type: 'messages', data: { chatId: data.chatId, messages: msgs } }));
          break;
        case 'new_message':
          const { chatId, text, senderId, senderName, isSticker, isGif, gifUrl, isVoice, voiceUrl, isPoll, pollData } = data;
          const msg = {
            id: genId(),
            text: isGif ? gifUrl : text,
            senderId,
            senderName,
            time: Date.now(),
            reactions: [],
            isSticker: isSticker || false,
            isGif: isGif || false,
            gifUrl: gifUrl || null,
            isVoice: isVoice || false,
            voiceUrl: voiceUrl || null,
            isPoll: isPoll || false,
            pollData: pollData || null
          };
          if (!messages.has(chatId)) messages.set(chatId, []);
          messages.get(chatId).push(msg);
          broadcastToChat(chatId, { type: 'new_message', data: { ...msg, chatId } }, senderId);
          break;
        case 'add_reaction':
          const { messageId, emoji, userId: reactorId } = data;
          const chatMessages = messages.get(data.chatId);
          const target = chatMessages?.find(m => m.id === messageId);
          if (target && !target.reactions.includes(emoji)) {
            target.reactions.push(emoji);
            broadcastToChat(data.chatId, { type: 'reaction_added', data: { messageId, emoji, userId: reactorId } });
          }
          break;
        case 'typing':
          broadcastToChat(data.chatId, { type: 'typing', data: { userId: data.userId, isTyping: data.isTyping } }, data.userId);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on('close', () => {
    if (userId) {
      const u = users.get(userId);
      if (u) u.status = 'offline';
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Nexora Ultimate запущен на порту ${PORT}`);
  console.log(`WebSocket активен`);
});
