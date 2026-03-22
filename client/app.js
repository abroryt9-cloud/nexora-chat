// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentUser = null;
let currentChatId = null;
let ws = null;
let messagesCache = new Map();
let chatsCache = new Map();
let currentTheme = 'dark';
let currentLanguage = 'ru';
let walletBalance = 1250;
let userNFTs = [];
let userAchievements = [];
let userStats = { messages: 0, reactions: 0, stickers: 0, voice: 0, streak: 0 };
let aiMessages = [];

// 50+ языков
const languages = {
    ru: '🇷🇺 Русский', en: '🇬🇧 English', es: '🇪🇸 Español', fr: '🇫🇷 Français', de: '🇩🇪 Deutsch',
    it: '🇮🇹 Italiano', pt: '🇵🇹 Português', nl: '🇳🇱 Nederlands', pl: '🇵🇱 Polski', uk: '🇺🇦 Українська',
    zh: '🇨🇳 中文', ja: '🇯🇵 日本語', ko: '🇰🇷 한국어', ar: '🇸🇦 العربية', hi: '🇮🇳 हिन्दी',
    tr: '🇹🇷 Türkçe', vi: '🇻🇳 Tiếng Việt', th: '🇹🇭 ไทย', id: '🇮🇩 Indonesia', ms: '🇲🇾 Melayu',
    sv: '🇸🇪 Svenska', da: '🇩🇰 Dansk', no: '🇳🇴 Norsk', fi: '🇫🇮 Suomi', cs: '🇨🇿 Čeština',
    sk: '🇸🇰 Slovenčina', hu: '🇭🇺 Magyar', ro: '🇷🇴 Română', bg: '🇧🇬 Български', el: '🇬🇷 Ελληνικά',
    he: '🇮🇱 עברית', fa: '🇮🇷 فارسی', bn: '🇧🇩 বাংলা', ta: '🇮🇳 தமிழ்', te: '🇮🇳 తెలుగు',
    ml: '🇮🇳 മലയാളം', kn: '🇮🇳 ಕನ್ನಡ', mr: '🇮🇳 मराठी', gu: '🇮🇳 ગુજરાતી', pa: '🇮🇳 ਪੰਜਾਬੀ'
};

// Стикеры по категориям
const stickerPacks = {
    happy: ['😊', '🥰', '😍', '🤗', '😁', '😆', '😂', '🤣'],
    funny: ['😜', '🤪', '😝', '😛', '🤑', '🤡', '👻', '🎃'],
    love: ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '💟'],
    cool: ['😎', '🔥', '💪', '✨', '⭐', '🌟', '💫', '⚡'],
    animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
};

// GIF библиотека
const gifLibrary = {
    trending: [
        'https://media.tenor.com/2GcJkqH5oEsAAAAC/welcome.gif',
        'https://media.tenor.com/4KvHjRgHnZQAAAAC/hi-hello.gif'
    ],
    funny: [
        'https://media.tenor.com/5B3hJzRgLmMAAAAC/funny-laugh.gif',
        'https://media.tenor.com/9CvHkRgNnP4AAAAC/omg.gif'
    ],
    love: [
        'https://media.tenor.com/2GcJkqH5oEsAAAAC/love.gif',
        'https://media.tenor.com/4KvHjRgHnZQAAAAC/kiss.gif'
    ]
};

// NFT коллекция
const nftCollection = [
    { id: 1, name: 'Космический Кот', image: 'https://api.dicebear.com/7.x/icons/svg?seed=cosmic-cat', value: 500 },
    { id: 2, name: 'Галактический Лис', image: 'https://api.dicebear.com/7.x/icons/svg?seed=galaxy-fox', value: 750 },
    { id: 3, name: 'Звездный Дракон', image: 'https://api.dicebear.com/7.x/icons/svg?seed=star-dragon', value: 1200 }
];

// Достижения
const achievementsList = [
    { id: 'first_msg', name: 'Первый шаг', desc: 'Отправить первое сообщение', icon: '💬', requirement: 1, unlocked: false },
    { id: 'msg_100', name: 'Говорун', desc: 'Отправить 100 сообщений', icon: '🗣️', requirement: 100, unlocked: false },
    { id: 'sticker_lover', name: 'Стикероман', desc: 'Отправить 50 стикеров', icon: '🎨', requirement: 50, unlocked: false },
    { id: 'reaction_master', name: 'Мастер реакций', desc: 'Поставить 50 реакций', icon: '🎭', requirement: 50, unlocked: false },
    { id: 'voice_master', name: 'Голосовой актер', desc: 'Отправить 10 голосовых', icon: '🎤', requirement: 10, unlocked: false },
    { id: 'nft_collector', name: 'Коллекционер', desc: 'Собрать 3 NFT', icon: '💎', requirement: 3, unlocked: false },
    { id: 'streak_7', name: 'Неделя в Nexora', desc: 'Активен 7 дней подряд', icon: '🔥', requirement: 7, unlocked: false }
];

