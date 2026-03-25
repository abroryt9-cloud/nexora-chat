# 🚀 Nexora - Enterprise Messenger Platform

**Nexora** is a modern, feature-rich messenger platform with crypto wallet integration, NFT support, AI assistant, and real-time communication capabilities.

![Nexora Banner](https://img.shields.io/badge/Nexora-Messenger-purple?style=for-the-badge)

---

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Email, username, and password-based authentication
- **JWT Tokens** - Secure session management with access and refresh tokens
- **2FA (Two-Factor Authentication)** - Google Authenticator integration
- **Role-Based Access Control** - User, Moderator, Admin, Superadmin roles
- **Email Verification** - Automated verification emails

### 💬 Chat System
- **Personal Chats** - One-on-one private messaging
- **Group Chats** - Multi-user group conversations
- **Chat Search** - Find conversations quickly
- **Archive & Mute** - Organize and silence chats
- **Typing Indicators** - Real-time typing status
- **Online Status** - See who's online

### 📨 Messages
- **Text Messages** - Rich text messaging
- **Edit & Delete** - Modify or remove sent messages
- **Reply to Messages** - Threaded conversations
- **Reactions** - Emoji reactions (👍❤️😂😮😢🔥)
- **Message Search** - Search through conversation history
- **Read Receipts** - Track message delivery

### 🎨 Media & Content
- **Stickers** - 5 categories with 40+ stickers (happy, funny, love, cool, animals)
- **GIF Support** - Tenor API integration for animated GIFs
- **Voice Messages** - Record and send audio messages using MediaRecorder API
- **Emoji Picker** - Full emoji support
- **Image Uploads** - Share images and photos

### 🎯 Advanced Features
- **Polls** - Create polls with voting and real-time results
- **Scheduled Messages** - Plan messages for future delivery
- **AI Assistant** - DeepSeek/Gemini AI integration for smart responses
- **Push Notifications** - Real-time notifications system

### 👤 User Profile
- **Avatar Upload** - Custom profile pictures
- **Theme Selection** - 4 themes (Dark, Light, Cosmic, Aurora)
- **Language Support** - 60+ languages including Asian languages
- **User Statistics** - Track your messaging activity
- **Achievements** - Unlock badges and milestones

### 💰 Crypto Wallet
- **NXR Token Balance** - Built-in cryptocurrency wallet
- **Send/Receive Tokens** - Transfer NXR to other users
- **Transaction History** - Complete transaction log
- **CoinGecko Integration** - Real-time price tracking
- **Wallet Address** - Unique address for each user

### 🖼️ NFT Gallery
- **NFT Collection** - Display your NFT cards (3+ default)
- **Buy/Sell NFTs** - Marketplace functionality
- **User Gallery** - Personal NFT showcase
- **NFT Metadata** - Detailed NFT information

### 🔧 Admin Panel
- **User Management** - View, edit, and manage users
- **Reports Dashboard** - Review user reports and violations
- **Analytics** - Platform statistics and insights
- **System Logs** - Monitor system activity
- **Content Moderation** - Manage reported content

### ⚡ Real-Time Features
- **WebSocket** - Instant message delivery via Socket.io
- **Typing Indicators** - See when others are typing
- **Online Status** - Real-time presence updates
- **Video/Voice Calls** - WebRTC-based calling (in development)

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **TailwindCSS** - Utility-first CSS framework
- **Socket.io-client** - WebSocket client
- **React Router** - Navigation
- **i18next** - Internationalization
- **Emoji Picker React** - Emoji support

### Backend
- **Node.js 18** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Redis** - Caching and session storage
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Shared
- **TypeScript** - Shared types and interfaces
- **Utilities** - Common helper functions
- **Constants** - Shared constants and configurations

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **Render** - Cloud hosting platform

---

## 📦 Project Structure

```
nexora-chat/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth/      # Login, Register, 2FA
│   │   │   ├── Chat/      # Chat UI components
│   │   │   ├── Common/    # Reusable components
│   │   │   ├── Layout/    # Layout components
│   │   │   └── Profile/   # User profile components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── locales/       # i18n translations
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── styles/        # CSS and themes
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.io handlers
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── app.ts         # Application entry
│   └── package.json
├── admin/                 # Admin panel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── shared/                # Shared code
│   ├── constants/         # Shared constants
│   ├── types/             # TypeScript types
│   ├── utils/             # Shared utilities
│   └── package.json
├── docker/                # Docker configurations
├── scripts/               # Utility scripts
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud instance)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nexora-chat.git
cd nexora-chat
```

### 2. Install Dependencies

Install all dependencies for root, shared, server, client, and admin:

```bash
npm run install:all
```

Or install manually:

```bash
# Root
npm install

# Shared
cd shared
npm install
npm run build
cd ..

# Server
cd server
npm install
cd ..

# Client
cd client
npm install
cd ..

# Admin
cd admin
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_change_this
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# API Keys
COINGECKO_API_KEY=your_coingecko_api_key
TENOR_API_KEY=your_tenor_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Client Configuration
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 4. Start MongoDB and Redis

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d mongodb redis
```

#### Option B: Local Installation

**MongoDB:**
```bash
# Windows (if installed as service)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Redis:**
```bash
# Windows (download and run redis-server.exe)
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

### 5. Run the Application

#### Development Mode

Run all services (server, client, admin) concurrently:

```bash
npm run dev
```

Or run each service separately in different terminals:

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client

# Terminal 3 - Admin (optional)
npm run dev:admin
```

#### Production Build

Build all services:

```bash
npm run build
```

Start production server:

```bash
npm start
```

### 6. Access the Application

- **Client (Frontend):** http://localhost:5173
- **Server (API):** http://localhost:5000
- **Admin Panel:** http://localhost:5174 (if running)

---

## 📱 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Verify 2FA
```http
POST /api/v1/auth/verify-2fa
Content-Type: application/json

{
  "tempToken": "temp_jwt_token",
  "code": "123456"
}
```

### Chat Endpoints

#### Get All Chats
```http
GET /api/v1/chats
Authorization: Bearer <token>
```

#### Create Chat
```http
POST /api/v1/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "private",
  "participantId": "user_id_here"
}
```

#### Get Messages
```http
GET /api/v1/chats/:chatId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/v1/chats/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id_here",
  "content": "Hello, World!",
  "type": "text"
}
```

#### Add Reaction
```http
POST /api/v1/chats/messages/:messageId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/v1/wallet/balance
Authorization: Bearer <token>
```

#### Send Tokens
```http
POST /api/v1/wallet/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "recipient_wallet_address",
  "amount": 100
}
```

---

## 🎨 Themes

Nexora includes 4 beautiful themes:

1. **Dark** - Default dark theme with purple accents
2. **Light** - Clean light theme for daytime use
3. **Cosmic** - Space-inspired theme with stars and gradients
4. **Aurora** - Northern lights inspired theme with green/purple gradients

Change themes in user profile settings or via the theme selector.

---

## 🌍 Supported Languages

Nexora supports 60+ languages including:

- English, Russian, Spanish, Chinese, Japanese, Korean
- Arabic, Hindi, Thai, Vietnamese, Indonesian
- French, German, Italian, Portuguese, Turkish
- And many more...

---

## 🧪 Testing

Run tests (when implemented):

```bash
npm test
```

---

## 📦 Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up --build
```

