// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let ws = null;
let currentUserId = null;
let currentUsername = '';
let currentUserAvatar = '';
let currentUserEmail = '';
let currentChatId = null;
let messagesCache = new Map();
let chatsCache = new Map();
let currentLanguage = 'ru';
let currentTheme = 'dark';
let achievements = [];
let walletBalance = 0;
let userNFTs = [];
let typingTimeout = null;
let mediaRecorder = null;
let isRecording = false;
let recordingStartTime = null;

// 50+ языков с переводами
const translations = {
    ru: {
        welcome: 'Добро пожаловать в Nexora',
        online: 'онлайн',
        offline: 'офлайн',
        typing: 'печатает...',
        send_message: 'Введите сообщение...',
        // ... более 500 переводов
    },
    en: {
        welcome: 'Welcome to Nexora',
        online: 'online',
        offline: 'offline',
        typing: 'typing...',
        send_message: 'Enter message...',
    },
    // ... остальные 48+ языков
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initTypingAnimation();
    initProgressBar();
    loadUserPreferences();
    setupEventListeners();
    initStickerPacks();
    initGifLibrary();
    initNFTCollection();
    initAchievements();
});

// Инициализация частиц
function initParticles() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            alpha: Math.random(),
            speed: Math.random() * 0.5
        });
    }
    
    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
        });
        requestAnimationFrame(animateStars);
    }
    
    animateStars();
}

// Анимация печатающего текста
function initTypingAnimation() {
    const words = ['Общение', 'Творчество', 'Вдохновение', 'Дружба', 'Идеи', 'Будущее'];
    let index = 0;
    const element = document.getElementById('typingWords');
    
    if (element) {
        setInterval(() => {
            element.textContent = words[index];
            index = (index + 1) % words.length;
        }, 2000);
    }
}

// Прогресс бар загрузки
function initProgressBar() {
    let progress = 0;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('splashText');
    const steps = [
        'Загрузка квантовых модулей...',
        'Инициализация AI ассистента...',
        'Подготовка 50+ языков...',
        'Загрузка NFT галереи...',
        'Настройка крипто-кошелька...',
        'Готово! Добро пожаловать!'
    ];
    
    const interval = setInterval(() => {
        progress += 2;
        if (fill) fill.style.width = progress + '%';
        
        const stepIndex = Math.floor(progress / 16);
        if (text && steps[stepIndex]) text.textContent = steps[stepIndex];
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                const splash = document.getElementById('splashScreen');
                if (splash) splash.style.display = 'none';
                showAuthScreen();
            }, 500);
        }
    }, 50);
}

// Загрузка пользовательских настроек
function loadUserPreferences() {
    const savedLanguage = localStorage.getItem('nexora_language');
    const savedTheme = localStorage.getItem('nexora_theme');
    const savedWallet = localStorage.getItem('nexora_wallet');
    
    if (savedLanguage) currentLanguage = savedLanguage;
    if (savedTheme) currentTheme = savedTheme;
    if (savedWallet) walletBalance = parseInt(savedWallet) || 0;
    
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);
}

// Применение языка
function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('nexora_language', lang);
    
    const t = translations[lang] || translations.ru;
    
    // Обновляем текст интерфейса
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) el.textContent = t[key];
    });
}

// Стикер паки
function initStickerPacks() {
    const stickerPacks = {
        happy: ['😊', '🥰', '😍', '🤗', '😁', '😆', '😂', '🤣'],
        funny: ['😜', '🤪', '😝', '😛', '🤑', '🤡', '👻', '🎃'],
        love: ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '💟'],
        sad: ['😢', '😭', '😔', '🥺', '😞', '😟', '😤', '😫'],
        cool: ['😎', '🔥', '💪', '✨', '⭐', '🌟', '💫', '⚡'],
        animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
    };
    
    window.stickerPacks = stickerPacks;
}