// Тестовые чаты
const testChats = {
    'chat1': { id: 'chat1', name: 'Алексей Смирнов', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', type: 'personal', status: 'online' },
    'chat2': { id: 'chat2', name: 'Dev Team 🚀', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dev', type: 'group', members: 5, status: 'online' },
    'chat3': { id: 'chat3', name: 'Мария Иванова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', type: 'personal', status: 'away' }
};

// Тестовые сообщения
let testMessages = {
    'chat1': [
        { id: 'msg1', text: 'Привет! Добро пожаловать в Nexora! 🎉', senderId: 'user1', senderName: 'Алексей', time: Date.now() - 3600000, own: false, reactions: ['🎉', '❤️'] },
        { id: 'msg2', text: 'Спасибо! Крутой мессенджер!', senderId: 'current', senderName: 'Я', time: Date.now() - 3500000, own: true, reactions: [] }
    ],
    'chat2': [
        { id: 'msg3', text: 'Коллеги, сегодня созвон в 18:00', senderId: 'user2', senderName: 'Дмитрий', time: Date.now() - 7200000, own: false, reactions: ['👍'] },
        { id: 'msg4', text: 'Буду!', senderId: 'current', senderName: 'Я', time: Date.now() - 7100000, own: true, reactions: [] }
    ],
    'chat3': []
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initEventListeners();
    initLanguageGrid();
    initStickerGrid();
    initGifGrid();
    initNFTGrid();
    initAchievements();
    loadTheme();
    initMobileMenu();
    initAIAssistant();
});

function initProgressBar() {
    let progress = 0;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('loadingText');
    const steps = ['Загрузка модулей...', 'Инициализация AI...', 'Загрузка NFT...', 'Настройка языков...', 'Готово!'];
    
    const interval = setInterval(() => {
        progress += 1.5;
        if (fill) fill.style.width = Math.min(progress, 100) + '%';
        
        const step = Math.floor(progress / 20);
        if (text && steps[step]) text.textContent = steps[step];
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('splash').style.display = 'none';
                document.getElementById('authScreen').style.display = 'flex';
            }, 500);
        }
    }, 40);
}

function initEventListeners() {
    // Авторизация
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`${tabName}Form`).classList.add('active');
        });
    });
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        if (email) loginUser(email);
    });
    
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        if (name && email) registerUser(name, email);
    });
    
    document.querySelectorAll('.demo-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.dataset.email;
            document.getElementById('loginEmail').value = email;
            loginUser(email);
        });
    });
    
    // Отправка сообщения
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Профиль и панели
    document.getElementById('profileBtn').addEventListener('click', () => togglePanel('rightPanel'));
    document.getElementById('closePanelBtn').addEventListener('click', () => togglePanel('rightPanel'));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('languageMenu').addEventListener('click', () => openModal('languageModal'));
    document.getElementById('nftMenu').addEventListener('click', () => openModal('nftModal'));
    document.getElementById('walletMenu').addEventListener('click', () => openModal('walletModal'));
    document.getElementById('achievementsMenu').addEventListener('click', () => openModal('achievementsModal'));
    document.getElementById('statsMenu').addEventListener('click', showStats);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Инструменты чата
    document.getElementById('emojiBtn').addEventListener('click', insertEmoji);
    document.getElementById('stickerBtn').addEventListener('click', () => openModal('stickerModal'));
    document.getElementById('gifBtn').addEventListener('click', () => openModal('gifModal'));
    document.getElementById('voiceBtn').addEventListener('click', startVoiceRecording);
    document.getElementById('pollBtn').addEventListener('click', () => openModal('pollModal'));
    document.getElementById('scheduleBtn').addEventListener('click', showScheduleModal);
    document.getElementById('aiBtn').addEventListener('click', toggleAIPanel);
    
    // Опросы
    document.getElementById('addPollOption').addEventListener('click', addPollOption);
    document.getElementById('createPollBtn').addEventListener('click', createPoll);
    
    // Фильтры чатов
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterChats(btn.dataset.filter);
        });
    });
    
    // Смена аватара
    document.getElementById('changeAvatarBtn').addEventListener('click', changeAvatar);
}

function loginUser(email) {
    const name = email.split('@')[0];
    currentUser = {
        id: 'current',
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        bio: '🌟 Пользователь Nexora'
    };
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar;
    document.getElementById('profileAvatar').src = currentUser.avatar;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileBio').textContent = currentUser.bio;
    document.getElementById('walletBalance').textContent = walletBalance + ' NXR';
    
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    loadChats();
    initWebSocket();
    showNotification(`✨ Добро пожаловать, ${currentUser.name}!`, 'success');
}

function registerUser(name, email) {
    currentUser = {
        id: 'current',
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        bio: 'Новый пользователь Nexora'
    };
    loginUser(email);
}