Access services:
- **Client:** http://localhost:3000
- **Admin:** http://localhost:3001
- **Server:** http://localhost:5000

---

## 🔑 Default Admin Account

After first run, create an admin user via the database or registration:

```javascript
// In MongoDB shell
use nexora
db.users.updateOne(
  { email: "admin@nexora.com" },
  { $set: { role: "admin" } }
)
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
# Docker
docker-compose up -d mongodb

# Or local
mongod --dbpath /data/db
```

**2. Redis Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Start Redis:
```bash
# Docker
docker-compose up -d redis

# Or local
redis-server
```

**3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the port in `.env`:
```env
PORT=5001
```

**4. WebSocket Connection Failed**
```
WebSocket connection failed
```
**Solution:** 
- Check VITE_WS_URL in client `.env`
- Ensure server is running
- Check CORS settings

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **DeepSeek** - AI assistant integration
- **CoinGecko** - Cryptocurrency price data
- **Tenor** - GIF API
- **MongoDB** - Database
- **Socket.io** - Real-time communication

---

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Email: support@nexora.chat
- Discord: [Join our server](#)

---

## 🚀 Roadmap

- [ ] End-to-end encryption
- [ ] Video calls (WebRTC)
- [ ] Screen sharing
- [ ] Message forwarding
- [ ] Chat bots
- [ ] Custom sticker packs
- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)

---

**Built with ❤️ by the Nexora Team**
