const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json({ limit: '50mb' }));

// ========== РАСШИРЕННЫЕ ХРАНИЛИЩА ==========
const users = new Map();
const chats = new Map();
const messages = new Map();
const unreadMessages = new Map();
const typingUsers = new Map();
const userPresence = new Map();
const voiceMessages = new Map();
const stickers = new Map();
const themes = new Map();
const scheduledMessages = new Map();
const polls = new Map();
const channels = new Map();
const stories = new Map();
const calls = new Map();
const groups = new Map();
const bots = new Map();
const translations = new Map();
const analytics = new Map();
const achievements = new Map();
const badges = new Map();
const folders = new Map();
const drafts = new Map();
const favorites = new Map();
const blockedUsers = new Map();
const mutedChats = new Map();
const archivedChats = new Map();
const secretChats = new Map();
const wallet = new Map();
const nfts = new Map();
const reactions = new Map();

// ========== AI МОДЕЛИ ==========
const aiResponses = {
    greeting: ['Привет! 👋', 'Здравствуйте! 🌟', 'Рад видеть! ✨', 'Добро пожаловать! 🎉'],
    help: ['Чем могу помочь? 🤔', 'Нужна помощь? 💡', 'Спрашивай! 📝'],
    joke: ['Почему программисты путают Хэллоуин и Рождество? Потому что 31 Oct = 25 Dec! 🎃', 
            'Сколько программистов нужно, чтобы заменить лампочку? Ни одного, это аппаратная проблема! 💡'],
    quote: ['Код — это поэзия! 📖', 'Сделай сегодня то, что другие не хотят, завтра будешь жить так, как другие не могут! 💪']
};