function logout() {
    if (ws) ws.close();
    currentUser = null;
    currentChatId = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('rightPanel').classList.remove('open');
    showNotification('👋 До свидания!', 'info');
}

// ========== WEBSOCKET ==========
function initWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);
    
    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'register', userId: currentUser.id }));
        showNotification('🔌 Соединение установлено', 'success');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = () => showNotification('⚠️ Ошибка соединения', 'error');
    ws.onclose = () => setTimeout(initWebSocket, 3000);
}

function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'chats':
            chatsCache = new Map(data.data.map(c => [c.id, c]));
            renderChats();
            break;
        case 'messages':
            messagesCache.set(data.data.chatId, data.data.messages);
            if (currentChatId === data.data.chatId) renderMessages();
            break;
        case 'new_message':
            if (!messagesCache.has(data.data.chatId)) messagesCache.set(data.data.chatId, []);
            messagesCache.get(data.data.chatId).push(data.data);
            if (currentChatId === data.data.chatId) {
                renderMessages();
                playNotificationSound();
            } else {
                showNotification(`📩 Новое сообщение от ${data.data.senderName}`, 'info');
                updateUnreadCount(data.data.chatId);
            }
            updateStatsAfterMessage();
            break;
        case 'user_typing':
            if (currentChatId === data.data.chatId) showTypingIndicator(data.data.isTyping);
            break;
        case 'reaction_added':
            updateMessageReaction(data.data);
            break;
    }
}

// ========== ЧАТЫ ==========
function loadChats() {
    chatsCache = new Map(Object.entries(testChats));
    renderChats();
    updateStats();
}

function renderChats() {
    const container = document.getElementById('chatsList');
    container.innerHTML = '';
    
    chatsCache.forEach(chat => {
        const messages = messagesCache.get(chat.id) || [];
        const lastMsg = messages[messages.length - 1];
        
        const div = document.createElement('div');
        div.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
        div.setAttribute('data-chat-id', chat.id);
        div.innerHTML = `
            <img src="${chat.avatar}" class="avatar">
            <div class="chat-info">
                <div class="chat-name">${escapeHtml(chat.name)}</div>
                <div class="chat-preview">${lastMsg ? escapeHtml(lastMsg.text.substring(0, 30)) : 'Нет сообщений'}</div>
            </div>
            <div class="chat-time">${lastMsg ? formatTime(lastMsg.time) : ''}</div>
        `;
        div.onclick = () => switchChat(chat.id);
        container.appendChild(div);
    });
}

function switchChat(chatId) {
    currentChatId = chatId;
    const chat = chatsCache.get(chatId);
    
    document.getElementById('chatName').textContent = chat.name;
    document.getElementById('chatAvatar').src = chat.avatar;
    document.getElementById('chatStatusText').textContent = chat.status === 'online' ? 'онлайн' : 'офлайн';
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-chat-id') === chatId) item.classList.add('active');
    });
    
    loadMessages(chatId);
    
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function loadMessages(chatId) {
    const msgs = messagesCache.get(chatId) || testMessages[chatId] || [];
    messagesCache.set(chatId, msgs);
    renderMessages();
}