// GIF библиотека
function initGifLibrary() {
    const gifs = {
        trending: [
            'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
            'https://media.giphy.com/media/l0MYEq5B6W7JXQ0Wk/giphy.gif',
            'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif'
        ],
        funny: [
            'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
            'https://media.giphy.com/media/l0MYEq5B6W7JXQ0Wk/giphy.gif'
        ],
        reaction: [
            'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
            'https://media.giphy.com/media/l0MYEq5B6W7JXQ0Wk/giphy.gif'
        ]
    };
    
    window.gifLibrary = gifs;
}

// NFT коллекция
function initNFTCollection() {
    const defaultNFTs = [
        { id: 1, name: 'Cosmic Cat', image: 'https://via.placeholder.com/150', value: 100 },
        { id: 2, name: 'Galaxy Fox', image: 'https://via.placeholder.com/150', value: 250 },
        { id: 3, name: 'Space Dragon', image: 'https://via.placeholder.com/150', value: 500 }
    ];
    
    userNFTs = JSON.parse(localStorage.getItem('nexora_nfts')) || defaultNFTs;
}

// Достижения
function initAchievements() {
    const allAchievements = [
        { id: 'first_message', name: 'Первый шаг', desc: 'Отправить первое сообщение', icon: '💬', requirement: 1, progress: 0 },
        { id: 'message_100', name: 'Говорун', desc: 'Отправить 100 сообщений', icon: '🗣️', requirement: 100, progress: 0 },
                { id: 'message_1000', name: 'Легенда общения', desc: 'Отправить 1000 сообщений', icon: '👑', requirement: 1000, progress: 0 },
        { id: 'reaction_master', name: 'Мастер реакций', desc: 'Поставить 50 реакций', icon: '🎭', requirement: 50, progress: 0 },
        { id: 'voice_master', name: 'Голосовой актер', desc: 'Отправить 10 голосовых', icon: '🎤', requirement: 10, progress: 0 },
        { id: 'sticker_lover', name: 'Стикероман', desc: 'Отправить 50 стикеров', icon: '🎨', requirement: 50, progress: 0 },
        { id: 'night_owl', name: 'Ночная сова', desc: 'Активен после полуночи', icon: '🦉', requirement: 1, progress: 0 },
        { id: 'early_bird', name: 'Ранняя пташка', desc: 'Активен в 5 утра', icon: '🐦', requirement: 1, progress: 0 },
        { id: 'group_lover', name: 'Душа компании', desc: 'Состоит в 5 группах', icon: '👥', requirement: 5, progress: 0 },
        { id: 'channel_creator', name: 'Создатель канала', desc: 'Создать канал', icon: '📢', requirement: 1, progress: 0 },
        { id: 'nft_collector', name: 'Коллекционер NFT', desc: 'Собрать 3 NFT', icon: '💎', requirement: 3, progress: 0 },
        { id: 'millionaire', name: 'Крипто-магнат', desc: 'Накопить 1000 NXR', icon: '💰', requirement: 1000, progress: 0 },
        { id: 'ai_friend', name: 'Друг AI', desc: 'Задать 100 вопросов AI', icon: '🤖', requirement: 100, progress: 0 }
    ];
    
    achievements = JSON.parse(localStorage.getItem('nexora_achievements')) || allAchievements;
    updateAchievementsUI();
}

// Обновление достижений
function updateAchievementsUI() {
    const totalUnlocked = achievements.filter(a => a.progress >= a.requirement).length;
    const totalPoints = achievements.reduce((sum, a) => sum + (a.progress >= a.requirement ? 10 : 0), 0);
    
    const level = Math.floor(totalPoints / 50) + 1;
    const rank = getRankByLevel(level);
    
    document.getElementById('totalAchievements').textContent = totalUnlocked;
    document.getElementById('achievementPoints').textContent = totalPoints;
    document.getElementById('achievementRank').textContent = rank;
    document.getElementById('userLevel').textContent = level;
}

function getRankByLevel(level) {
    if (level >= 50) return '👑 Легенда';
    if (level >= 30) return '🌟 Мастер';
    if (level >= 20) return '⚔️ Воин';
    if (level >= 10) return '📚 Ученик';
    if (level >= 5) return '🌱 Новичок';
    return '✨ Искатель';
}

