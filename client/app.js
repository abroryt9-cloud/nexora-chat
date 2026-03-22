// ========== ГЛОБАЛЬНЫЕ ==========
let currentUser = null;
let currentChatId = null;
let ws = null;
let messagesCache = new Map();
let chatsCache = new Map();
let currentTheme = 'dark';
let currentLanguage = 'ru';
let walletBalance = 1250;
let userNFTs = [];
let userStats = { messages: 0, reactions: 0, stickers: 0, voice: 0, streak: 0 };
let userAchievements = [];

// 50+ языков
const languages = {
    ru: '🇷🇺 Русский', en: '🇬🇧 English', es: '🇪🇸 Español', fr: '🇫🇷 Français', de: '🇩🇪 Deutsch',
    it: '🇮🇹 Italiano', pt: '🇵🇹 Português', nl: '🇳🇱 Nederlands', pl: '🇵🇱 Polski', uk: '🇺🇦 Українська',
    zh: '🇨🇳 中文', ja: '🇯🇵 日本語', ko: '🇰🇷 한국어', ar: '🇸🇦 العربية', hi: '🇮🇳 हिन्दी',
    tr: '🇹🇷 Türkçe', vi: '🇻🇳 Tiếng Việt', th: '🇹🇭 ไทย', id: '🇮🇩 Indonesia', ms: '🇲🇾 Melayu'
};

// Стикеры
const stickerPacks = {
    happy: ['😊', '🥰', '😍', '🤗', '😁', '😆', '😂', '🤣'],
    funny: ['😜', '🤪', '😝', '😛', '🤑', '🤡', '👻', '🎃'],
    love: ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '💟'],
    cool: ['😎', '🔥', '💪', '✨', '⭐', '🌟', '💫', '⚡'],
    animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
};

// GIF (рабочие URL из Tenor)
const gifLibrary = {
    trending: [
        'https://media.tenor.com/2GcJkqH5oEsAAAAC/welcome.gif',
        'https://media.tenor.com/4KvHjRgHnZQAAAAC/hi-hello.gif',
        'https://media.tenor.com/8Bmh5JzNxN4AAAAC/thank-you.gif'
    ],
    funny: [
        'https://media.tenor.com/5B3hJzRgLmMAAAAC/funny-laugh.gif',
        'https://media.tenor.com/9CvHkRgNnP4AAAAC/omg.gif',
        'https://media.tenor.com/2GcJkqH5oEsAAAAC/lol.gif'
    ],
    love: [
        'https://media.tenor.com/2GcJkqH5oEsAAAAC/love.gif',
        'https://media.tenor.com/4KvHjRgHnZQAAAAC/kiss.gif',
        'https://media.tenor.com/8Bmh5JzNxN4AAAAC/heart.gif'
    ]
};

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

// Тестовые NFT
const defaultNFTs = [
    { id: 1, name: 'Космический Кот', image: 'https://api.dicebear.com/7.x/icons/svg?seed=cosmic-cat', value: 500 },
    { id: 2, name: 'Галактический Лис', image: 'https://api.dicebear.com/7.x/icons/svg?seed=galaxy-fox', value: 750 },
    { id: 3, name: 'Звездный Дракон', image: 'https://api.dicebear.com/7.x/icons/svg?seed=star-dragon', value: 1200 }
];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initProgress();
    initEventListeners();
    initLanguageGrid();
    initStickerGrid();
    initGifGrid();
    initNFTGrid();
    initAchievements();
    loadTheme();
    initMobileMenu();
    initAIAssistant();
    loadLocalData();
});

