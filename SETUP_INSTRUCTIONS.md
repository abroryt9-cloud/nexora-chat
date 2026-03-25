# 🚀 NEXORA - COMPLETE SETUP GUIDE

## Project Overview

Nexora is a modern messenger with cosmic glass design featuring:
- ✨ Cosmic glassmorphism UI (like latest Telegram)
- 💬 Real-time chat with WebSocket
- 🔐 Demo authentication (any phone/code works)
- 💰 Crypto wallet with NXR tokens
- 🖼️ NFT gallery
- 🎨 Stickers, GIFs, voice messages, polls
- 🌍 60+ languages
- 🌓 4 themes (Dark, Light, Cosmic, Aurora)

---

## 📁 PROJECT STRUCTURE

```
nexora-chat/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/         # Login, Register, 2FA, Splash
│   │   │   ├── Chat/         # Chat UI components
│   │   │   ├── Common/       # Reusable components (GlassCard, etc.)
│   │   │   ├── Layout/       # Navigation, Sidebar, Header
│   │   │   └── Profile/      # Wallet, NFT, Avatar
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── store/            # Redux state management
│   │   ├── styles/           # CSS themes
│   │   └── locales/          # i18n translations
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── sockets/          # WebSocket handlers
│   │   └── services/         # Business logic
│   ├── package.json
│   └── tsconfig.json
├── shared/                    # Shared types & constants
│   ├── types/
│   ├── constants/
│   └── utils/
├── docker-compose.yml
└── package.json
```

---

## ⚡ QUICK START (5 MINUTES)

### Step 1: Install Dependencies

```bash
# From project root
npm run install:all
```

This installs:
- Root dependencies
- Shared package (and builds it)
- Server dependencies
- Client dependencies
- Admin dependencies

### Step 2: Create .env File

Create `.env` in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB (use Docker or local)
MONGODB_URI=mongodb://localhost:27017/nexora

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=nexora_dev_secret_key_change_in_production_12345
JWT_REFRESH_SECRET=nexora_refresh_secret_change_in_production_67890
ENCRYPTION_KEY=nexora_encryption_key_32bytes!!

# API Keys (Optional - get free keys)
COINGECKO_API_KEY=
TENOR_API_KEY=
DEEPSEEK_API_KEY=
GEMINI_API_KEY=

# Email (Optional - for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Client Configuration
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### Step 3: Start MongoDB & Redis

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d mongodb redis
```

**Option B: Local Installation**

- MongoDB: https://www.mongodb.com/try/download/community
- Redis: https://redis.io/download

Then start them:
```bash
# MongoDB (Windows service)
net start MongoDB

# Redis
redis-server
```

### Step 4: Run Development Servers

```bash
# Start both server and client concurrently
npm run dev
```

Or separately in different terminals:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 5: Open in Browser

- **Client:** http://localhost:5173
- **Server API:** http://localhost:5000

---

## 🎨 DESIGN SYSTEM

### Cosmic Glass Theme

**Colors:**
- Background: `#0A0C12` (deep space black)
- Secondary: `#1A1D2D` (dark blue-grey)
- Glass: `rgba(17, 21, 31, 0.6)` with blur
- Accent Primary: `#6C5CE7` (purple)
- Accent Secondary: `#00D9FF` (cyan)
- Text: `#F0F3FA` (white-ish)
- Text Muted: `#8E9AAF` (grey)

**Border Radius:**
- App corners: `28px`
- Cards: `24px`
- Buttons: `20px`
- Small elements: `12px`

**Glass Effect:**
```css
background: rgba(17, 21, 31, 0.6);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 24px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

---

## 🔐 DEMO MODE

The app works in demo mode:

1. **Login:**
   - Enter any phone number
   - Click "Continue"
   - Enter any 6-digit code (e.g., `123456`)
   - You're logged in!

2. **Registration:**
   - Enter any username, email, password
   - Account is created instantly
   - JWT token stored in localStorage

3. **Features:**
   - All features work immediately
   - Messages are saved to MongoDB
   - Wallet starts with 1000 NXR
   - 3 NFTs are pre-assigned

---

## 📱 FEATURES TO TEST

### 1. Authentication Flow
- [ ] Splash screen animation
- [ ] Login with phone/code
- [ ] Register new account
- [ ] 2FA setup (optional)

### 2. Chat Interface
- [ ] View chat list
- [ ] Open individual chat
- [ ] Send text messages
- [ ] See messages in real-time (WebSocket)
- [ ] Message reactions (👍❤️😂😮😢🔥)
- [ ] Edit own messages
- [ ] Delete own messages

### 3. Media & Content
- [ ] Send stickers (5 categories)
- [ ] Send GIFs (Tenor integration)
- [ ] Record voice messages
- [ ] Create polls
- [ ] View emoji picker

### 4. Profile & Wallet
- [ ] View profile
- [ ] Upload avatar
- [ ] Check NXR balance (starts at 1000)
- [ ] View transaction history
- [ ] Send tokens to other users
- [ ] View NFT collection (3 NFTs)

### 5. Settings
- [ ] Change theme (Dark/Light/Cosmic/Aurora)
- [ ] Change language (60+ options)
- [ ] Enable/disable notifications
- [ ] Setup 2FA
- [ ] Logout

---

## 🛠️ DEVELOPMENT

### Build Commands

```bash
# Build all packages
npm run build

# Build individual packages
npm run build:shared
npm run build:client
npm run build:server

