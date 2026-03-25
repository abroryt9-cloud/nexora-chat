# 🚀 Nexora - Quick Start Guide

Get Nexora up and running in 5 minutes!

---

## ⚡ Fast Setup (Development)

### Step 1: Install Dependencies

```bash
# Install all dependencies at once
npm run install:all
```

### Step 2: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Or create manually (Windows)
copy .env.example .env
```

### Step 3: Start MongoDB and Redis

**Using Docker (Recommended):**
```bash
docker-compose up -d mongodb redis
```

**Without Docker:**
- Install MongoDB: https://www.mongodb.com/try/download/community
- Install Redis: https://redis.io/download
- Both will run on default ports (27017 and 6379)

### Step 4: Run Development Servers

```bash
# Start all services (server + client + admin)
npm run dev
```

Or run separately in different terminals:
```bash
# Terminal 1 - Backend Server
npm run dev:server

# Terminal 2 - Frontend Client  
npm run dev:client

# Terminal 3 - Admin Panel (optional)
npm run dev:admin
```

### Step 5: Open Your Browser

- **Client:** http://localhost:5173
- **Server API:** http://localhost:5000
- **Admin:** http://localhost:5174

---

## 🐳 Docker Setup (Full Stack)

Run everything in Docker:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d
```

Access services:
- **Client:** http://localhost:3000
- **Admin:** http://localhost:3001
- **Server:** http://localhost:5000

Stop services:
```bash
docker-compose down
```

---

## 🛠️ Manual Setup (Step by Step)

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Build Shared Package
```bash
cd shared
npm install
npm run build
cd ..
```

### 3. Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Install Client Dependencies
```bash
cd client
npm install
cd ..
```

### 5. Install Admin Dependencies (Optional)
```bash
cd admin
npm install
cd ..
```

### 6. Configure Environment
Create `.env` file in root directory:

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# API Keys (get free keys)
COINGECKO_API_KEY=
TENOR_API_KEY=
DEEPSEEK_API_KEY=
GEMINI_API_KEY=

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Client
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 7. Start Services

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

**Terminal 3 - Admin (Optional):**
```bash
cd admin
npm run dev
```

---

## 📝 Get API Keys (Optional)

### CoinGecko (Crypto Prices)
1. Go to https://www.coingecko.com/api/pricing
2. Sign up for free API key
3. Add to `.env`: `COINGECKO_API_KEY=your_key`

### Tenor (GIFs)
1. Go to https://tenor.com/gifapi
2. Create project and get API key
3. Add to `.env`: `TENOR_API_KEY=your_key`

### DeepSeek (AI Assistant)
1. Go to https://platform.deepseek.com
2. Sign up and get API key
3. Add to `.env`: `DEEPSEEK_API_KEY=your_key`

### Gemini (AI Alternative)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key`

---

## ✅ Verify Installation

### Check Server
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Nexora API is running"
}
```

### Check Client
Open http://localhost:5173 in browser - you should see the Nexora login page.

### Check MongoDB Connection
```bash
# If using Docker
docker-compose ps

# Should show mongodb and redis as "running"
```

---

## 🧪 Create First User

### Option 1: Via UI
1. Open http://localhost:5173
2. Click "Register"
3. Fill in username, email, password
4. Click "Register"

### Option 2: Via API
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@nexora.com",
    "password": "admin123"
  }'
```

### Make User Admin (Optional)
```javascript
// In MongoDB shell
use nexora
db.users.updateOne(
  { email: "admin@nexora.com" },
  { $set: { role: "admin" } }
)
```

---

## 🐛 Troubleshooting

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
# Start Redis in Docker
docker-compose up -d redis

# Or start local Redis
redis-server
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
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
**Solution:**
```bash
# Rebuild all packages
npm run build
```

---

## 📱 Test Features

### 1. Register Account
- Go to http://localhost:5173
- Click "Register"
- Create account

### 2. Send Message
- Open chat
- Type message
- Press Enter or click Send

### 3. Add Reaction
- Hover over message
- Click reaction emoji

### 4. Send Sticker
- Click sticker icon
- Choose category
- Select sticker

### 5. Create Poll
- Click poll icon
- Enter question and options
- Submit

### 6. Check Wallet
- Go to Profile
- View NXR balance
- See transactions

---

## 🎯 Next Steps

1. **Customize Theme** - Go to Settings → Theme
2. **Change Language** - Settings → Language (60+ options)
3. **Enable 2FA** - Settings → Security → Enable 2FA
4. **Setup NFT Gallery** - Profile → NFTs
5. **Explore Admin Panel** - http://localhost:5174 (requires admin role)

---

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation including:
- Full API reference
- Architecture details
- Production deployment
- Configuration options
- Contributing guidelines

---

## 💡 Tips

- **Hot Reload:** Changes in client/src automatically refresh the browser
- **Server Logs:** Check terminal for server logs and errors
- **MongoDB GUI:** Use MongoDB Compass to browse database: `mongodb://localhost:27017/nexora`
- **Redis CLI:** `redis-cli` to inspect Redis data
- **API Testing:** Use Postman or Insomnia to test API endpoints

---

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed docs
- Open an issue on GitHub
- Check server logs in terminal
- Join our Discord community

---

**Happy Coding! 🎉**