function initProgress() {
    let progress = 0;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('splashText');
    const steps = ['Загрузка модулей...', 'Инициализация AI...', 'Подготовка GIF...', 'Настройка языков...', 'Готово!'];
    const interval = setInterval(() => {
        progress += 1.5;
        if (fill) fill.style.width = Math.min(progress, 100) + '%';
        const idx = Math.floor(progress / 20);
        if (text && steps[idx]) text.textContent = steps[idx];
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
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`${tabName}Form`).classList.add('active');
        });
    });
    // Login
    document.getElementById('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        if (email) loginUser(email);
    });
    // Register
    document.getElementById('registerForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        if (name && email) registerUser(name, email);
    });
    // Demo buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.dataset.email;
            document.getElementById('loginEmail').value = email;
            loginUser(email);
        });
    });
    // Send message
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    // Profile panel
    document.getElementById('profileBtn').addEventListener('click', () => togglePanel('rightPanel'));
    document.getElementById('closePanelBtn').addEventListener('click', () => togglePanel('rightPanel'));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('languageBtn').addEventListener('click', () => openModal('languageModal'));
    document.getElementById('nftMenu').addEventListener('click', () => openModal('nftModal'));
    document.getElementById('walletMenu').addEventListener('click', () => openModal('walletModal'));
    document.getElementById('achievementsMenu').addEventListener('click', () => openModal('achievementsModal'));
    document.getElementById('statsMenu').addEventListener('click', showStats);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    // Tools
    document.getElementById('emojiBtn').addEventListener('click', insertRandomEmoji);
    document.getElementById('stickerBtn').addEventListener('click', () => openModal('stickerModal'));
    document.getElementById('gifBtn').addEventListener('click', () => openModal('gifModal'));
    document.getElementById('voiceBtn').addEventListener('click', startVoiceRecording);
    document.getElementById('pollBtn').addEventListener('click', () => openModal('pollModal'));
    document.getElementById('scheduleBtn').addEventListener('click', showScheduleModal);
    document.getElementById('aiBtn').addEventListener('click', toggleAIPanel);
    // Poll
    document.getElementById('addPollOption').addEventListener('click', addPollOption);
    document.getElementById('createPollBtn').addEventListener('click', createPoll);
    // Schedule
    document.getElementById('scheduleSendBtn').addEventListener('click', scheduleMessage);
    document.querySelectorAll('.schedule-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            const date = new Date(Date.now() + minutes * 60000);
            document.getElementById('scheduleDateTime').value = date.toISOString().slice(0,16);
        });
    });
    // Privacy & Terms
    document.getElementById('privacyMenu').addEventListener('click', () => openModal('privacyModal'));
    document.getElementById('termsMenu').addEventListener('click', () => openModal('termsModal'));
    // Change avatar
    document.getElementById('changeAvatarBtn').addEventListener('click', changeAvatar);
    // Wallet
    document.getElementById('receiveNXR')?.addEventListener('click', () => {
        const address = '0x' + Math.random().toString(36).substr(2, 40);
        document.getElementById('walletAddress').innerHTML = `${address}<button id="copyAddressBtn"><i class="fas fa-copy"></i></button>`;
        document.getElementById('copyAddressBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(address);
            showNotification('Адрес скопирован', 'success');
        });
        showNotification('Новый адрес создан', 'success');
    });
    document.getElementById('sendNXR')?.addEventListener('click', () => {
        const amount = prompt('Сумма NXR для отправки:');
        if (amount && !isNaN(amount) && amount > 0 && amount <= walletBalance) {
            walletBalance -= amount;
            updateWalletUI();
            showNotification(`Отправлено ${amount} NXR`, 'success');
        } else {
            showNotification('Недостаточно средств', 'error');
        }
    });
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterChats(btn.dataset.filter);
        });
    });
    // Search
    document.getElementById('searchInput').addEventListener('input', e => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const name = item.querySelector('.chat-name').textContent.toLowerCase();
            const preview = item.querySelector('.chat-preview').textContent.toLowerCase();
            item.style.display = (name.includes(query) || preview.includes(query)) ? 'flex' : 'none';
        });
    });
}

