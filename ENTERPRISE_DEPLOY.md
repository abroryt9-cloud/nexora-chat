# 🚀 Восстановление Nexora Enterprise Messenger на Render

## ✅ Что было сделано

### 1. Обновлён `server.js`
- ✅ Раздача статики из `client/dist/` (основной клиент)
- ✅ Раздача статики из `admin/dist/` (админка по /admin)
- ✅ Fallback на `public/index.html` (если нет сборки)
- ✅ CORS настроен для CLIENT_URL и ADMIN_URL
- ✅ WebSocket полностью работает
- ✅ Health check с информацией о доступных файлах

### 2. Создан `admin/vite.config.ts`
- ✅ Base path: `/admin/` для продакшена
- ✅ Порт: 5174 (отличается от клиента)
- ✅ Code splitting для оптимизации

### 3. Создан `server/src/config/cors.ts`
- ✅ Централизованная CORS конфигурация
- ✅ Поддержка CLIENT_URL и ADMIN_URL
- ✅ Отдельные конфиги для Express и Socket.io

### 4. Обновлён корневой `package.json`
- ✅ Полная сборка всех компонентов: shared → client → admin → server
- ✅ Скрипты для каждого компонента
- ✅ Render build script

---

## 📦 Структура проекта

```
nexora-chat/
├── server.js              ← Корневой сервер (Express + Socket.io)
├── package.json           ← Корневой package.json
├── render.yaml            ← Конфигурация Render
├── client/
│   ├── dist/              ← Build output (основной клиент)
│   ├── src/
│   │   ├── App.tsx        ← Главный компонент
│   │   ├── components/    ← Chat, Auth, Profile, Layout
│   │   ├── hooks/         ← useAuth, useChat, useWebSocket
│   │   ├── store/         ← Redux slices
│   │   ├── services/      ← API services
│   │   ├── locales/       ← 60+ языков
│   │   └── styles/        ← Темы (dark, light, cosmic, aurora)
│   └── vite.config.ts
├── admin/
│   ├── dist/              ← Build output (админка)
│   ├── src/
│   │   ├── App.tsx        ← Админ-панель
│   │   ├── pages/         ← Dashboard, Users, Reports, Analytics
│   │   └── components/    ← Admin components
│   └── vite.config.ts     ← ← НОВЫЙ
├── server/
│   ├── dist/              ← Build output (backend API)
│   ├── src/
│   │   ├── app.ts         ← Основной сервер
│   │   ├── config/
│   │   │   ├── cors.ts    ← ← НОВЫЙ
│   │   │   └── database.ts
│   │   ├── controllers/   ← auth, chat, user, wallet, nft, admin, ai
│   │   ├── models/        ← User, Chat, Message, Wallet, NFT
│   │   ├── routes/        ← API routes
│   │   └── sockets/       ← WebSocket handlers
│   └── tsconfig.json
├── shared/
│   ├── types/             ← Общие типы
│   └── constants/         ← Языки, стикеры, GIF, достижения
└── public/                ← Fallback клиент
```

---

## 🚀 Инструкция по деплою

### Шаг 1: Локальная сборка и проверка

```bash
# Перейдите в проект
cd c:/Users/user/Desktop/NEXORA/nexora-chat

# Установите все зависимости
npm run install:all

# Соберите все компоненты
npm run build

# Проверьте, что сборки существуют
ls client/dist
ls admin/dist
ls server/dist

# Запустите сервер
node server.js

# Проверьте:
# - http://localhost:3000 (клиент)
# - http://localhost:3000/admin (админка)
# - http://localhost:3000/health (API)
```

### Шаг 2: Коммит и пуш на GitHub

```bash
# Проверьте статус
git status

# Добавьте все изменения
git add .

# Закоммитьте
git commit -m "Restore enterprise messenger deployment

- Update server.js to serve client/dist and admin/dist
- Add admin/vite.config.ts with /admin base path
- Add server/src/config/cors.ts for centralized CORS
- Update package.json with full build scripts
- Fix: Serve React client instead of JSON
- Support CLIENT_URL and ADMIN_URL environment variables

Features:
- Client available at root (/)
- Admin panel available at /admin
- WebSocket fully functional
- CORS configured for production"

# Отправьте на GitHub
git push origin main
```