function renderMessages() {
    const msgs = messagesCache.get(currentChatId) || [];
    const container = document.getElementById('messagesArea');
    
    if (msgs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                <i class="fas fa-comment-dots" style="font-size: 64px; margin-bottom: 20px;"></i>
                <h3>✨ Начните общение ✨</h3>
                <p>Напишите первое сообщение</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = msgs.map(msg => createMessageElement(msg)).join('');
    scrollToBottom();
}

function createMessageElement(msg) {
    const isOwn = msg.senderId === currentUser.id;
    let content = '';
    
    if (msg.isSticker) {
        content = `<div class="message-sticker">${msg.text}</div>`;
    } else if (msg.isGif) {
        content = `<img src="${msg.gifUrl}" class="message-gif" onclick="viewGif('${msg.gifUrl}')">`;
    } else if (msg.isPoll) {
        content = createPollHTML(msg);
    } else {
        content = `<div class="message-text">${escapeHtml(msg.text)}</div>`;
    }
    
    const reactionsHtml = msg.reactions && msg.reactions.length ? 
        `<div class="message-reactions">${msg.reactions.map(r => `<span class="reaction" onclick="addReaction('${msg.id}', '${r}')">${r}</span>`).join('')}</div>` : '';
    
    return `
        <div class="message ${isOwn ? 'message-own' : 'message-other'}">
            <div class="message-bubble">
                ${!isOwn ? `<div style="font-size: 12px; font-weight: 600;">${escapeHtml(msg.senderName)}</div>` : ''}
                ${content}
                <div class="message-time">${formatTime(msg.time)}</div>
                ${reactionsHtml}
            </div>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentChatId) return;
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        text: text,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: []
    };
    
    if (!messagesCache.has(currentChatId)) messagesCache.set(currentChatId, []);
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    input.value = '';
    
    // Отправка через WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: text,
            senderId: currentUser.id,
            senderName: currentUser.name
        }));
    }
    
    // Отправка статуса печатания
    sendTypingStatus(false);
    updateUserStats('messages');
    checkAchievements('messages');
    
    // Эмуляция ответа (для демо)
    setTimeout(() => simulateReply(), 2000);
}

function simulateReply() {
    const replies = ['👍', 'Понял!', 'Спасибо!', 'Отлично!', '😊', '🔥', 'Круто!', 'Договорились!'];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const chat = chatsCache.get(currentChatId);
    
    const replyMsg = {
        id: 'msg_' + Date.now(),
        text: randomReply,
        senderId: 'user_reply',
        senderName: chat?.name || 'Пользователь',
        time: Date.now(),
        own: false,
        reactions: []
    };
    
    messagesCache.get(currentChatId).push(replyMsg);
    renderMessages();
}

function sendTypingStatus(isTyping) {
    if (ws && ws.readyState === WebSocket.OPEN && currentChatId) {
        ws.send(JSON.stringify({
            type: 'typing',
            chatId: currentChatId,
            userId: currentUser.id,
            isTyping: isTyping
        }));
    }
}

function showTypingIndicator(show) {
    const dots = document.getElementById('typingDots');
    const text = document.getElementById('chatStatusText');
    if (show) {
        dots.style.display = 'inline-flex';
        text.style.display = 'none';
    } else {
        dots.style.display = 'none';
        text.style.display = 'inline';
    }
}

function addReaction(messageId, emoji) {
    const msgs = messagesCache.get(currentChatId);
    const msg = msgs.find(m => m.id === messageId);
    if (msg && !msg.reactions.includes(emoji)) {
        msg.reactions.push(emoji);
        renderMessages();
        updateUserStats('reactions');
        
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'add_reaction',
                chatId: currentChatId,
                messageId: messageId,
                               emoji: emoji,
                userId: currentUser.id
            }));
        }
    }
}

function updateMessageReaction(data) {
    const msgs = messagesCache.get(data.chatId);
    const msg = msgs?.find(m => m.id === data.messageId);
    if (msg && !msg.reactions.includes(data.emoji)) {
        msg.reactions.push(data.emoji);
        if (currentChatId === data.chatId) renderMessages();
    }
}

// ========== СТИКЕРЫ ==========
function initStickerGrid() {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;
    
    const allStickers = [...stickerPacks.happy, ...stickerPacks.funny, ...stickerPacks.love, ...stickerPacks.cool, ...stickerPacks.animals];
    grid.innerHTML = allStickers.map(s => `<div class="sticker" onclick="sendSticker('${s}')">${s}</div>`).join('');
}

function sendSticker(sticker) {
    if (!currentChatId) return;
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        text: sticker,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isSticker: true
    };
    
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    updateUserStats('stickers');
    closeModal('stickerModal');
    checkAchievements('stickers');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: sticker,
            senderId: currentUser.id,
            senderName: currentUser.name,
            isSticker: true
        }));
    }
}

// ========== GIF ==========
function initGifGrid() {
    const grid = document.getElementById('gifGrid');
    if (!grid) return;
    
    const allGifs = [...gifLibrary.trending, ...gifLibrary.funny, ...gifLibrary.love];
    grid.innerHTML = allGifs.map(gif => `
        <div class="gif-item" onclick="sendGif('${gif}')">
            <img src="${gif}" alt="GIF">
        </div>
    `).join('');
}

function sendGif(gifUrl) {
    if (!currentChatId) return;
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        text: 'GIF',
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isGif: true,
        gifUrl: gifUrl
    };
    
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    closeModal('gifModal');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: gifUrl,
            senderId: currentUser.id,
            senderName: currentUser.name,
            isGif: true,
            gifUrl: gifUrl
        }));
    }
}

function viewGif(url) {
    window.open(url, '_blank');
}

// ========== ГОЛОСОВЫЕ СООБЩЕНИЯ ==========
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            sendVoiceMessage(audioUrl);
            stream.getTracks().forEach(t => t.stop());
            document.getElementById('voiceBtn').classList.remove('recording');
        };
        
        mediaRecorder.start();
        isRecording = true;
        document.getElementById('voiceBtn').classList.add('recording');
        showNotification('🎙️ Запись началась... Отпустите для отправки', 'info');
        
        // Авто-остановка через 60 секунд
        setTimeout(() => {
            if (isRecording) stopVoiceRecording();
        }, 60000);
    } catch (err) {
        showNotification('❌ Не удалось получить доступ к микрофону', 'error');
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById('voiceBtn').classList.remove('recording');
    }
}

function sendVoiceMessage(audioUrl) {
    if (!currentChatId) return;
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        text: audioUrl,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isVoice: true,
        voiceUrl: audioUrl
    };
    
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    updateUserStats('voice');
    checkAchievements('voice');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: audioUrl,
            senderId: currentUser.id,
            senderName: currentUser.name,
            isVoice: true
        }));
    }
}

function playVoiceMessage(url) {
    const audio = new Audio(url);
    audio.play();
}

// ========== ОПРОСЫ ==========
let pollOptions = ['', ''];

function addPollOption() {
    pollOptions.push('');
    renderPollOptions();
}

function renderPollOptions() {
    const container = document.getElementById('pollOptionsList');
    container.innerHTML = pollOptions.map((opt, i) => `
        <div class="poll-option-input">
            <input type="text" placeholder="Вариант ${i + 1}" value="${opt}" data-index="${i}">
            ${i > 1 ? `<button class="remove-opt" data-index="${i}"><i class="fas fa-times"></i></button>` : ''}
        </div>
    `).join('');
    
    document.querySelectorAll('.poll-option-input input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            pollOptions[parseInt(e.target.dataset.index)] = e.target.value;
        });
    });
    
    document.querySelectorAll('.remove-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            pollOptions.splice(idx, 1);
            renderPollOptions();
        });
    });
}

function createPoll() {
    const question = document.getElementById('pollQuestion').value.trim();
    const options = pollOptions.filter(opt => opt.trim());
    
    if (!question || options.length < 2) {
        showNotification('❌ Введите вопрос и минимум 2 варианта', 'warning');
        return;
    }
    
    const newMsg = {
        id: 'msg_' + Date.now(),
        text: question,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isPoll: true,
        pollData: {
            question: question,
            options: options,
            votes: options.map(() => []),
            totalVotes: 0
        }
    };
    
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    closeModal('pollModal');
    pollOptions = ['', ''];
    document.getElementById('pollQuestion').value = '';
    showNotification('📊 Опрос создан!', 'success');
}

function createPollHTML(msg) {
    const poll = msg.pollData;
    const total = poll.totalVotes || 0;
    
    return `
        <div class="message-poll">
            <div class="poll-question">📊 ${escapeHtml(poll.question)}</div>
            ${poll.options.map((opt, idx) => {
                const votes = poll.votes[idx]?.length || 0;
                const percent = total > 0 ? (votes / total * 100).toFixed(1) : 0;
                return `
                    <div class="poll-option" onclick="votePoll('${msg.id}', ${idx})">
                        <div>${escapeHtml(opt)}</div>
                        <div class="poll-progress"><div class="poll-progress-fill" style="width: ${percent}%"></div></div>
                        <div class="poll-stats">${votes} голосов (${percent}%)</div>
                    </div>
                `;
            }).join('')}
            <div class="poll-stats">Всего голосов: ${total}</div>
        </div>
    `;
}

function votePoll(messageId, optionIndex) {
    const msgs = messagesCache.get(currentChatId);
    const msg = msgs.find(m => m.id === messageId);
    
    if (msg && msg.pollData) {
        // Проверка, голосовал ли уже
        const hasVoted = msg.pollData.options.some((_, i) => 
            msg.pollData.votes[i]?.includes(currentUser.id)
        );
        
        if (!hasVoted) {
            if (!msg.pollData.votes[optionIndex]) msg.pollData.votes[optionIndex] = [];
            msg.pollData.votes[optionIndex].push(currentUser.id);
            msg.pollData.totalVotes = (msg.pollData.totalVotes || 0) + 1;
            renderMessages();
            showNotification('✅ Ваш голос учтен!', 'success');
        } else {
            showNotification('⚠️ Вы уже голосовали в этом опросе', 'warning');
        }
    }
}

// ========== ОТЛОЖЕННЫЕ СООБЩЕНИЯ ==========
function showScheduleModal() {
    const modalHtml = `
        <div class="modal" id="scheduleModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⏰ Отложить сообщение</h3>
                    <button class="close-modal" onclick="closeModal('scheduleModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="datetime-local" id="scheduleDateTime" class="schedule-input">
                    <textarea id="scheduleText" placeholder="Введите сообщение..." rows="3" class="schedule-input"></textarea>
                    <div class="schedule-presets">
                        <button onclick="setSchedulePreset(5)">Через 5 мин</button>
                        <button onclick="setSchedulePreset(30)">Через 30 мин</button>
                        <button onclick="setSchedulePreset(60)">Через 1 час</button>
                        <button onclick="setSchedulePreset(1440)">Завтра</button>
                    </div>
                    <button onclick="scheduleMessage()" class="create-btn">Запланировать</button>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('scheduleModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    openModal('scheduleModal');
}

function setSchedulePreset(minutes) {
    const date = new Date(Date.now() + minutes * 60000);
    const formatted = date.toISOString().slice(0, 16);
    document.getElementById('scheduleDateTime').value = formatted;
}

function scheduleMessage() {
    const dateTime = document.getElementById('scheduleDateTime').value;
    const text = document.getElementById('scheduleText').value.trim();
    
    if (!dateTime || !text) {
        showNotification('❌ Заполните все поля', 'warning');
        return;
    }
    
    const scheduleTime = new Date(dateTime).getTime();
    const now = Date.now();
    
    if (scheduleTime <= now) {
        showNotification('⚠️ Укажите будущее время', 'warning');
        return;
    }
    
    showNotification(`📅 Сообщение запланировано на ${new Date(scheduleTime).toLocaleString()}`, 'success');
    closeModal('scheduleModal');
    
    // Сохраняем в localStorage
    const scheduled = JSON.parse(localStorage.getItem('scheduled_messages') || '[]');
    scheduled.push({
        id: Date.now(),
        chatId: currentChatId,
        text: text,
        time: scheduleTime,
        senderId: currentUser.id,
        senderName: currentUser.name
    });
    localStorage.setItem('scheduled_messages', JSON.stringify(scheduled));
    
    // Проверка планировщика
    checkScheduledMessages();
}

function checkScheduledMessages() {
    const scheduled = JSON.parse(localStorage.getItem('scheduled_messages') || '[]');
    const now = Date.now();
    
    scheduled.forEach((msg, idx) => {
        if (msg.time <= now) {
            // Отправляем сообщение
            const newMsg = {
                id: 'msg_' + Date.now(),
                text: msg.text,
                senderId: msg.senderId,
                senderName: msg.senderName,
                time: now,
                own: true,
                reactions: []
            };
            
            if (!messagesCache.has(msg.chatId)) messagesCache.set(msg.chatId, []);
            messagesCache.get(msg.chatId).push(newMsg);
            
            if (currentChatId === msg.chatId) renderMessages();
            
            // Удаляем отправленное
            scheduled.splice(idx, 1);
            localStorage.setItem('scheduled_messages', JSON.stringify(scheduled));
        }
    });
}

setInterval(checkScheduledMessages, 60000);

// ========== AI АССИСТЕНТ ==========
const aiResponses = {
    greeting: ['Привет! 👋 Как я могу помочь?', 'Здравствуйте! 🌟 Чем могу быть полезен?', 'Рад видеть! 💫'],
    help: ['Я могу: отвечать на вопросы, показывать погоду, время, шутить, давать советы', 'Спроси меня о погоде, времени, или просто поговори!'],
    joke: ['Почему программисты не любят природу? Там слишком много багов! 😄', 'Сколько программистов нужно, чтобы заменить лампочку? Ни одного, это аппаратная проблема! 💡'],
    weather: ['🌤️ Сегодня отличная погода для общения!', '☀️ Солнечно и тепло, самое время для чата!'],
    time: [`🕐 Текущее время: ${new Date().toLocaleTimeString()}`, `📅 Сегодня: ${new Date().toLocaleDateString()}`]
};

function initAIAssistant() {
    document.getElementById('sendAiBtn').addEventListener('click', sendAiMessage);
    document.getElementById('aiInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAiMessage();
    });
    document.getElementById('closeAiBtn').addEventListener('click', toggleAIPanel);
}

function toggleAIPanel() {
    const panel = document.getElementById('aiPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function sendAiMessage() {
    const input = document.getElementById('aiInput');
    const question = input.value.trim();
    if (!question) return;
    
    const messagesDiv = document.getElementById('aiMessages');
    messagesDiv.innerHTML += `<div class="ai-message user-message">👤 ${escapeHtml(question)}</div>`;
    input.value = '';
    
    setTimeout(() => {
        let response = getAIResponse(question);
        messagesDiv.innerHTML += `<div class="ai-message">🤖 ${response}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Сохраняем историю
        aiMessages.push({ question, response });
    }, 500);
}

function getAIResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('привет') || q.includes('hello') || q.includes('hi')) {
        return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    }
    if (q.includes('помощь') || q.includes('help')) {
        return aiResponses.help[Math.floor(Math.random() * aiResponses.help.length)];
    }
    if (q.includes('шутка') || q.includes('joke')) {
        return aiResponses.joke[Math.floor(Math.random() * aiResponses.joke.length)];
    }
    if (q.includes('погода') || q.includes('weather')) {
        return aiResponses.weather[Math.floor(Math.random() * aiResponses.weather.length)];
    }
    if (q.includes('время') || q.includes('time')) {
        return aiResponses.time[Math.floor(Math.random() * aiResponses.time.length)];
    }
    if (q.includes('как дела')) {
        return 'У меня всё отлично! Спасибо, что спросили! 😊 А у вас?';
    }
    if (q.includes('спасибо')) {
        return 'Пожалуйста! Всегда рад помочь! 🌟';
    }
    if (q.includes('кто ты')) {
        return 'Я AI ассистент Nexora! Могу помочь с вопросами, подсказать время или погоду, рассказать шутку. Чем могу помочь? 🤖';
    }
    
    return `Интересный вопрос! Я ещё учусь, но обязательно найду ответ. Могу рассказать шутку или показать время/погоду. Спросите что-нибудь другое! 🌟`;
}

// ========== NFT ==========
function initNFTGrid() {
    const grid = document.getElementById('nftGrid');
    if (!grid) return;
    
    userNFTs = nftCollection;
    grid.innerHTML = userNFTs.map(nft => `
        <div class="nft-card">
            <img src="${nft.image}" alt="${nft.name}">
            <div class="nft-info">
                <div class="nft-name">${nft.name}</div>
                <div class="nft-value">💰 ${nft.value} NXR</div>
            </div>
        </div>
    `).join('');
}

function checkNFTAchievement() {
    if (userNFTs.length >= 3) {
        unlockAchievement('nft_collector');
    }
}

// ========== ДОСТИЖЕНИЯ ==========
function initAchievements() {
    const saved = localStorage.getItem('nexora_achievements');
    if (saved) {
        const savedAchievements = JSON.parse(saved);
        achievementsList.forEach(ach => {
            const savedAch = savedAchievements.find(a => a.id === ach.id);
            if (savedAch) ach.unlocked = savedAch.unlocked;
        });
    }
    renderAchievements();
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    const unlocked = achievementsList.filter(a => a.unlocked).length;
    document.getElementById('statAchievements').textContent = unlocked;
    
    container.innerHTML = achievementsList.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
            ${!ach.unlocked ? `<div class="achievement-progress"><div class="achievement-progress-fill" style="width: 0%"></div></div>` : '<div class="achievement-unlocked">✅ Разблокировано</div>'}
        </div>
    `).join('');
}

function checkAchievements(type) {
    let updated = false;
    
    achievementsList.forEach(ach => {
        if (ach.unlocked) return;
        
        switch(ach.id) {
            case 'first_msg':
                if (userStats.messages >= 1) { ach.unlocked = true; updated = true; showAchievement(ach); }
                break;
            case 'msg_100':
                if (userStats.messages >= 100) { ach.unlocked = true; updated = true; showAchievement(ach); }
                break;
            case 'sticker_lover':
                if (userStats.stickers >= 50) { ach.unlocked = true; updated = true; showAchievement(ach); }
                break;
            case 'reaction_master':
                if (userStats.reactions >= 50) { ach.unlocked = true; updated = true; showAchievement(ach); }
                break;
            case 'voice_master':
                if (userStats.voice >= 10) { ach.unlocked = true; updated = true; showAchievement(ach); }
                break;
        }
    });
    
    if (updated) {
        localStorage.setItem('nexora_achievements', JSON.stringify(achievementsList));
        renderAchievements();
    }
}

function unlockAchievement(id) {
    const ach = achievementsList.find(a => a.id === id);
    if (ach && !ach.unlocked) {
        ach.unlocked = true;
        localStorage.setItem('nexora_achievements', JSON.stringify(achievementsList));
        renderAchievements();
        showAchievement(ach);
    }
}

function showAchievement(ach) {
    showNotification(`🏆 Достижение разблокировано: ${ach.name}! ${ach.icon}`, 'success');
}

// ========== СТАТИСТИКА ==========
function updateUserStats(type) {
    userStats[type] = (userStats[type] || 0) + 1;
    localStorage.setItem('nexora_stats', JSON.stringify(userStats));
    updateStats();
}

function updateStats() {
    let totalMessages = 0;
    messagesCache.forEach(msgs => { totalMessages += msgs.length; });
    
    document.getElementById('statMessages').textContent = totalMessages;
    document.getElementById('statChats').textContent = chatsCache.size;
    document.getElementById('statStreak').textContent = userStats.streak || 0;
    
    // Обновляем статистику в профиле
    const statsContent = document.getElementById('statsContent');
    if (statsContent) {
        statsContent.innerHTML = `
            <div class="stats-detail">
                <div class="stat-card"><i class="fas fa-comment-dots"></i><span>${totalMessages}</span><small>сообщений</small></div>
                <div class="stat-card"><i class="fas fa-smile"></i><span>${userStats.reactions || 0}</span><small>реакций</small></div>
                <div class="stat-card"><i class="fas fa-sticker"></i><span>${userStats.stickers || 0}</span><small>стикеров</small></div>
                <div class="stat-card"><i class="fas fa-microphone"></i><span>${userStats.voice || 0}</span><small>голосовых</small></div>
                <div class="stat-card"><i class="fas fa-fire"></i><span>${userStats.streak || 0}</span><small>дней подряд</small></div>
                <div class="stat-card"><i class="fas fa-clock"></i><span>${Math.floor(totalMessages / 10)}</span><small>часов в чате</small></div>
            </div>
        `;
    }
}

function updateStatsAfterMessage() {
    updateStats();
    checkAchievements('messages');
}

function showStats() {
    updateStats();
    openModal('statsModal');
}

// ========== ЯЗЫКИ ==========
function initLanguageGrid() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    
    grid.innerHTML = Object.entries(languages).map(([code, name]) => `
        <div class="language-item" onclick="setLanguage('${code}')">
            ${name}
        </div>
    `).join('');
}

function setLanguage(code) {
    currentLanguage = code;
    localStorage.setItem('nexora_language', code);
    showNotification(`🌍 Язык изменен на ${languages[code]}`, 'success');
    closeModal('languageModal');
    
    // Простые переводы интерфейса
    const translations = {
        ru: { online: 'онлайн', offline: 'офлайн', group: 'групповой чат', noMessages: 'Нет сообщений' },
        en: { online: 'online', offline: 'offline', group: 'group chat', noMessages: 'No messages' },
        es: { online: 'en línea', offline: 'desconectado', group: 'chat grupal', noMessages: 'No hay mensajes' }
    };
    
    const t = translations[code] || translations.ru;
    document.getElementById('chatStatusText').textContent = t.online;
}

// ========== ТЕМЫ ==========
function loadTheme() {
    const saved = localStorage.getItem('nexora_theme') || 'dark';
    currentTheme = saved;
    applyTheme(saved);
}

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    currentTheme = newTheme;
    applyTheme(newTheme);
    localStorage.setItem('nexora_theme', newTheme);
    showNotification(`${newTheme === 'dark' ? '🌙 Темная' : '☀️ Светлая'} тема`, 'success');
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
}

// ========== ПРОФИЛЬ ==========
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('open');
}

