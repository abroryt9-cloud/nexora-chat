# 🚀 Деплой Nexora на Render - Пошаговая инструкция

## ✅ Проверка готовности

Ваш проект готов к деплою! Все необходимые файлы созданы:
- ✅ `server.js` - entry point для Render
- ✅ `render.yaml` - конфигурация сервисов
- ✅ `client/.env.production` - production настройки клиента
- ✅ `server/.env.production` - production настройки сервера
- ✅ Все компоненты собираются без ошибок

## 📋 Шаги деплоя

### 1. Подготовка репозитория

```bash
# Убедитесь что все изменения закоммичены
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Создание аккаунта на Render

1. Перейдите на [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub
3. Подключите ваш репозиторий

### 3. Создание сервисов через Blueprint

1. В Render Dashboard нажмите **"New"** → **"Blueprint"**
2. Подключите ваш GitHub репозиторий
3. Render автоматически найдет `render.yaml` и создаст сервисы:
   - `nexora-api` (Backend)
   - `nexora-client` (Frontend) 
   - `nexora-db` (MongoDB)

### 4. Настройка MongoDB Atlas (рекомендуется)

**Вместо Render PostgreSQL лучше использовать MongoDB Atlas:**

1. Перейдите на [cloud.mongodb.com](https://cloud.mongodb.com)
2. Создайте бесплатный кластер (M0)
3. Создайте пользователя БД
4. Добавьте IP `0.0.0.0/0` в Network Access (для Render)
5. Скопируйте Connection String

### 5. Настройка Environment Variables

#### Backend (nexora-api):
В настройках сервиса установите:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexora
JWT_SECRET=ваш_супер_секретный_ключ_32_символа
JWT_REFRESH_SECRET=ваш_refresh_секрет_32_символа
ENCRYPTION_KEY=ваш_ключ_шифрования_32_символа
CLIENT_URL=https://nexora-client.onrender.com
```

#### Frontend (nexora-client):
```
NODE_ENV=production
PORT=10000
VITE_API_URL=https://nexora-api.onrender.com/api/v1
VITE_WS_URL=wss://nexora-api.onrender.com
VITE_APP_TITLE=Nexora Messenger
```

### 6. Генерация секретов

Для генерации безопасных ключей выполните локально:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Деплой

1. Сервисы автоматически начнут сборку
2. Backend соберется первым (~5-10 минут)
3. Frontend соберется вторым (~3-5 минут)
4. Проверьте логи в случае ошибок

### 8. Проверка работоспособности

#### Backend:
- URL: `https://nexora-api.onrender.com`
- Health: `https://nexora-api.onrender.com/health`

#### Frontend:
- URL: `https://nexora-client.onrender.com`

## 🔧 Решение частых проблем

### Проблема: "Application failed to respond"
**Решение:**
1. Проверьте логи сервиса
2. Убедитесь что PORT правильно задан
3. Проверьте что MongoDB URI корректен

### Проблема: "Build failed"
**Решение:**
1. Проверьте Node.js версию (должна быть ≥20.0.0)
2. Убедитесь что все зависимости в package.json
3. Проверьте логи сборки

### Проблема: "CORS errors"
**Решение:**
1. Убедитесь что CLIENT_URL установлен правильно
2. Проверьте что URL клиента соответствует реальному

### Проблема: "Database connection failed"
**Решение:**
1. Проверьте MONGODB_URI
2. Убедитесь что IP `0.0.0.0/0` добавлен в MongoDB Atlas
3. Проверьте логин/пароль

## 📊 Архитектура деплоя

```
┌─────────────────────────────────────────────────────────┐
│                      Render.com                        │
│                                                         │
│  ┌──────────────────┐      ┌─────────────────────────┐ │
│  │  nexora-api      │◄─────│  nexora-client          │ │
│  │  (Backend)       │      │  (Frontend)             │ │
│  │  Port: 5000      │      │  Port: 10000            │ │
│  │                  │      │                         │ │
│  │  ✅ API Routes   │      │  ✅ React App           │ │
│  │  ✅ WebSockets   │      │  ✅ Static Files        │ │
│  │  ✅ Auth         │      │  ✅ Vite Preview        │ │
│  └──────────────────┘      └─────────────────────────┘ │
│            │                                           │
│            ▼                                           │
│  ┌──────────────────┐                                  │
│  │  MongoDB Atlas   │                                  │
│  │  (External DB)   │                                  │
│  └──────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 После успешного деплоя

1. **Тестирование:**
   - Регистрация пользователя
   - Отправка сообщений
   - Работа кошелька
   - Смена тем

2. **Мониторинг:**
   - Следите за логами в Render Dashboard
   - Настройте уведомления о даунтайме

3. **Кастомизация:**
   - Настройте кастомные домены (опционально)
   - Добавьте SSL сертификаты

---

## 💡 Полезные ссылки

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Node.js на Render](https://render.com/docs/node-version)

---

**Готово!** Ваш Nexora мессенджер теперь доступен в production! 🚀

**Время деплоя:** ~10-15 минут  
**Статус:** ✅ Готов к запуску