// ========== 50+ ЯЗЫКОВ ==========
const languages = {
    ru: { name: 'Русский', flag: '🇷🇺', native: 'Русский' },
    en: { name: 'English', flag: '🇬🇧', native: 'English' },
    es: { name: 'Español', flag: '🇪🇸', native: 'Español' },
    fr: { name: 'Français', flag: '🇫🇷', native: 'Français' },
    de: { name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
    it: { name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
    pt: { name: 'Português', flag: '🇵🇹', native: 'Português' },
    nl: { name: 'Nederlands', flag: '🇳🇱', native: 'Nederlands' },
    pl: { name: 'Polski', flag: '🇵🇱', native: 'Polski' },
    uk: { name: 'Українська', flag: '🇺🇦', native: 'Українська' },
    zh: { name: '中文', flag: '🇨🇳', native: '中文' },
    ja: { name: '日本語', flag: '🇯🇵', native: '日本語' },
    ko: { name: '한국어', flag: '🇰🇷', native: '한국어' },
    ar: { name: 'العربية', flag: '🇸🇦', native: 'العربية' },
    hi: { name: 'हिन्दी', flag: '🇮🇳', native: 'हिन्दी' },
    tr: { name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
    vi: { name: 'Tiếng Việt', flag: '🇻🇳', native: 'Tiếng Việt' },
    th: { name: 'ไทย', flag: '🇹🇭', native: 'ไทย' },
    id: { name: 'Bahasa Indonesia', flag: '🇮🇩', native: 'Bahasa Indonesia' },
    ms: { name: 'Bahasa Melayu', flag: '🇲🇾', native: 'Bahasa Melayu' },
    fil: { name: 'Filipino', flag: '🇵🇭', native: 'Filipino' },
    sv: { name: 'Svenska', flag: '🇸🇪', native: 'Svenska' },
    da: { name: 'Dansk', flag: '🇩🇰', native: 'Dansk' },
    no: { name: 'Norsk', flag: '🇳🇴', native: 'Norsk' },
    fi: { name: 'Suomi', flag: '🇫🇮', native: 'Suomi' },
    cs: { name: 'Čeština', flag: '🇨🇿', native: 'Čeština' },
    sk: { name: 'Slovenčina', flag: '🇸🇰', native: 'Slovenčina' },
    hu: { name: 'Magyar', flag: '🇭🇺', native: 'Magyar' },
    ro: { name: 'Română', flag: '🇷🇴', native: 'Română' },
    bg: { name: 'Български', flag: '🇧🇬', native: 'Български' },
    sr: { name: 'Српски', flag: '🇷🇸', native: 'Српски' },
    hr: { name: 'Hrvatski', flag: '🇭🇷', native: 'Hrvatski' },
    sl: { name: 'Slovenščina', flag: '🇸🇮', native: 'Slovenščina' },
    lt: { name: 'Lietuvių', flag: '🇱🇹', native: 'Lietuvių' },
    lv: { name: 'Latviešu', flag: '🇱🇻', native: 'Latviešu' },
    et: { name: 'Eesti', flag: '🇪🇪', native: 'Eesti' },
    el: { name: 'Ελληνικά', flag: '🇬🇷', native: 'Ελληνικά' },
    he: { name: 'עברית', flag: '🇮🇱', native: 'עברית' },
    fa: { name: 'فارسی', flag: '🇮🇷', native: 'فارسی' },
    ur: { name: 'اردو', flag: '🇵🇰', native: 'اردو' },
    bn: { name: 'বাংলা', flag: '🇧🇩', native: 'বাংলা' },
    ta: { name: 'தமிழ்', flag: '🇮🇳', native: 'தமிழ்' },
    te: { name: 'తెలుగు', flag: '🇮🇳', native: 'తెలుగు' },
    ml: { name: 'മലയാളം', flag: '🇮🇳', native: 'മലയാളം' },
    kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
    mr: { name: 'मराठी', flag: '🇮🇳', native: 'मराठी' },
    gu: { name: 'ગુજરાતી', flag: '🇮🇳', native: 'ગુજરાતી' },
    pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
    si: { name: 'සිංහල', flag: '🇱🇰', native: 'සිංහල' },
    ne: { name: 'नेपाली', flag: '🇳🇵', native: 'नेपाली' },
    my: { name: 'မြန်မာ', flag: '🇲🇲', native: 'မြန်မာ' },
    km: { name: 'ភាសាខ្មែរ', flag: '🇰🇭', native: 'ភាសាខ្មែរ' },
    lo: { name: 'ລາວ', flag: '🇱🇦', native: 'ລາວ' },
    mn: { name: 'Монгол', flag: '🇲🇳', native: 'Монгол' }
};

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// ========== AI ФУНКЦИИ ==========
function processAIRequest(message, userId, language = 'ru') {
    const msg = message.toLowerCase();
    
    if (msg.includes('привет') || msg.includes('hello') || msg.includes('hi')) {
        return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    }
    
    if (msg.includes('помощь') || msg.includes('help')) {
        return aiResponses.help[Math.floor(Math.random() * aiResponses.help.length)];
    }
    
    if (msg.includes('шутка') || msg.includes('joke')) {
        return aiResponses.joke[Math.floor(Math.random() * aiResponses.joke.length)];
    }
    
    if (msg.includes('цитата') || msg.includes('quote')) {
        return aiResponses.quote[Math.floor(Math.random() * aiResponses.quote.length)];
    }
    
    if (msg.includes('погода') || msg.includes('weather')) {
        return "🌤️ Сегодня отличная погода для общения! ☀️";
    }
    
    if (msg.includes('время') || msg.includes('time')) {
        return `🕐 Текущее время: ${new Date().toLocaleTimeString()}`;
    }
    
    if (msg.includes('дата') || msg.includes('date')) {
        return `📅 Сегодня: ${new Date().toLocaleDateString()}`;
    }
    
    return null;
}

// ========== ФУНКЦИИ ШИФРОВАНИЯ ==========
function encryptMessage(text, key) {
    // Простое шифрование для демо (в реальности использовать AES)
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ (key.charCodeAt(i % key.length) || 0));
    }
    return btoa(result);
}

function decryptMessage(encrypted, key) {
    try {
        let text = atob(encrypted);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ (key.charCodeAt(i % key.length) || 0));
        }
        return result;
    } catch (e) {
        return encrypted;
    }
}