function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAvatar = event.target.result;
                document.getElementById('userAvatar').src = newAvatar;
                document.getElementById('profileAvatar').src = newAvatar;
                currentUser.avatar = newAvatar;
                showNotification('✅ Аватар обновлен!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function insertEmoji() {
    const input = document.getElementById('messageInput');
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    input.value += randomEmoji;
    input.focus();
}

function filterChats(filter) {
    const items = document.querySelectorAll('.chat-item');
    items.forEach(item => {
        const chatId = item.getAttribute('data-chat-id');
        const chat = chatsCache.get(chatId);
        
        if (filter === 'all') {
            item.style.display = 'flex';
        } else if (filter === 'unread') {
            // Для демо показываем чаты с непрочитанными
            item.style.display = 'flex';
        } else if (filter === 'groups') {
            item.style.display = chat?.type === 'group' ? 'flex' : 'none';
        }
    });
}

function updateUnreadCount(chatId) {
    const item = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (item) {
        let badge = item.querySelector('.unread-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'unread-badge';
            item.appendChild(badge);
        }
        const current = parseInt(badge.textContent) || 0;
        badge.textContent = current + 1;
    }
    
    const totalUnread = document.querySelectorAll('.unread-badge').length;
    document.getElementById('unreadCount').textContent = totalUnread;
}