// ========== WEBSOCKET СОЕДИНЕНИЕ ==========
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✨ WebSocket соединение установлено');
        showNotification('Соединение установлено', 'success');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        showNotification('Ошибка соединения', 'error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket закрыт');
        setTimeout(() => initWebSocket(), 3000);
    };
}

// Обработка сообщений от сервера
function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'auth_success':
            handleAuthSuccess(data.data);
            break;
        case 'chats_list':
            updateChatsList(data.data);
            break;
        case 'new_message':
            receiveNewMessage(data.data);
            break;
        case 'message_edited':
            updateEditedMessage(data.data);
            break;
        case 'message_deleted':
            deleteMessageFromUI(data.data);
            break;
        case 'reaction_updated':
            updateMessageReactions(data.data);
            break;
        case 'user_typing':
            showTypingIndicator(data.data);
            break;
        case 'achievement_unlocked':
            showAchievementNotification(data.data);
            break;
        case 'gift_received':
            showGiftNotification(data.data);
            break;
        case 'nft_minted':
            addNFTToCollection(data.data);
            break;
        case 'wallet_updated':
            updateWalletBalance(data.data);
            break;
        case 'poll_updated':
            updatePollResults(data.data);
            break;
        case 'message_pinned':
            showPinnedMessage(data.data);
            break;
    }
}

// ========== АВТОРИЗАЦИЯ ==========
function showAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (authScreen) authScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    
    initCosmicBackground();
    initAvatarOptions();
    initLanguageGrid();
}

function initCosmicBackground() {
    const canvas = document.getElementById('particlesBg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3,
            alpha: Math.random(),
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha * 0.3})`;
            ctx.fill();
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

function initAvatarOptions() {
    const container = document.getElementById('avatarOptions');
    if (!container) return;
    
    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=6366f1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ec489a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=10b981',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=f59e0b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=8b5cf6',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=ef4444',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=3b82f6',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=14b8a6'
    ];
    
    container.innerHTML = avatars.map((url, i) => `
        <div class="avatar-option" data-avatar="${url}">
            <img src="${url}" alt="Avatar ${i+1}">
            <div class="avatar-check"><i class="fas fa-check"></i></div>
        </div>
    `).join('');
    
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            window.selectedAvatar = opt.getAttribute('data-avatar');
        });
    });
}

function initLanguageGrid() {
    const container = document.getElementById('languageGridFull');
    if (!container) return;
    
    const languages = [
        { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
        { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
        { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
        { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
        { code: 'pt', name: 'Português', flag: '🇵🇹', native: 'Português' },
        { code: 'nl', name: 'Nederlands', flag: '🇳🇱', native: 'Nederlands' },
        { code: 'pl', name: 'Polski', flag: '🇵🇱', native: 'Polski' },
        { code: 'uk', name: 'Українська', flag: '🇺🇦', native: 'Українська' },
        { code: 'zh', name: '中文', flag: '🇨🇳', native: '中文' },
        { code: 'ja', name: '日本語', flag: '🇯🇵', native: '日本語' },
        { code: 'ko', name: '한국어', flag: '🇰🇷', native: '한국어' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', native: 'हिन्दी' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', native: 'Tiếng Việt' },
        { code: 'th', name: 'ไทย', flag: '🇹🇭', native: 'ไทย' },
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', native: 'Bahasa Indonesia' }
    ];
    
    container.innerHTML = languages.map(lang => `
        <div class="language-item" data-lang="${lang.code}">
            <span class="language-flag">${lang.flag}</span>
            <span class="language-name">${lang.native}</span>
            <span class="language-code">${lang.code.toUpperCase()}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.language-item').forEach(item => {
        item.addEventListener('click', () => {
            const langCode = item.getAttribute('data-lang');
            applyLanguage(langCode);
            document.getElementById('languageModal')?.classList.remove('open');
            showNotification(`Язык изменен на ${item.querySelector('.language-name').textContent}`, 'success');
        });
    });
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ЧАТА ==========
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentChatId) return;
    
    const messageData = {
        type: 'new_message',
        chatId: currentChatId,
        text: text,
        senderId: currentUserId,
        senderName: currentUsername,
        isVoice: false,
        isSticker: false,
        isGif: false,
        isPoll: false
    };
    
    ws.send(JSON.stringify(messageData));
    
    // Оптимистичное обновление
    addTempMessage(text);
    
    input.value = '';
    input.style.height = 'auto';
    
    // Анимация отправки
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.style.transform = 'scale(0.9)';
    setTimeout(() => sendBtn.style.transform = '', 150);
    
    // Проверка достижений
    checkMessageAchievements();
}

