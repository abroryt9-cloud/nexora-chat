# ✅ Чек-лист деплоя Nexora на Render

## 📋 Предварительная подготовка

### 1. MongoDB Atlas
- [ ] Зарегистрироваться на [MongoDB Atlas](https://cloud.mongodb.com)
- [ ] Создать бесплатный кластер (M0)
- [ ] Создать пользователя БД
- [ ] Добавить IP whitelist: `0.0.0.0/0`
- [ ] Получить connection string
- [ ] Протестировать подключение

### 2. GitHub
- [ ] Создать репозиторий (если нет)
- [ ] Инициализировать git: `git init`
- [ ] Добавить все файлы: `git add .`
- [ ] Закоммитить: `git commit -m "Initial commit"`
- [ ] Отправить: `git push origin main`

### 3. Переменные окружения (локально)

**server/.env:**
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_SECRET=local_secret_change_in_production
JWT_REFRESH_SECRET=local_refresh_secret_change_in_production
ENCRYPTION_KEY=local_encryption_key_change_in_production
CLIENT_URL=http://localhost:5173
```

**client/.env:**
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
```

### 4. Генерация секретов
```bash
node scripts/generate-secrets.js
```
- [ ] Скопировать сгенерированные секреты
- [ ] Сохранить в безопасном месте

---

## 🚀 Деплой на Render

### 5. Подключение Render
- [ ] Войти на [Render](https://render.com)
- [ ] Подключить GitHub аккаунт
- [ ] Дать доступ к репозиторию

### 6. Создание Blueprint
- [ ] Нажать **New +** → **Blueprint**
- [ ] Выбрать репозиторий Nexora
- [ ] Render прочитает `render.yaml`

### 7. Настройка Backend (nexora-api)

**Основные настройки:**
- [ ] Name: `nexora-api`
- [ ] Region: Frankfurt
- [ ] Branch: `main`
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

**Environment Variables:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI=<ваш connection string>`
- [ ] `JWT_SECRET=<сгенерированный секрет>`
- [ ] `JWT_REFRESH_SECRET=<сгенерированный секрет>`
- [ ] `ENCRYPTION_KEY=<сгенерированный секрет>`
- [ ] `CLIENT_URL=https://nexora-client.onrender.com`

### 8. Настройка Frontend (nexora-client)

**Основные настройки:**
- [ ] Name: `nexora-client`
- [ ] Region: Frankfurt
- [ ] Branch: `main`
- [ ] Root Directory: `client`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run preview -- --port $PORT`

**Environment Variables:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `VITE_API_URL=https://nexora-api.onrender.com/api/v1`
- [ ] `VITE_WS_URL=wss://nexora-api.onrender.com`

---

## ✅ Пост-деплой проверка

### 9. Проверка Backend
- [ ] Открыть `https://nexora-api.onrender.com/health`
- [ ] Проверить статус (должен быть 200 OK)
- [ ] Проверить логи в Render Dashboard
- [ ] Убедиться, что нет ошибок подключения к БД

### 10. Проверка Frontend
- [ ] Открыть `https://nexora-client.onrender.com`
- [ ] Проверить загрузку страницы
- [ ] Открыть консоль браузера (F12)
- [ ] Убедиться, что нет ошибок CORS
- [ ] Проверить Network tab для API запросов

### 11. Проверка WebSocket
- [ ] Открыть консоль браузера
- [ ] Проверить WebSocket подключение (должно быть `wss://`)
- [ ] Отправить тестовое сообщение
- [ ] Убедиться, что сообщение доставлено

### 12. Функциональное тестирование
- [ ] Регистрация пользователя
- [ ] Вход в систему
- [ ] Создание чата
- [ ] Отправка сообщения
- [ ] Проверка real-time обновлений
- [ ] Тест видеозвонка (если доступно)

---

## 🔧 Устранение проблем

### CORS ошибки
```
❌ Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Решение:**
1. Проверить `CLIENT_URL` в backend environment variables
2. Убедиться, что URL совпадает с frontend URL
3. Перезапустить backend сервис

### WebSocket не подключается
```
❌ WebSocket connection failed
```

**Решение:**
1. Проверить `VITE_WS_URL` (должен быть `wss://`)
2. Проверить, что backend доступен
3. Проверить firewall/proxy настройки

### MongoDB не подключается
```
❌ MongoServerError: Authentication failed
```

**Решение:**
1. Проверить connection string
2. Проверить IP whitelist в MongoDB Atlas
3. Проверить имя пользователя и пароль

---

## 📊 Мониторинг

### Render Dashboard
- [ ] Проверять **Logs** регулярно
- [ ] Следить за **Metrics** (CPU, память)
- [ ] Проверять **Events** на ошибки

### MongoDB Atlas
- [ ] Мониторить использование хранилища
- [ ] Проверять медленные запросы
- [ ] Настроить backup (если нужно)

---

## 💰 Оптимизация стоимости

### Бесплатный тариф
- 750 часов/месяц (1 сервис всегда активен)
- 1 GB база данных
- 100 GB bandwidth

### Рекомендации
- [ ] Использовать один бесплатный сервис для начала
- [ ] Для production рассмотреть платные тарифы ($7/месяц)
- [ ] Настроить health checks для предотвращения sleep

---

## 🔐 Безопасность

### После деплоя
- [ ] Удалить `.env` файлы из git (если были закоммичены)
- [ ] Сменить все секреты если они были в git
- [ ] Настроить 2FA для Render аккаунта
- [ ] Ограничить доступ к MongoDB Atlas по IP

### Регулярно
- [ ] Обновлять зависимости
- [ ] Ротировать JWT секреты (раз в 3-6 месяцев)
- [ ] Проверять логи на подозрительную активность

---

## 📝 Контакты и поддержка

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- Socket.io Docs: https://socket.io/docs/v4/

---

**Дата создания:** 2026-03-23  
**Статус:** Готов к использованию