// ========== ФУНКЦИИ АНАЛИТИКИ ==========
function trackAnalytics(userId, event, data = {}) {
    if (!analytics.has(userId)) {
        analytics.set(userId, {
            messages: 0,
            reactions: 0,
            calls: 0,
            stickers: 0,
            voiceMessages: 0,
            activeDays: new Set(),
            lastActive: Date.now()
        });
    }
    
    const stats = analytics.get(userId);
    stats[event] = (stats[event] || 0) + 1;
    stats.activeDays.add(new Date().toDateString());
    stats.lastActive = Date.now();
    
    // Достижения
    checkAchievements(userId, stats);
}

function checkAchievements(userId, stats) {
    const userAchievements = achievements.get(userId) || [];
    
    const newAchievements = [];
    
    if (stats.messages >= 100 && !userAchievements.includes('messenger_100')) {
        newAchievements.push({ id: 'messenger_100', name: '💬 Говорун', description: 'Отправил 100 сообщений', icon: '💬' });
    }
    if (stats.messages >= 1000 && !userAchievements.includes('messenger_1000')) {
        newAchievements.push({ id: 'messenger_1000', name: '👑 Легенда общения', description: 'Отправил 1000 сообщений', icon: '👑' });
    }
    if (stats.reactions >= 50 && !userAchievements.includes('reaction_master')) {
        newAchievements.push({ id: 'reaction_master', name: '🎭 Мастер реакций', description: 'Поставил 50 реакций', icon: '🎭' });
    }
    if (stats.activeDays.size >= 7 && !userAchievements.includes('weekly_warrior')) {
        newAchievements.push({ id: 'weekly_warrior', name: '⚔️ Воин недели', description: 'Активен 7 дней подряд', icon: '⚔️' });
    }
    
    if (newAchievements.length > 0) {
        achievements.set(userId, [...userAchievements, ...newAchievements.map(a => a.id)]);
        
        newAchievements.forEach(achievement => {
            sendToUser(userId, {
                type: 'achievement_unlocked',
                data: achievement
            });
        });
    }
}

// ========== ФУНКЦИИ ДЛЯ КАНАЛОВ ==========
function handleCreateChannel(ws, data) {
    const { name, description, creatorId, isPrivate = false } = data;
    
    const channelId = generateId();
    const channel = {
        id: channelId,
        name,
        description,
        creatorId,
        subscribers: [creatorId],
        isPrivate,
        createdAt: new Date().toISOString(),
        posts: []
    };
    
    channels.set(channelId, channel);
    
    ws.send(JSON.stringify({
        type: 'channel_created',
        data: channel
    }));
}

function handlePostToChannel(ws, data) {
    const { channelId, text, mediaUrl, senderId, senderName } = data;
    
    const channel = channels.get(channelId);
    if (!channel) return;
    
    const post = {
        id: generateId(),
        text,
        mediaUrl,
        senderId,
        senderName,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
        views: 0
    };
    
    channel.posts.unshift(post);
    
    channel.subscribers.forEach(subscriberId => {
        sendToUser(subscriberId, {
            type: 'channel_post',
            data: { channelId, post }
        });
    });
}

// ========== ФУНКЦИИ ДЛЯ ИСТОРИЙ ==========
function handleCreateStory(ws, data) {
    const { userId, mediaUrl, type, text, duration = 24 } = data;
    
    const story = {
        id: generateId(),
        userId,
        mediaUrl,
        type, // image, video, text
        text,
        createdAt: Date.now(),
        expiresAt: Date.now() + (duration * 3600000),
        views: [],
        reactions: []
    };
    
    if (!stories.has(userId)) {
        stories.set(userId, []);
    }
    stories.get(userId).push(story);
    
    // Уведомляем подписчиков
    const user = users.get(userId);
    if (user && user.followers) {
        user.followers.forEach(followerId => {
            sendToUser(followerId, {
                type: 'new_story',
                data: { userId, story }
            });
        });
    }
}