# Production start
npm start
```

### Hot Reload

- **Client:** Changes auto-reload (Vite HMR)
- **Server:** Auto-restarts with nodemon
- **Shared:** Rebuild with `npm run build:shared`

### TypeScript

The project uses strict TypeScript. Errors during development are normal until dependencies are installed.

---

## 🐳 DOCKER DEPLOYMENT

### Full Stack with Docker

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

**Services:**
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Server: `localhost:5000`
- Client: `localhost:3000`
- Admin: `localhost:3001`

---

## 📊 DATABASE SCHEMA

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  avatar: String (URL),
  role: 'user' | 'moderator' | 'admin',
  isOnline: Boolean,
  wallet: {
    address: String,
    balance: Number (NXR),
    transactions: Array
  },
  achievements: Array,
  statistics: {
    totalMessages: Number,
    totalChats: Number,
    reactionsGiven: Number
  }
}
```

### Message Model
```javascript
{
  chatId: ObjectId,
  senderId: ObjectId,
  content: String,
  type: 'text' | 'image' | 'sticker' | 'gif' | 'voice' | 'poll',
  mediaUrl: String,
  reactions: [{ userId, emoji }],
  replyTo: ObjectId,
  edited: Boolean,
  deleted: Boolean
}
```

### Chat Model
```javascript
{
  type: 'private' | 'group',
  participants: [ObjectId],
  name: String (for groups),
  avatar: String,
  lastMessage: ObjectId,
  isArchived: Boolean,
  isMuted: Boolean
}
```

---

## 🎯 API ENDPOINTS

### Authentication
```
POST   /api/v1/auth/register     - Register user
POST   /api/v1/auth/login        - Login
POST   /api/v1/auth/verify-2fa   - Verify 2FA code
POST   /api/v1/auth/setup-2fa    - Setup 2FA
```

### Chats
```
GET    /api/v1/chats             - Get all chats
POST   /api/v1/chats             - Create chat
GET    /api/v1/chats/:id/messages - Get messages
POST   /api/v1/chats/messages    - Send message
PUT    /api/v1/chats/messages/:id - Edit message
DELETE /api/v1/chats/messages/:id - Delete message
POST   /api/v1/chats/messages/:id/reactions - Add reaction
POST   /api/v1/chats/polls       - Create poll
POST   /api/v1/chats/schedule    - Schedule message
```

### Wallet
```
GET    /api/v1/wallet/balance    - Get balance
POST   /api/v1/wallet/send       - Send tokens
GET    /api/v1/wallet/transactions - Get transactions
```

### Users
```
GET    /api/v1/users             - Get all users
GET    /api/v1/users/:id         - Get user profile
PUT    /api/v1/users/:id         - Update profile
POST   /api/v1/users/avatar      - Upload avatar
```

---

## 🐛 TROUBLESHOOTING

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Start MongoDB in Docker
docker-compose up -d mongodb

# Or start local MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
```

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:**
```bash
# Start Redis
docker-compose up -d redis
# or
redis-server
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change port in `.env`:
```env
PORT=5001
```

### Module Not Found (@nexora/shared)
**Solution:**
```bash
cd shared
npm install
npm run build
cd ..
```

### TypeScript Errors
These are normal during development. Install dependencies:
```bash
npm run install:all
```

### WebSocket Connection Failed
**Solution:**
1. Check `VITE_WS_URL` in `.env`
2. Ensure server is running
3. Check browser console for errors

---

## 🎨 CUSTOMIZATION

### Change Theme Colors

Edit `client/src/styles/themes/cosmic.css`:

```css
[data-theme="cosmic"] {
  --accent-primary: #YOUR_COLOR;
  --accent-secondary: #YOUR_COLOR;
}
```

### Add New Language

1. Create `client/src/locales/xx.json`
2. Add translations from `en.json`
3. Import in `client/src/i18n.ts`
4. Add to supported languages list

### Add New Stickers

Edit `shared/constants/stickers.ts`:

```typescript
export const stickerCategories = [
  {
    id: 'new_category',
    name: 'Category Name',
    stickers: ['😀', '😁', '😂', ...]
  }
];
```

---

## 📦 PRODUCTION BUILD

### Build for Production

```bash
# Build all
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

**REQUIRED:**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexora
JWT_SECRET=STRONG_RANDOM_SECRET_32_CHARS
JWT_REFRESH_SECRET=ANOTHER_STRONG_SECRET
ENCRYPTION_KEY=32_BYTE_ENCRYPTION_KEY
CLIENT_URL=https://your-domain.com
```

### Deploy to Render/Heroku

1. Push to Git repository
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy!

---

## 🆘 SUPPORT

### Documentation
- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [API_DOCS.md](./API_DOCS.md) - API reference

### Get Help
- Check server logs in terminal
- Open browser DevTools (F12)
- Check MongoDB connection
- Verify environment variables

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Dependencies installed (`npm run install:all` completed)
- [ ] MongoDB running (Docker or local)
- [ ] Redis running (Docker or local)
- [ ] `.env` file created with all variables
- [ ] Server starts without errors
- [ ] Client opens in browser
- [ ] Can register new account
- [ ] Can login with phone/code
- [ ] Can send messages
- [ ] WebSocket connected (check browser console)
- [ ] Wallet shows 1000 NXR
- [ ] NFT gallery displays 3 NFTs
- [ ] Theme switching works
- [ ] Language selector shows 60+ languages

---

## 🎉 SUCCESS!

You now have a fully functional cosmic messenger with:
- ✨ Beautiful glassmorphism design
- 💬 Real-time chat
- 💰 Crypto wallet
- 🖼️ NFT gallery
- 🌍 Multi-language support
- 🌓 Multiple themes

**Enjoy Nexora! 🚀**

---

**Built with ❤️ using React, Node.js, MongoDB, and Socket.io**