// ========== АВТОРИЗАЦИЯ ==========
function loginUser(email) {
    const name = email.split('@')[0];
    currentUser = {
        id: 'current',
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        bio: '🌟 Пользователь Nexora'
    };
    updateUserUI();
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initWebSocket();
    loadDemoData();
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

function updateUserUI() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar;
    document.getElementById('profileAvatar').src = currentUser.avatar;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileBio').textContent = currentUser.bio;
}

// ========== WEBSOCKET ==========
function initWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);
    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', userId: currentUser.id }));
        showNotification('🔌 Соединение установлено', 'success');
    };
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
            case 'auth_ok':
                currentUser.name = data.data.name;
                currentUser.avatar = data.data.avatar;
                updateUserUI();
                break;
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
            case 'typing':
                if (currentChatId === data.data.chatId) showTypingIndicator(data.data.isTyping);
                break;
            case 'reaction_added':
                updateMessageReaction(data.data);
                break;
        }
    };
    ws.onerror = () => showNotification('⚠️ Ошибка соединения', 'error');
    ws.onclose = () => setTimeout(initWebSocket, 3000);
}

// ========== ДЕМО ДАННЫЕ (для оффлайн режима) ==========
function loadDemoData() {
    // Mock chats
    const mockChats = [
        { id: 'chat1', name: 'Алексей', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', type: 'personal' },
        { id: 'chat2', name: 'Dev Team 🚀', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dev', type: 'group' },
        { id: 'chat3', name: 'Мария', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', type: 'personal' }
    ];
    chatsCache = new Map(mockChats.map(c => [c.id, c]));
    renderChats();
    // Mock messages
    const mockMessages = {
        chat1: [
            { id: 'msg1', text: 'Привет! Добро пожаловать!', senderId: 'alex', senderName: 'Алексей', time: Date.now() - 3600000, own: false, reactions: [] },
            { id: 'msg2', text: 'Спасибо!', senderId: 'current', senderName: currentUser.name, time: Date.now() - 3500000, own: true, reactions: [] }
        ],
        chat2: [
            { id: 'msg3', text: 'Коллеги, сегодня созвон в 18:00', senderId: 'dmitry', senderName: 'Дмитрий', time: Date.now() - 7200000, own: false, reactions: ['👍'] }
        ],
        chat3: []
    };
    Object.entries(mockMessages).forEach(([chatId, msgs]) => {
        messagesCache.set(chatId, msgs);
    });
}

function renderChats() {
    const container = document.getElementById('chatsList');
    if (!container) return;
    container.innerHTML = '';
    chatsCache.forEach(chat => {
        const msgs = messagesCache.get(chat.id) || [];
        const lastMsg = msgs[msgs.length - 1];
        const div = document.createElement('div');
        div.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
        div.setAttribute('data-chat-id', chat.id);
        div.innerHTML = `
            <img src="${chat.avatar}" class="avatar">
            <div class="chat-info">
                <div class="chat-name">${escapeHtml(chat.name)}</div>
                <div class="chat-preview">${lastMsg ? escapeHtml(lastMsg.text.substring(0,30)) : 'Нет сообщений'}</div>
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
    if (chat) {
        document.getElementById('chatName').textContent = chat.name;
        document.getElementById('chatAvatar').src = chat.avatar;
    }
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-chat-id') === chatId) item.classList.add('active');
    });
    renderMessages();
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    // Отправить запрос на получение сообщений (если есть WebSocket)
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'get_messages', chatId }));
    }
}

function renderMessages() {
    const msgs = messagesCache.get(currentChatId) || [];
    const container = document.getElementById('messagesArea');
    if (!container) return;
    if (msgs.length === 0) {
        container.innerHTML = `<div class="empty-chat"><i class="fas fa-comment-dots"></i><p>Начните общение!</p></div>`;
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
        content = `<img src="${msg.gifUrl}" class="message-gif" onclick="window.open('${msg.gifUrl}','_blank')">`;
    } else if (msg.isPoll) {
        content = createPollHTML(msg);
    } else {
        content = `<div class="message-text">${escapeHtml(msg.text)}</div>`;
    }
    const reactionsHtml = msg.reactions && msg.reactions.length ? 
        `<div class="message-reactions">${msg.reactions.map(r => `<span class="reaction" onclick="addReaction('${msg.id}','${r}')">${r}</span>`).join('')}</div>` : '';
    return `
        <div class="message ${isOwn ? 'message-own' : 'message-other'}">
            <div class="message-bubble">
                ${!isOwn ? `<div style="font-size:12px;font-weight:600;">${escapeHtml(msg.senderName)}</div>` : ''}
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
        id: 'temp_' + Date.now(),
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
    // Send via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: text,
            senderId: currentUser.id,
            senderName: currentUser.name
        }));
    }
    sendTypingStatus(false);
    updateUserStats('messages');
    checkAchievements('messages');
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

function sendTypingStatus(isTyping) {
    if (ws && ws.readyState === WebSocket.OPEN && currentChatId) {
        ws.send(JSON.stringify({ type: 'typing', chatId: currentChatId, userId: currentUser.id, isTyping }));
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

// ========== СТИКЕРЫ ==========
function initStickerGrid() {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;
    const all = [...stickerPacks.happy, ...stickerPacks.funny, ...stickerPacks.love, ...stickerPacks.cool, ...stickerPacks.animals];
    grid.innerHTML = all.map(s => `<div class="sticker" onclick="sendSticker('${s}')">${s}</div>`).join('');
}
function sendSticker(sticker) {
    if (!currentChatId) return;
    const newMsg = {
        id: 'temp_' + Date.now(),
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
    closeModal('stickerModal');
    updateUserStats('stickers');
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
    const all = [...gifLibrary.trending, ...gifLibrary.funny, ...gifLibrary.love];
    grid.innerHTML = all.map(g => `<div class="gif-item" onclick="sendGif('${g}')"><img src="${g}" loading="lazy"></div>`).join('');
}
function sendGif(gifUrl) {
    if (!currentChatId) return;
    const newMsg = {
        id: 'temp_' + Date.now(),
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

// ========== ГОЛОСОВЫЕ ==========
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            sendVoiceMessage(url);
            stream.getTracks().forEach(t => t.stop());
            document.getElementById('voiceBtn').classList.remove('recording');
        };
        mediaRecorder.start();
        isRecording = true;
        document.getElementById('voiceBtn').classList.add('recording');
        showNotification('🎙️ Запись... Отпустите для отправки', 'info');
        setTimeout(() => {
            if (isRecording) stopVoiceRecording();
        }, 60000);
    } catch (err) {
        showNotification('❌ Нет доступа к микрофону', 'error');
    }
}
function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
}
function sendVoiceMessage(url) {
    if (!currentChatId) return;
    const newMsg = {
        id: 'temp_' + Date.now(),
        text: url,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isVoice: true,
        voiceUrl: url
    };
    messagesCache.get(currentChatId).push(newMsg);
    renderMessages();
    updateUserStats('voice');
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'new_message',
            chatId: currentChatId,
            text: url,
            senderId: currentUser.id,
            senderName: currentUser.name,
            isVoice: true
        }));
    }
}