// ========== ФУНКЦИИ ДЛЯ ЗВОНКОВ ==========
function handleCallRequest(ws, data) {
    const { callerId, calleeId, type } = data;
    
    const callId = generateId();
    const call = {
        id: callId,
        callerId,
        calleeId,
        type, // audio, video
        status: 'ringing',
        startedAt: Date.now()
    };
    
    calls.set(callId, call);
    
    sendToUser(calleeId, {
        type: 'incoming_call',
        data: { callId, callerId, type }
    });
    
    ws.send(JSON.stringify({
        type: 'call_initiated',
        data: { callId }
    }));
}

// ========== ФУНКЦИИ ДЛЯ БОТОВ ==========
function handleCreateBot(ws, data) {
    const { name, token, creatorId } = data;
    
    const bot = {
        id: generateId(),
        name,
        token,
        creatorId,
        commands: [],
        createdAt: new Date().toISOString()
    };
    
    bots.set(bot.id, bot);
    
    ws.send(JSON.stringify({
        type: 'bot_created',
        data: bot
    }));
}

function handleBotCommand(ws, data) {
    const { botId, command, chatId, userId } = data;
    
    const bot = bots.get(botId);
    if (!bot) return;
    
    // Простая обработка команд
    let response = '';
    switch(command) {
        case '/ping':
            response = 'pong! 🏓';
            break;
        case '/time':
            response = `🕐 ${new Date().toLocaleTimeString()}`;
            break;
        case '/help':
            response = 'Доступные команды: /ping, /time, /echo [текст]';
            break;
        default:
            if (command.startsWith('/echo')) {
                response = command.replace('/echo', '').trim();
            } else {
                response = 'Неизвестная команда. Используйте /help';
            }
    }
    
    ws.send(JSON.stringify({
        type: 'bot_response',
        data: { chatId, response }
    }));
}

// ========== ФУНКЦИИ ДЛЯ ГРУПП ==========
function handleCreateGroup(ws, data) {
    const { name, description, creatorId, members, avatar } = data;
    
    const groupId = generateId();
    const group = {
        id: groupId,
        name,
        description,
        creatorId,
        admins: [creatorId],
        members: [creatorId, ...members],
        avatar,
        createdAt: new Date().toISOString(),
        settings: {
            onlyAdminsCanSend: false,
            joinRequests: true,
            slowMode: 0
        }
    };
    
    groups.set(groupId, group);
    
    group.members.forEach(memberId => {
        sendToUser(memberId, {
            type: 'group_invite',
            data: group
        });
    });
    
    ws.send(JSON.stringify({
        type: 'group_created',
        data: group
    }));
}

// ========== ФУНКЦИИ ДЛЯ ПЛАТЕЖЕЙ ==========
function handleSendGift(userId, toUserId, giftType) {
    const userWallet = wallet.get(userId) || { balance: 0 };
    const giftPrices = {
        '🎁': 10,
        '💎': 100,
        '🏆': 500,
        '⭐': 5,
        '🌹': 15,
        '🍕': 20
    };
    
    const price = giftPrices[giftType] || 10;
    
    if (userWallet.balance >= price) {
        userWallet.balance -= price;
        wallet.set(userId, userWallet);
        
        const toWallet = wallet.get(toUserId) || { balance: 0 };
        toWallet.balance += price;
        wallet.set(toUserId, toWallet);
        
        sendToUser(toUserId, {
            type: 'gift_received',
            data: { from: userId, gift: giftType }
        });
        
        return true;
    }
    
    return false;
}

// ========== ФУНКЦИИ ДЛЯ NFT ==========
function handleCreateNFT(ws, data) {
    const { userId, name, description, imageUrl } = data;
    
    const nft = {
        id: generateId(),
        name,
        description,
        imageUrl,
        creatorId: userId,
        ownerId: userId,
        createdAt: new Date().toISOString(),
        forSale: false,
        price: 0
    };
    
    if (!nfts.has(userId)) {
        nfts.set(userId, []);
    }
    nfts.get(userId).push(nft);
    
    ws.send(JSON.stringify({
        type: 'nft_created',
        data: nft
    }));
}

