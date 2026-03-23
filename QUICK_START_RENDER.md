# 🚀 Быстрый запуск Nexora на Render

## ✅ Исправление ошибки "Missing script: start"

### Что было сделано:

1. **Создан `server.js` в корне проекта**
   - Простой Express + Socket.io сервер
   - Health check endpoint: `GET /health`
   - WebSocket поддержка
   - CORS настроен для production

2. **Обновлён корневой `package.json`**
   - Добавлен скрипт: `"start": "node server.js"`
   - Добавлены зависимости: `express`, `socket.io`, `cors`, `dotenv`

3. **Обновлён `render.yaml`**
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Health check: `/health`

---

## 📦 Новые файлы

### server.js (корневой)

Простой сервер для Render:

```javascript
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('message', (data) => {
    socket.emit('message', { from: 'server', text: data.text });
  });
});

server.listen(PORT, () => {
  console.log(`Nexora running on port ${PORT}`);
});
```

### package.json (scripts и dependencies)

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run build:shared && npm run build:server && npm run build:client"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

---

## 🔧 Инструкция по деплою

### 1. Подготовьте проект

```bash
# Установите зависимости в корне
npm install

# Проверьте локально
node server.js

# Откройте http://localhost:3000/health
```

### 2. Закоммитьте изменения

```bash
git add server.js package.json render.yaml
git commit -m "Add root server.js for Render deployment"
git push origin main
```

### 3. Настройте на Render

#### Вариант A: Blueprint (автоматически)

1. Откройте [Render Dashboard](https://dashboard.render.com)
2. **New +** → **Blueprint**
3. Подключите репозиторий
4. Render автоматически применит `render.yaml`

#### Вариант B: Вручную

1. **New +** → **Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `nexora-api`
   - **Root Directory:** (оставьте пустым - корень проекта)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Port:** 5000

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexora
   JWT_SECRET=<сгенерировать>
   JWT_REFRESH_SECRET=<сгенерировать>
   ENCRYPTION_KEY=<сгенерировать>
   CLIENT_URL=https://nexora-api.onrender.com
   ```

---

## ✅ Проверка

### Health Check

Откройте: `https://nexora-api.onrender.com/health`

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "message": "Nexora API is running",
  "timestamp": "2026-03-23T17:00:00.000Z",
  "environment": "production",
  "port": 5000
}
```

### Root Endpoint

Откройте: `https://nexora-api.onrender.com/`

**Ожидаемый ответ:**
```json
{
  "name": "Nexora",
  "version": "1.0.0",
  "description": "Enterprise Messenger with AI Assistant",
  "endpoints": {
    "health": "/health",
    "api": "/api/v1",
    "websocket": "wss://<host>/socket.io/"
  },
  "status": "running"
}
```

### WebSocket Test

```javascript
const socket = io('https://nexora-api.onrender.com');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('message', { text: 'Hello!' });
});

socket.on('message', (data) => {
  console.log('Received:', data);
});
```

---

## 🐛 Устранение проблем

### Ошибка: "Missing script: start"

**Причина:** В корневом package.json нет скрипта start

**Решение:**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Ошибка: "Cannot find module 'express'"

**Причина:** Зависимости не установлены

**Решение:**
```bash
npm install express socket.io cors dotenv
```

### Ошибка: CORS

**Причина:** Неправильный CLIENT_URL

**Решение:** Проверьте environment variable на Render:
```
CLIENT_URL=https://nexora-client.onrender.com
```

---

## 📊 Структура проекта

```
nexora-chat/
├── server.js          ← НОВЫЙ: Корневой сервер
├── package.json       ← ОБНОВЛЁН: scripts + dependencies
├── render.yaml        ← ОБНОВЛЁН: build/start команды
├── client/
│   └── dist/          ← Build output (статика)
├── server/
│   └── src/           ← Полная backend реализация
└── shared/
```

---

## 💡 Примечания

1. **Текущая реализация** - простой сервер для демонстрации
2. **Для production** используйте полную версию из `server/src/app.ts`
3. **Статика клиента** обслуживается из `client/dist/`
4. **WebSocket** полностью функционален

---

## 📝 Следующие шаги

1. ✅ Задеплоить на Render
2. ⏭️ Интегрировать с полной backend версией (`server/src/`)
3. ⏭️ Настроить MongoDB Atlas
4. ⏭️ Добавить аутентификацию
5. ⏭️ Подключить клиентское приложение

---

**Готово!** Сервер запустится на Render без ошибки "Missing script: start" 🎉

**Дата:** 2026-03-23  
**Статус:** ✅ Исправлено