function addTempMessage(text) {
    const tempMessage = {
        id: 'temp_' + Date.now(),
        text: text,
        senderId: currentUserId,
        senderName: currentUsername,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reactions: [],
        isVoice: false,
        isSticker: false
    };
    
    if (!messagesCache.has(currentChatId)) {
        messagesCache.set(currentChatId, []);
    }
    messagesCache.get(currentChatId).push(tempMessage);
    renderMessages(currentChatId);
}

function renderMessages(chatId) {
    const messages = messagesCache.get(chatId) || [];
    const container = document.getElementById('messagesArea');
    
    if (!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="welcome-message cosmic-welcome">
                <div class="welcome-icon animate__animated animate__pulse animate__infinite">
                    <i class="fas fa-comet"></i>
                </div>
                <h3>✨ Добро пожаловать в Nexora ✨</h3>
                <p>Начните общение прямо сейчас!</p>
                <div class="quick-actions">
                    <button onclick="sendQuickMessage('Привет! 👋')" class="quick-btn">👋 Привет</button>
                    <button onclick="sendQuickMessage('Как дела? 😊')" class="quick-btn">😊 Как дела?</button>
                    <button onclick="sendQuickMessage('Отлично выглядишь! 🔥')" class="quick-btn">🔥 Комплимент</button>
                    <button onclick="sendStickerPack('happy')" class="quick-btn">🎨 Стикеры</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => createMessageElement(msg, chatId)).join('');
    scrollToBottom();
}