// ========== ОПРОСЫ ==========
let pollOptions = ['', ''];
function addPollOption() {
    pollOptions.push('');
    renderPollOptions();
}
function renderPollOptions() {
    const container = document.getElementById('pollOptionsList');
    if (!container) return;
    container.innerHTML = pollOptions.map((opt, i) => `
        <div class="poll-option-input"><input type="text" placeholder="Вариант ${i+1}" value="${opt}" data-index="${i}">${i>1 ? `<button class="remove-opt" data-index="${i}"><i class="fas fa-times"></i></button>` : ''}</div>
    `).join('');
    document.querySelectorAll('.poll-option-input input').forEach(inp => {
        inp.addEventListener('input', e => pollOptions[parseInt(e.target.dataset.index)] = e.target.value);
    });
    document.querySelectorAll('.remove-opt').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(btn.dataset.index);
            pollOptions.splice(idx,1);
            renderPollOptions();
        });
    });
}
function createPoll() {
    const question = document.getElementById('pollQuestion').value.trim();
    const opts = pollOptions.filter(o => o.trim());
    if (!question || opts.length < 2) {
        showNotification('❌ Введите вопрос и минимум 2 варианта', 'warning');
        return;
    }
    const newMsg = {
        id: 'temp_' + Date.now(),
        text: question,
        senderId: currentUser.id,
        senderName: currentUser.name,
        time: Date.now(),
        own: true,
        reactions: [],
        isPoll: true,
        pollData: {
            question,
            options: opts,
            votes: opts.map(() => []),
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
                const percent = total ? (votes/total*100).toFixed(1) : 0;
                return `
                    <div class="poll-option" onclick="votePoll('${msg.id}',${idx})">
                        <div>${escapeHtml(opt)}</div>
                        <div class="poll-progress"><div class="poll-progress-fill" style="width:${percent}%"></div></div>
                        <div class="poll-stats">${votes} голосов (${percent}%)</div>
                    </div>
                `;
            }).join('')}
            <div class="poll-stats">Всего: ${total}</div>
        </div>
    `;
}
function votePoll(messageId, optIndex) {
    const msgs = messagesCache.get(currentChatId);
    const msg = msgs.find(m => m.id === messageId);
    if (msg && msg.pollData) {
        const hasVoted = msg.pollData.options.some((_,i) => msg.pollData.votes[i]?.includes(currentUser.id));
        if (!hasVoted) {
            if (!msg.pollData.votes[optIndex]) msg.pollData.votes[optIndex] = [];
            msg.pollData.votes[optIndex].push(currentUser.id);
            msg.pollData.totalVotes = (msg.pollData.totalVotes || 0) + 1;
            renderMessages();
            showNotification('✅ Ваш голос учтен', 'success');
        } else {
            showNotification('⚠️ Вы уже голосовали', 'warning');
        }
    }
}

// ========== ОТЛОЖЕННЫЕ ==========
function showScheduleModal() {
    openModal('scheduleModal');
}
function scheduleMessage() {
    const dateTime = document.getElementById('scheduleDateTime').value;
    const text = document.getElementById('scheduleText').value.trim();
    if (!dateTime || !text) {
        showNotification('❌ Заполните поля', 'warning');
        return;
    }
    const time = new Date(dateTime).getTime();
    if (time <= Date.now()) {
        showNotification('⚠️ Укажите будущее время', 'warning');
        return;
    }
    const scheduled = JSON.parse(localStorage.getItem('scheduled_messages') || '[]');
    scheduled.push({
        id: Date.now(),
        chatId: currentChatId,
        text,
        time,
        senderId: currentUser.id,
        senderName: currentUser.name
    });
    localStorage.setItem('scheduled_messages', JSON.stringify(scheduled));
    showNotification(`📅 Сообщение запланировано на ${new Date(time).toLocaleString()}`, 'success');
    closeModal('scheduleModal');
    document.getElementById('scheduleText').value = '';
}
function checkScheduledMessages() {
    const scheduled = JSON.parse(localStorage.getItem('scheduled_messages') || '[]');
    const now = Date.now();
    scheduled.forEach((msg, idx) => {
        if (msg.time <= now) {
            const newMsg = {
                id: 'temp_' + Date.now(),
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
            scheduled.splice(idx,1);
            localStorage.setItem('scheduled_messages', JSON.stringify(scheduled));
        }
    });
}
setInterval(checkScheduledMessages, 60000);

// ========== AI ==========
function initAIAssistant() {
    document.getElementById('sendAiBtn').addEventListener('click', sendAiMessage);
    document.getElementById('aiInput').addEventListener('keypress', e => {
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
    const q = input.value.trim();
    if (!q) return;
    const messagesDiv = document.getElementById('aiMessages');
    messagesDiv.innerHTML += `<div class="ai-message user-message">👤 ${escapeHtml(q)}</div>`;
    input.value = '';
    setTimeout(() => {
        const answer = getAIResponse(q);
        messagesDiv.innerHTML += `<div class="ai-message">🤖 ${answer}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 300);
}
function getAIResponse(q) {
    const lower = q.toLowerCase();
    if (lower.includes('привет') || lower.includes('hello')) return 'Привет! 👋 Как дела?';
    if (lower.includes('как дела')) return 'У меня всё отлично! А у вас? 😊';
    if (lower.includes('помощь')) return 'Я могу: отвечать на вопросы, шутить, показывать время/погоду. Спросите!';
    if (lower.includes('шутка')) return 'Почему программисты не любят природу? Там слишком много багов! 😄';
    if (lower.includes('погода')) return '☀️ Сегодня отличная погода для общения!';
    if (lower.includes('время')) return `🕐 ${new Date().toLocaleTimeString()}`;
    return 'Интересный вопрос! Я ещё учусь, но скоро узнаю ответ. Спросите что-то другое! 🌟';
}

