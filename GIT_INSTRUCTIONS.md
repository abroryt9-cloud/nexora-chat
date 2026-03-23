# 📤 Инструкция по Git для деплоя Nexora

## ✅ Что нужно закоммитить

**Новые файлы:**
- `public/index.html` — интерфейс мессенджера

**Обновлённые файлы:**
- `server.js` — раздача статики + SPA fallback
- `package.json` — скрипты build/start

---

## 🚀 Команды Git

### 1. Проверить статус

```bash
cd c:/Users/user/Desktop/NEXORA/nexora-chat
git status
```

**Ожидаемый вывод:**
```
Changes not staged for commit:
  modified:   server.js
  modified:   package.json

Untracked files:
  public/index.html
```

### 2. Добавить файлы

```bash
git add public/index.html server.js package.json
```

Или все файлы сразу:

```bash
git add .
```

### 3. Закоммитить

```bash
git commit -m "Add public/index.html messenger interface

- Create simple HTML/CSS/JS messenger in public/
- Update server.js to serve static files
- Add SPA fallback for all non-API routes
- Fix: JSON response instead of HTML interface"
```

### 4. Отправить на GitHub

```bash
git push origin main
```

---

## 🔍 Проверка на GitHub

1. Откройте https://github.com/<your-username>/<your-repo>
2. Проверьте, что файлы появились:
   - ✅ `public/index.html` существует
   - ✅ `server.js` обновлён (последний коммит)
   - ✅ `package.json` обновлён

---

## 🎯 Что будет на Render

После пуша Render автоматически:

1. **Detect changes** — увидит новый коммит
2. **Build** — выполнит `npm install && npm run build`
3. **Deploy** — перезапустит сервер

**Время деплоя:** ~2-3 минуты

---

## ✅ Проверка после деплоя

### 1. Откройте мессенджер

```
https://nexora-chat.onrender.com
```

**Должен открыться:**
- ✨ Интерфейс мессенджера (не JSON!)
- 🌟 Звёздный фон
- 💬 Поле для ввода сообщений
- 🟢 Индикатор подключения

### 2. Проверьте WebSocket

1. Откройте консоль браузера (F12)
2. Введите имя пользователя
3. Отправьте сообщение
4. Оно должно появиться в чате

### 3. Health check

```
https://nexora-chat.onrender.com/health
```

**Ответ:**
```json
{
  "status": "ok",
  "message": "Nexora API is running",
  ...
}
```

---

## 🐛 Если всё ещё открывается JSON

### Причина 1: Файлы не запушены

```bash
# Проверьте на GitHub
# Откройте https://github.com/<user>/<repo>/blob/main/public/index.html

# Если файла нет - сделайте пуш
git push origin main
```

### Причина 2: Render не пересобрался

**Решение:**
1. Откройте [Render Dashboard](https://dashboard.render.com)
2. Выберите `nexora-chat`
3. Нажмите **Manual** → **Deploy**

### Причина 3: Кэш браузера

**Решение:**
1. Нажмите `Ctrl + Shift + R` (Windows) или `Cmd + Shift + R` (Mac)
2. Или откройте в режиме инкогнито

---

## 📝 Полная команда (копировать и вставить)

```bash
cd c:/Users/user/Desktop/NEXORA/nexora-chat
git add .
git commit -m "Add public/index.html messenger interface

- Create simple HTML/CSS/JS messenger in public/
- Update server.js to serve static files
- Add SPA fallback for all non-API routes
- Fix: JSON response instead of HTML interface"
git push origin main
```

---

**После выполнения команд мессенджер будет доступен по ссылке!** 🎉

**Ссылка:** https://nexora-chat.onrender.com