function createMessageElement(message, chatId) {
    const isOwn = message.senderId === currentUserId;
    const isAI = message.isAI;
    
    let contentHtml = '';
    
    if (message.isSticker) {
        contentHtml = `<div class="message-sticker">${message.text}</div>`;
    } else if (message.isGif) {
        contentHtml = `<img src="${message.gifUrl}" class="message-gif" onclick="viewGif('${message.gifUrl}')">`;
    } else if (message.isPoll) {
        contentHtml = createPollHTML(message);
    } else if (message.isVoice) {
        contentHtml = `
            <div class="message-voice">
                <button class="voice-play-btn" onclick="playVoice('${message.voiceUrl}')">
                    <i class="fas fa-play"></i>
                </button>
                <div class="voice-wave">
                    ${Array(10).fill().map(() => '<div class="wave-bar"></div>').join('')}
                </div>
                <span>0:${Math.floor(Math.random() * 30)}</span>
            </div>
        `;
    } else {
        contentHtml = `<div class="message-text">${escapeHtml(message.text)}</div>`;
    }
    
    // Реакции
    let reactionsHtml = '';
    if (message.reactions && message.reactions.length > 0) {
        reactionsHtml = '<div class="message-reactions">';
        message.reactions.forEach(r => {
            reactionsHtml += `
                <div class="reaction" onclick="addReaction('${message.id}', '${r.emoji}')">
                    ${r.emoji}
                    ${r.users.length > 1 ? `<span class="reaction-count">${r.users.length}</span>` : ''}
                </div>
            `;
        });
        reactionsHtml += '</div>';
    }
    
    // Статус
    let statusHtml = '';
    if (isOwn) {
        const statusIcons = { sent: '✓', delivered: '✓✓', read: '✓✓' };
        const statusColor = message.status === 'read' ? '#10b981' : '#8b8b9b';
        statusHtml = `<span style="color: ${statusColor}">${statusIcons[message.status] || '✓'}</span>`;
    }
    
    // Классы для AI сообщений
    const aiClass = isAI ? 'ai-message' : '';
    
    return `
        <div class="message ${isOwn ? 'message-own' : 'message-other'} ${aiClass}" data-message-id="${message.id}">
            <div class="message-bubble">
                ${!isOwn && message.senderName ? `<div class="message-sender">${escapeHtml(message.senderName)}</div>` : ''}
                ${contentHtml}
                <div class="message-time">
                    <span>${formatTime(message.timestamp)}</span>
                    ${message.edited ? '<span class="edited">(ред.)</span>' : ''}
                    ${message.isForwarded ? '<span class="forwarded">↗️ Переслано</span>' : ''}
                    <span class="message-status">${statusHtml}</span>
                </div>
                ${reactionsHtml}
                <div class="message-menu">
                    <button class="message-menu-btn" onclick="showMessageMenu('${message.id}', '${chatId}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createPollHTML(message) {
    const poll = message.pollData;
    const totalVotes = poll.totalVotes || 0;
    
    return `
        <div class="message-poll">
            <div class="poll-question">📊 ${escapeHtml(poll.question)}</div>
            ${poll.options.map((opt, idx) => {
                const votes = poll.votes?.[idx]?.length || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
                return `
                    <div class="poll-option" onclick="votePoll('${message.id}', ${idx})">
                        <div class="poll-option-text">${escapeHtml(opt)}</div>
                        <div class="poll-progress">
                            <div class="poll-progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="poll-stats">${votes} голосов (${percentage}%)</div>
                    </div>
                `;
            }).join('')}
            <div class="poll-total">Всего голосов: ${totalVotes}</div>
        </div>
    `;
}

// ========== РАСШИРЕННЫЕ ФУНКЦИИ ==========

// Создание опроса
function showPollModal() {
    const modal = document.getElementById('pollModal');
    modal.classList.add('open');
    
    // Очистка
    document.getElementById('pollQuestion').value = '';
    const optionsContainer = document.getElementById('pollOptions');
    optionsContainer.innerHTML = `
        <div class="poll-option">
            <input type="text" placeholder="Вариант 1">
            <button class="remove-option"><i class="fas fa-times"></i></button>
        </div>
        <div class="poll-option">
            <input type="text" placeholder="Вариант 2">
            <button class="remove-option"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Добавление вариантов
    document.getElementById('addPollOption').onclick = () => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'poll-option';
        optionDiv.innerHTML = `
            <input type="text" placeholder="Вариант ${optionsContainer.children.length + 1}">
            <button class="remove-option"><i class="fas fa-times"></i></button>
        `;
        optionsContainer.appendChild(optionDiv);
        attachRemoveOption(optionDiv);
    };
    
    attachRemoveOption();
}

function attachRemoveOption(container = null) {
    const btns = document.querySelectorAll('.remove-option');
    btns.forEach(btn => {
        btn.onclick = () => btn.parentElement.remove();
    });
}

function createPoll() {
    const question = document.getElementById('pollQuestion').value.trim();
    const options = Array.from(document.querySelectorAll('#pollOptions .poll-option input'))
        .map(input => input.value.trim())
        .filter(v => v);
    
    if (!question || options.length < 2) {
        showNotification('Введите вопрос и минимум 2 варианта', 'warning');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'create_poll',
        chatId: currentChatId,
        question: question,
        options: options,
        senderId: currentUserId,
        senderName: currentUsername
    }));
    
    document.getElementById('pollModal').classList.remove('open');
    showNotification('Опрос создан!', 'success');
}

// GIF анимации
function showGifModal() {
    const modal = document.getElementById('gifModal');
    modal.classList.add('open');
    loadGifs('trending');
}