// ========== ОСНОВНЫЕ ФУНКЦИИ МЕССЕНДЖЕРА ==========
function sendToUser(userId, data) {
    const user = users.get(userId);
    if (user && user.ws && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(data));
    }
}

function broadcastToChat(chatId, data, excludeUserId = null) {
    const chat = chats.get(chatId);
    if (!chat) return;
    
    chat.participants.forEach(participantId => {
        if (participantId !== excludeUserId) {
            sendToUser(participantId, data);
        }
    });
}

function handleNewMessage(ws, data) {
    const { chatId, text, senderId, senderName, isVoice = false, isSticker = false, isGif = false, gifUrl = null, isPoll = false, pollData = null, replyTo = null, isSecret = false, encryptionKey = null, scheduledTime = null } = data;
    
    const chat = chats.get(chatId);
    if (!chat) return;
    
    let finalText = text;
    
    // Шифрование для секретных чатов
    if (isSecret && encryptionKey) {
        finalText = encryptMessage(text, encryptionKey);
    }
    
    // AI обработка
    const aiResponse = processAIRequest(text, senderId);
    if (aiResponse) {
        setTimeout(() => {
            const aiMessage = {
                id: generateId(),
                text: aiResponse,
                senderId: 'ai_bot',
                senderName: '🤖 AI Assistant',
                timestamp: new Date().toISOString(),
                status: 'sent',
                reactions: [],
                edited: false,
                isVoice: false,
                isSticker: false,
                isGif: false,
                isPoll: false,
                isAI: true
            };
            
            if (!messages.has(chatId)) {
                messages.set(chatId, []);
            }
            messages.get(chatId).push(aiMessage);
            
            broadcastToChat(chatId, {
                type: 'new_message',
                data: { ...aiMessage, chatId }
            });
        }, 500);
    }
    
    const message = {
        id: generateId(),
        text: finalText,
        senderId,
        senderName,
        timestamp: scheduledTime || new Date().toISOString(),
        status: scheduledTime ? 'scheduled' : 'sent',
        reactions: [],
        edited: false,
        isVoice,
        isSticker,
        isGif,
        isPoll,
        isSecret,
        replyTo,
        gifUrl: isGif ? gifUrl : null,
        voiceUrl: isVoice ? text : null,
        pollData: isPoll ? pollData : null,
        views: 0,
        isScheduled: !!scheduledTime
    };
    
    if (scheduledTime) {
        if (!scheduledMessages.has(chatId)) {
            scheduledMessages.set(chatId, []);
        }
        scheduledMessages.get(chatId).push(message);
        
        ws.send(JSON.stringify({
            type: 'message_scheduled',
            data: message
        }));
        return;
    }
    
    if (!messages.has(chatId)) {
        messages.set(chatId, []);
    }
    messages.get(chatId).push(message);
    
    broadcastToChat(chatId, {
        type: 'new_message',
        data: { ...message, chatId }
    });
    
    // Аналитика
    trackAnalytics(senderId, 'messages');
    
    chat.participants.forEach(participantId => {
        if (participantId !== senderId) {
            if (!unreadMessages.has(participantId)) {
                unreadMessages.set(participantId, new Map());
            }
            const userUnread = unreadMessages.get(participantId);
            userUnread.set(chatId, (userUnread.get(chatId) || 0) + 1);
        }
    });
}

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✨ NEXORA ULTIMATE запущен на http://localhost:${PORT}`);
    console.log(`🌍 Поддерживается ${Object.keys(languages).length} языков`);
    console.log(`🤖 AI ассистент активен`);
    console.log(`📊 Система аналитики работает`);
    console.log(`🎨 NFT и крипто-кошелек готов`);
});

// Экспорт функций для WebSocket
module.exports = {
    handleNewMessage,
    handleCreateChannel,
    handleCreateStory,
    handleCallRequest,
    handleCreateBot,
    handleCreateGroup,
    handleSendGift,
    handleCreateNFT
};