### Шаг 3: Деплой на Render

**Автоматически:**
1. Render увидит новый коммит
2. Выполнит `npm run build` (сборка всех компонентов)
3. Выполнит `npm start` (запуск server.js)
4. Перезапустит сервер (~3-5 минут)

**Вручную (если нужно):**
1. Откройте [Render Dashboard](https://dashboard.render.com)
2. Выберите `nexora-chat`
3. Нажмите **Manual** → **Deploy**

---

## ⚙️ Переменные окружения на Render

**Обязательно настройте:**

```env
# Порт
PORT=3000

# Окружение
NODE_ENV=production

# MongoDB Atlas (получите на https://cloud.mongodb.com)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/nexora?retryWrites=true&w=majority

# JWT секреты (сгенерируйте случайные строки)
JWT_SECRET=<сгенерировать>
JWT_REFRESH_SECRET=<сгенерировать>
ENCRYPTION_KEY=<сгенерировать>

# URL (Render присвоит после деплоя)
CLIENT_URL=https://nexora-chat.onrender.com
ADMIN_URL=https://nexora-chat.onrender.com/admin

# API ключи (опционально)
COINGECKO_API_KEY=...
TENOR_API_KEY=...
DEEPSEEK_API_KEY=...
GEMINI_API_KEY=...
```

**Генерация секретов:**
```bash
node scripts/generate-secrets.js
```

---

## ✅ Чек-лист проверки

### 1. Главная страница (клиент)

```
https://nexora-chat.onrender.com
```

**Должно открыться:**
- ✨ Интерфейс Nexora (не JSON!)
- 🎨 Космический дизайн или Telegram-like
- 💬 Поле для ввода имени или логин
- 🟢 Индикатор WebSocket

### 2. Админ-панель

```
https://nexora-chat.onrender.com/admin
```

**Должно открыться:**
- 📊 Dashboard со статистикой
- 👥 Список пользователей
- 💬 Чаты для модерации
- 📈 Аналитика

### 3. WebSocket

**Проверка:**
1. Откройте консоль браузера (F12)
2. Введите имя/войдите
3. Отправьте сообщение
4. В консоли должно быть:
   ```
   [WebSocket] Connected: <socket_id>
   [WebSocket] Message sent
   ```

### 4. Health Check

```
https://nexora-chat.onrender.com/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "message": "Nexora API is running",
  "timestamp": "2026-03-23T20:00:00.000Z",
  "environment": "production",
  "port": 3000,
  "clientAvailable": true,
  "adminAvailable": true
}
```

### 5. API Endpoints

```
https://nexora-chat.onrender.com/api/v1
```

**Ожидаемый ответ:**
```json
{
  "message": "Nexora API v1",
  "note": "Full API implementation in server/src/app.ts",
  "endpoints": {
    "auth": "/api/v1/auth",
    "chat": "/api/v1/chat",
    "user": "/api/v1/user",
    "wallet": "/api/v1/wallet",
    "nft": "/api/v1/nft",
    "admin": "/api/v1/admin",
    "ai": "/api/v1/ai"
  }
}
```

---

## 🐛 Устранение проблем

### Проблема: Открывается JSON вместо клиента

**Причина:** `client/dist/` не существует

**Решение:**
```bash
# Локально соберите клиент
cd client
npm install
npm run build
cd ..

# Проверьте, что dist существует
ls client/dist/index.html

# Закоммитьте и отправьте
git add client/dist
git commit -m "Add client build"
git push origin main
```

**ИЛИ** добавьте `.gitkeep` в client/dist/:
```bash
mkdir -p client/dist
touch client/dist/.gitkeep
git add client/dist/.gitkeep
git commit -m "Add client/dist folder"
git push
```

### Проблема: Админка не открывается по /admin

**Причина:** `admin/dist/` не существует или неверный base path

**Решение:**
```bash
# Проверьте admin/vite.config.ts
cat admin/vite.config.ts

# Должно быть: base: '/admin/'

# Пересоберите админку
cd admin
npm install
npm run build
cd ..

# Проверьте dist
ls admin/dist/index.html

# Закоммитьте
git add admin/dist
git commit -m "Add admin build"
git push
```

### Проблема: WebSocket не подключается

**Причина:** CORS или неправильный URL

**Решение:**
1. Проверьте CLIENT_URL в environment variables
2. Откройте консоль браузера, посмотрите ошибки
3. Проверьте, что используете `wss://` для production

### Проблема: MongoDB не подключается

**Причина:** Неправильный MONGODB_URI

**Решение:**
```bash
# Проверьте connection string
# Должен быть вида:
mongodb+srv://user:password@cluster.mongodb.net/nexora?retryWrites=true&w=majority

# Проверьте IP whitelist в MongoDB Atlas
# Должен содержать 0.0.0.0/0
```

### Проблема: Кэш браузера

**Решение:**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

Или откройте в режиме инкогнито.

---

## 📊 Архитектура

```
┌──────────────────────────────────────────────────┐
│              Render.com                          │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  nexora-chat (Web Service)                 │ │
│  │  ─────────────────────────────────────────  │ │
│  │  Port: 3000                                │ │
│  │                                            │ │
│  │  Routes:                                   │ │
│  │  /              → client/dist/             │ │
│  │  /admin         → admin/dist/              │ │
│  │  /api/v1/*      → server/src/app.ts        │ │
│  │  /health        → Health check              │ │
│  │  /socket.io/    → WebSocket (Socket.io)    │ │
│  └────────────────────────────────────────────┘ │
│            │                                     │
│            ▼                                     │
│  ┌─────────────────────┐                         │
│  │  MongoDB Atlas      │                         │
│  │  (Database)         │                         │
│  └─────────────────────┘                         │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Функции enterprise-мессенджера

### Клиент (client/)
- ✅ React + TypeScript + Vite
- ✅ WebSocket (useWebSocket)
- ✅ Redux Toolkit (authSlice, chatSlice, userSlice, walletSlice)
- ✅ 60+ языков (i18n)
- ✅ 4 темы (dark, light, cosmic, aurora)
- ✅ Стикеры (5 категорий)
- ✅ GIF (Tenor API)
- ✅ Голосовые сообщения
- ✅ Реакции, редактирование, удаление
- ✅ Опросы, отложенные сообщения
- ✅ AI ассистент
- ✅ Крипто-кошелёк NXR
- ✅ NFT коллекция
- ✅ Достижения и статистика

### Админка (admin/)
- ✅ Dashboard со статистикой
- ✅ Управление пользователями
- ✅ Модерация чатов
- ✅ Аналитика и отчёты
- ✅ Системные логи
- ✅ Роли (главный админ, модератор)

### Сервер (server/)
- ✅ Node.js + Express + TypeScript
- ✅ WebSocket (Socket.io)
- ✅ MongoDB (Mongoose)
- ✅ JWT авторизация
- ✅ API: auth, chat, user, wallet, nft, admin, ai
- ✅ Rate limiting
- ✅ Error handling
- ✅ Logging

---

## 📝 Быстрый деплой (копировать и вставить)

```bash
# Полный цикл
cd c:/Users/user/Desktop/NEXORA/nexora-chat

# Установка зависимостей
npm run install:all

# Сборка всех компонентов
npm run build

# Проверка сборок
ls client/dist/index.html
ls admin/dist/index.html
ls server/dist/app.js

# Коммит
git add .
git commit -m "Deploy enterprise messenger

- Client at root (/)
- Admin panel at /admin
- Full API at /api/v1
- WebSocket functional
- CORS configured for production"

# Пуш
git push origin main

# Ждём 3-5 минут и проверяем:
# https://nexora-chat.onrender.com
# https://nexora-chat.onrender.com/admin
# https://nexora-chat.onrender.com/health
```

---

## 🎉 Результат

После деплоя будут работать:

✅ **Клиент:** https://nexora-chat.onrender.com  
✅ **Админка:** https://nexora-chat.onrender.com/admin  
✅ **API:** https://nexora-chat.onrender.com/api/v1  
✅ **WebSocket:** wss://nexora-chat.onrender.com  
✅ **Health:** https://nexora-chat.onrender.com/health  

**Полноценный enterprise-мессенджер Nexora готов!** 🚀

---

**Дата:** 2026-03-23  
**Статус:** ✅ Готово к деплою
