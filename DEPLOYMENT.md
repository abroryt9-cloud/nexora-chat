# 🚀 Деплой Nexora на Render

## 📋 Предварительные требования

1. Аккаунт на [Render](https://render.com)
2. MongoDB Atlas кластер (бесплатный тариф M0)
3. GitHub репозиторий с проектом

---

## 🔧 Шаг 1: Настройка MongoDB Atlas

1. Создайте кластер на [MongoDB Atlas](https://cloud.mongodb.com)
2. Создайте пользователя с правами чтения/записи
3. Whitelist IP: `0.0.0.0/0` (для Render)
4. Получите connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nexora?retryWrites=true&w=majority
   ```

---

## 🔧 Шаг 2: Подготовка проекта

### 2.1 Обновите переменные окружения

**server/.env** (для локальной разработки):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_SECRET=your_local_jwt_secret
JWT_REFRESH_SECRET=your_local_refresh_secret
ENCRYPTION_KEY=your_local_encryption_key
CLIENT_URL=http://localhost:5173
```

**client/.env** (для локальной разработки):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 2.2 Закоммитьте изменения

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## 🔧 Шаг 3: Настройка на Render

### Вариант A: Через render.yaml (автоматически)

1. В личном кабинете Render нажмите **"New +"** → **"Blueprint"**
2. Подключите GitHub репозиторий
3. Render автоматически прочитает `render.yaml` и создаст сервисы

### Вариант B: Ручная настройка

#### 3.1 Backend (API)

1. **New +** → **Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `nexora-api`
   - **Region:** Frankfurt (или ближе к вам)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexora
   JWT_SECRET=<сгенерируйте случайную строку>
   JWT_REFRESH_SECRET=<сгенерируйте случайную строку>
   ENCRYPTION_KEY=<сгенерируйте случайную строку>
   CLIENT_URL=https://nexora-client.onrender.com
   ```

#### 3.2 Frontend (Client)

1. **New +** → **Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `nexora-client`
   - **Region:** Frankfurt (как backend)
   - **Branch:** `main`
   - **Root Directory:** `client`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview -- --port $PORT`
   - **Instance Type:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   VITE_API_URL=https://nexora-api.onrender.com/api/v1
   VITE_WS_URL=wss://nexora-api.onrender.com
   ```

---

## 🔧 Шаг 4: Настройка CORS

После развёртывания backend получит URL вида `https://nexora-api.onrender.com`.

Обновите переменные окружения на backend:

```env
CLIENT_URL=https://nexora-client.onrender.com
```

CORS уже настроен в `server/src/app.ts` для поддержки:
- `http://localhost:5173` (локально)
- `http://localhost:3000` (локально альтернатива)
- `https://nexora-client.onrender.com` (production)

---

## 🔧 Шаг 5: WebSocket (WSS)

Socket.io автоматически использует Secure WebSocket (WSS) в production.

**Проверка:**
```javascript
// client/src/hooks/useWebSocket.ts
const socket = io(import.meta.env.VITE_WS_URL, {
  auth: { token },
  transports: ['websocket'],
});
```

Убедитесь, что `VITE_WS_URL` использует `wss://` в production:
```env
VITE_WS_URL=wss://nexora-api.onrender.com
```

---

## ✅ Проверка деплоя

### Backend

1. Откройте `https://nexora-api.onrender.com/api/v1/health`
2. Должен вернуться статус OK

### Frontend

1. Откройте `https://nexora-client.onrender.com`
2. Проверьте консоль браузера на ошибки
3. Проверьте WebSocket подключение в Network tab

### Тестирование

1. Зарегистрируйте пользователя
2. Создайте чат
3. Отправьте сообщение
4. Проверьте WebSocket в консоли разработчика

---

## 🔍 Мониторинг и логи

### Render Dashboard

1. **Logs** — просмотр логов в реальном времени
2. **Metrics** — использование CPU, памяти
3. **Events** — история деплоев и событий

### Логи

```bash
# Backend логи доступны в Render Dashboard
# Для отладки локально:
cd server && npm run dev
```

---

## 🐛 Частые проблемы

### 1. Ошибки CORS

**Проблема:** Frontend не может подключиться к backend

**Решение:**
- Проверьте `CLIENT_URL` в environment variables backend
- Убедитесь, что URL совпадает с адресом frontend

### 2. WebSocket не подключается

**Проблема:** WSS соединение не устанавливается

**Решение:**
- Используйте `wss://` вместо `ws://` в production
- Проверьте, что backend доступен по HTTPS

### 3. MongoDB не подключается

**Проблема:** Ошибка подключения к базе данных

**Решение:**
- Проверьте connection string в MongoDB Atlas
- Убедитесь, что IP whitelist содержит `0.0.0.0/0`
- Проверьте права пользователя

### 4. Медленный первый запуск

**Проблема:** Первый запрос занимает 30-50 секунд

**Решение:** Это нормально для бесплатного тарифа Render. Для ускорения:
- Используйте платный тариф
- Настройте health checks для предотвращения sleep

---

## 📊 Структура деплоя

```
┌─────────────────────────────────────────┐
│           Render.com                    │
│                                         │
│  ┌─────────────────┐  ┌───────────────┐ │
│  │  nexora-api     │  │ nexora-client │ │
│  │  (Backend)      │◄─│  (Frontend)   │ │
│  │  Port: 5000     │  │  Port: 10000  │ │
│  │  HTTPS + WSS    │  │  HTTPS        │ │
│  └────────┬────────┘  └───────────────┘ │
│           │                              │
│           ▼                              │
│  ┌─────────────────┐                     │
│  │  MongoDB Atlas  │                     │
│  │  (Database)     │                     │
│  └─────────────────┘                     │
└─────────────────────────────────────────┘
```

---

## 🔐 Безопасность

### Переменные окружения

Никогда не коммитьте `.env` файлы!

```bash
# Добавьте в .gitignore
.env
server/.env
client/.env
```

### JWT секреты

Используйте сложные случайные строки:

```bash
# Сгенерируйте секреты
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### HTTPS

Render автоматически предоставляет HTTPS для всех сервисов.

---

## 💰 Стоимость

**Бесплатный тариф Render:**

| Сервис | Лимиты |
|--------|--------|
| Web Services | 750 часов/месяц (1 сервис всегда активен) |
| Database | 1 GB, 25 MB/s I/O |
| Bandwidth | 100 GB/месяц |

**Рекомендация:** Для production рассмотрите платные тарифы ($7/месяц за сервис).

---

## 📝 Чек-лист перед деплоем

- [ ] MongoDB Atlas настроен
- [ ] Все `.env` файлы обновлены
- [ ] JWT секреты сгенерированы
- [ ] CORS настроен для production URL
- [ ] WebSocket использует WSS
- [ ] Код закоммичен и отправлен в GitHub
- [ ] render.yaml проверен
- [ ] Environment variables установлены на Render

---

**Дата обновления:** 2026-03-23  
**Версия:** 1.0.0