// ========== NFT ==========
function initNFTGrid() {
    const grid = document.getElementById('nftGrid');
    if (!grid) return;
    userNFTs = defaultNFTs;
    grid.innerHTML = userNFTs.map(nft => `
        <div class="nft-card">
            <img src="${nft.image}">
            <div class="nft-info">
                <div class="nft-name">${nft.name}</div>
                <div class="nft-value">💰 ${nft.value} NXR</div>
            </div>
        </div>
    `).join('');
}

// ========== ДОСТИЖЕНИЯ ==========
function initAchievements() {
    const saved = localStorage.getItem('nexora_achievements');
    if (saved) {
        const savedAch = JSON.parse(saved);
        achievementsList.forEach(ach => {
            const found = savedAch.find(a => a.id === ach.id);
            if (found) ach.unlocked = found.unlocked;
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
            ${!ach.unlocked ? '<div class="achievement-progress"><div class="achievement-progress-fill" style="width:0%"></div></div>' : '<div class="achievement-unlocked">✅ Разблокировано</div>'}
        </div>
    `).join('');
}
function checkAchievements(type) {
    let updated = false;
    achievementsList.forEach(ach => {
        if (ach.unlocked) return;
        switch(ach.id) {
            case 'first_msg': if (userStats.messages >= 1) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'msg_100': if (userStats.messages >= 100) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'sticker_lover': if (userStats.stickers >= 50) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'reaction_master': if (userStats.reactions >= 50) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'voice_master': if (userStats.voice >= 10) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'nft_collector': if (userNFTs.length >= 3) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
            case 'streak_7': if (userStats.streak >= 7) { ach.unlocked = true; updated = true; showAchievement(ach); } break;
        }
    });
    if (updated) {
        localStorage.setItem('nexora_achievements', JSON.stringify(achievementsList));
        renderAchievements();
    }
}
function showAchievement(ach) {
    showNotification(`🏆 Достижение: ${ach.name}! ${ach.icon}`, 'success');
}

// ========== СТАТИСТИКА ==========
function updateUserStats(type) {
    userStats[type] = (userStats[type] || 0) + 1;
    if (type === 'messages') userStats.messages++;
    if (type === 'reactions') userStats.reactions++;
    if (type === 'stickers') userStats.stickers++;
    if (type === 'voice') userStats.voice++;
    localStorage.setItem('nexora_stats', JSON.stringify(userStats));
    updateStatsUI();
}
function updateStatsUI() {
    let totalMessages = 0;
    messagesCache.forEach(msgs => totalMessages += msgs.length);
    document.getElementById('statMessages').textContent = totalMessages;
    document.getElementById('statChats').textContent = chatsCache.size;
    document.getElementById('statStreak').textContent = userStats.streak || 0;
    const statsContent = document.getElementById('statsContent');
    if (statsContent) {
        statsContent.innerHTML = `
            <div class="stats-detail">
                <div class="stat-card"><i class="fas fa-comment-dots"></i><span>${totalMessages}</span><small>сообщений</small></div>
                <div class="stat-card"><i class="fas fa-smile"></i><span>${userStats.reactions||0}</span><small>реакций</small></div>
                <div class="stat-card"><i class="fas fa-sticker"></i><span>${userStats.stickers||0}</span><small>стикеров</small></div>
                <div class="stat-card"><i class="fas fa-microphone"></i><span>${userStats.voice||0}</span><small>голосовых</small></div>
            </div>
        `;
    }
}
function updateStatsAfterMessage() {
    updateStatsUI();
    checkAchievements('messages');
}
function showStats() {
    updateStatsUI();
    openModal('statsModal');
}

// ========== ЯЗЫКИ ==========
function initLanguageGrid() {
    const grid = document.getElementById('languageGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(languages).map(([code,name]) => `<div class="language-item" onclick="setLanguage('${code}')">${name}</div>`).join('');
}
function setLanguage(code) {
    currentLanguage = code;
    localStorage.setItem('nexora_language', code);
    showNotification(`🌍 Язык: ${languages[code]}`, 'success');
    closeModal('languageModal');
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
    if (theme === 'light') document.body.classList.add('light');
    else document.body.classList.remove('light');
}

// ========== ПРОФИЛЬ ==========
function togglePanel(panelId) {
    document.getElementById(panelId).classList.toggle('open');
}
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
                const newAvatar = ev.target.result;
                document.getElementById('userAvatar').src = newAvatar;
                document.getElementById('profileAvatar').src = newAvatar;
                currentUser.avatar = newAvatar;
                showNotification('✅ Аватар обновлен', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}
function insertRandomEmoji() {
    const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰'];
    const rand = emojis[Math.floor(Math.random() * emojis.length)];
    const input = document.getElementById('messageInput');
    input.value += rand;
    input.focus();
}
function filterChats(filter) {
    const items = document.querySelectorAll('.chat-item');
    items.forEach(item => {
        const chatId = item.getAttribute('data-chat-id');
        const chat = chatsCache.get(chatId);
        if (filter === 'all') item.style.display = 'flex';
        else if (filter === 'groups') item.style.display = chat?.type === 'group' ? 'flex' : 'none';
        else if (filter === 'unread') item.style.display = 'flex'; // для простоты
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
    const total = document.querySelectorAll('.unread-badge').length;
    document.getElementById('unreadCount').textContent = total;
}
function updateWalletUI() {
    document.getElementById('walletBalance').textContent = walletBalance + ' NXR';
    document.getElementById('walletBalanceLarge').textContent = walletBalance;
    localStorage.setItem('nexora_wallet', walletBalance);
}
function loadLocalData() {
    const savedStats = localStorage.getItem('nexora_stats');
    if (savedStats) userStats = JSON.parse(savedStats);
    const savedWallet = localStorage.getItem('nexora_wallet');
    if (savedWallet) walletBalance = parseInt(savedWallet);
    updateWalletUI();
    updateStatsUI();
}
function playNotificationSound() {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(200);
}
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) container.scrollTop = container.scrollHeight;
}
function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff/60000)} мин`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} ч`;
    return new Date(timestamp).toLocaleDateString();
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function openModal(id) {
    document.getElementById(id).classList.add('open');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}
let notificationContainer = null;
function createNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}
function showNotification(message, type='info') {
    const container = createNotificationContainer();
    const toast = document.createElement('div');
    toast.className = 'notification';
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    toast.innerHTML = `${icons[type]} ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
}