function playNotificationSound() {
    // Просто вибрация для мобильных
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
    }
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
}

// ========== УВЕДОМЛЕНИЯ ==========
let notificationContainer = null;

function createNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}

function showNotification(message, type = 'info') {
    const container = createNotificationContainer();
    const toast = document.createElement('div');
    toast.className = 'notification';
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#6366f1' };
    
    toast.style.borderLeftColor = colors[type];
    toast.innerHTML = `${icons[type]} ${message}`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн`;
    
    return date.toLocaleDateString();
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Инициализация кошелька
document.getElementById('receiveNXR')?.addEventListener('click', () => {
    const address = '0x' + Math.random().toString(36).substr(2, 40);
    document.getElementById('walletAddress').innerHTML = `${address}<button id="copyAddress"><i class="fas fa-copy"></i></button>`;
    showNotification('💰 Адрес скопирован', 'success');
});

document.getElementById('sendNXR')?.addEventListener('click', () => {
    const amount = prompt('Введите сумму NXR для отправки:');
    if (amount && !isNaN(amount) && amount > 0 && amount <= walletBalance) {
        walletBalance -= amount;
        document.getElementById('walletBalance').textContent = walletBalance + ' NXR';
        document.getElementById('walletBalanceLarge').textContent = walletBalance;
        showNotification(`✅ Отправлено ${amount} NXR`, 'success');
    } else {
        showNotification('❌ Недостаточно средств', 'error');
    }
});

// Загрузка сохраненных данных
const savedStats = localStorage.getItem('nexora_stats');
if (savedStats) userStats = JSON.parse(savedStats);

const savedWallet = localStorage.getItem('nexora_wallet');
if (savedWallet) walletBalance = parseInt(savedWallet);

setInterval(() => {
    localStorage.setItem('nexora_stats', JSON.stringify(userStats));
    localStorage.setItem('nexora_wallet', walletBalance);
}, 5000);

console.log('🚀 Nexora Ultimate полностью загружен!');
console.log('✨ 50+ языков | 🎨 NFT | 🤖 AI | 🎬 GIF | 📊 Опросы | 🏆 Достижения | 💰 Кошелек');