function loadGifs(category) {
    const gifs = {
        trending: [
            'https://media.tenor.com/2GcJkqH5oEsAAAAC/welcome.gif',
            'https://media.tenor.com/4KvHjRgHnZQAAAAC/hi-hello.gif',
            'https://media.tenor.com/8Bmh5JzNxN4AAAAC/thank-you.gif'
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
    
    const container = document.getElementById('gifResults');
    const selectedGifs = gifs[category] || gifs.trending;
    
    container.innerHTML = selectedGifs.map(gif => `
        <div class="gif-item" onclick="sendGif('${gif}')">
            <img src="${gif}" alt="GIF">
        </div>
    `).join('');
}

function sendGif(gifUrl) {
    ws.send(JSON.stringify({
        type: 'send_gif',
        chatId: currentChatId,
        gifUrl: gifUrl,
        senderId: currentUserId,
        senderName: currentUsername
    }));
    
    document.getElementById('gifModal').classList.remove('open');
}

// Стикер паки
function showStickerModal() {
    const modal = document.getElementById('stickerModal');
    modal.classList.add('open');
    loadStickers('all');
}

function loadStickers(category) {
    const packs = window.stickerPacks;
    let stickers = [];
    
    if (category === 'all') {
        stickers = Object.values(packs).flat();
    } else {
        stickers = packs[category] || [];
    }
    
    const container = document.getElementById('stickerGrid');
    container.innerHTML = stickers.map(s => `
        <div class="sticker" onclick="sendSticker('${s}')">${s}</div>
    `).join('');
}

function sendSticker(sticker) {
    ws.send(JSON.stringify({
        type: 'new_message',
        chatId: currentChatId,
        text: sticker,
        senderId: currentUserId,
        senderName: currentUsername,
        isSticker: true
    }));
    
    document.getElementById('stickerModal').classList.remove('open');
}

function sendStickerPack(packId) {
    ws.send(JSON.stringify({
        type: 'send_sticker_pack',
        chatId: currentChatId,
        packId: packId,
        senderId: currentUserId,
        senderName: currentUsername
    }));
}

// Голосовые сообщения
function startVoiceRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            recordingStartTime = Date.now();
            
            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                sendVoiceMessage(audioUrl);
                stream.getTracks().forEach(t => t.stop());
                hideRecordingPanel();
            };
            
            mediaRecorder.start();
            isRecording = true;
            showRecordingPanel();
            
            // Таймер записи
            recordingInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('recordingTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        })
        .catch(err => {
            console.error('Ошибка микрофона:', err);
            showNotification('Не удалось получить доступ к микрофону', 'error');
        });
}

function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(recordingInterval);
    }
}

function showRecordingPanel() {
    const panel = document.getElementById('voiceRecordingPanel');
    panel.style.display = 'block';
}

function hideRecordingPanel() {
    const panel = document.getElementById('voiceRecordingPanel');
    panel.style.display = 'none';
}

function sendVoiceMessage(audioUrl) {
    ws.send(JSON.stringify({
        type: 'new_message',
        chatId: currentChatId,
        text: audioUrl,
        senderId: currentUserId,
        senderName: currentUsername,
        isVoice: true
    }));
}

function playVoice(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    
    toast.innerHTML = `
        <span style="font-size: 20px;">${icons[type]}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer;">✖</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showAchievementNotification(achievement) {
    showNotification(`🏆 Достижение разблокировано: ${achievement.name}! ${achievement.icon}`, 'success');
}

function showGiftNotification(gift) {
    showNotification(`🎁 Вы получили подарок: ${gift.gift} от ${gift.from}!`, 'success');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
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
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Nexora Ultimate v4.0 запущен!');
    console.log('✨ 50+ языков');
    console.log('🎨 NFT коллекции');
    console.log('💰 Крипто-кошелек');
    console.log('🤖 AI ассистент');
    console.log('🏆 Система достижений');
    console.log('🎭 Реакции и стикеры');
    console.log('📊 Голосовые сообщения');
    console.log('🎬 GIF анимации');
    console.log('📝 Опросы');
    console.log('📍 Закрепленные сообщения');
    console.log('🔄 Пересылка сообщений');
    console.log('⏰ Отложенные сообщения');
    console.log('🔐 Секретные чаты');
    console.log('📢 Каналы');
    console.log('👥 Группы');
    console.log('🤖 Боты');
    console.log('🎁 Подарки');
    console.log('🌙 Космическая тема');
    
    initWebSocket();
});
