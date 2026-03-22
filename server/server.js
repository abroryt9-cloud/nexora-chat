const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../client')));

// Хранилища
const users = new Map();
const messages = new Map();
const chats = new Map();

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Отправка пользователю
function sendToUser(userId, data) {
    const user = users.get(userId);
    if (user && user.ws && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(data));
    }
}

// Рассылка в чат
function broadcastToChat(chatId, data, excludeUserId = null) {
    const chat = chats.get(chatId);
    if (!chat) return;
    
    chat.participants.forEach(participantId => {
        if (participantId !== excludeUserId) {
            sendToUser(participantId, data);
        }
    });
}

// Инициализация тестовых данных
function initTestData() {
    // Пользователи
    const testUsers = [
        { id: 'user1', name: 'Алексей', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', status: 'online' },
        { id: 'user2', name: 'Мария', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', status: 'online' },
        { id: 'user3', name: 'Дмитрий', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry', status: 'away' }
    ];
    
    testUsers.forEach(user => {
        users.set(user.id, { ...user, ws: null, lastActive: Date.now() });
    });
    
    // Чаты
    const testChats = [
        { id: 'chat1', name: 'Алексей', type: 'personal', participants: ['current', 'user1'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 'chat2', name: 'Dev Team 🚀', type: 'group', participants: ['current', 'user1', 'user2'], avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dev' },
        { id: 'chat3', name: 'Мария', type: 'personal', participants: ['current', 'user2'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' }
    ];
    
    testChats.forEach(chat => {
        chats.set(chat.id, chat);
        messages.set(chat.id, []);
    });
    
    // Сообщения
    const testMessages = [
        { id: generateId(), text: 'Привет! Добро пожаловать в Nexora! 🎉', senderId: 'user1', senderName: 'Алексей', time: new Date(Date.now() - 3600000).toISOString(), reactions: ['🎉', '❤️'] },
        { id: generateId(), text: 'Это современный мессенджер с крутыми функциями!', senderId: 'user2', senderName: 'Мария', time: new Date(Date.now() - 3500000).toISOString(), reactions: ['👍'] }
    ];
    
    messages.get('chat1').push(...testMessages);
}

initTestData();

// ========== ОБРАБОТЧИКИ ==========
wss.on('connection', (ws) => {
    let currentUserId = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'register':
                    currentUserId = data.userId;
                    users.set(currentUserId, {
                        ...users.get(currentUserId),
                        ws: ws,
                        status: 'online'
                    });
                    
                    // Отправляем список чатов
                    const userChats = Array.from(chats.values()).filter(chat => 
                        chat.participants.includes(currentUserId)
                    );
                    ws.send(JSON.stringify({ type: 'chats', data: userChats }));
                    break;
                    
                case 'get_messages':
                    const chatMessages = messages.get(data.chatId) || [];
                    ws.send(JSON.stringify({ type: 'messages', data: { chatId: data.chatId, messages: chatMessages } }));
                    break;
                    
                case 'new_message':
                    const { chatId, text, senderId, senderName, isSticker, isGif, gifUrl } = data;
                    const newMessage = {
                        id: generateId(),
                        text: isGif ? gifUrl : text,
                        senderId,
                        senderName,
                        time: new Date().toISOString(),
                        reactions: [],
                        isSticker: isSticker || false,
                        isGif: isGif || false,
                        gifUrl: gifUrl || null
                    };
                    
                    if (!messages.has(chatId)) messages.set(chatId, []);
                    messages.get(chatId).push(newMessage);
                    
                    broadcastToChat(chatId, { type: 'new_message', data: { ...newMessage, chatId } });
                    break;
                    
                case 'add_reaction':
                    const { messageId, emoji, userId } = data;
                    const msgList = messages.get(data.chatId);
                    if (msgList) {
                        const msg = msgList.find(m => m.id === messageId);
                        if (msg) {
                            if (!msg.reactions.includes(emoji)) {
                                msg.reactions.push(emoji);
                                broadcastToChat(data.chatId, { type: 'reaction_added', data: { messageId, emoji, userId } });
                            }
                        }
                    }
                    break;
                    
                case 'typing':
                    broadcastToChat(data.chatId, { type: 'user_typing', data: { userId: data.userId, isTyping: data.isTyping } }, data.userId);
                    break;
            }
        } catch (e) {
            console.error('Error:', e);
        }
    });
    
    ws.on('close', () => {
        if (currentUserId) {
            const user = users.get(currentUserId);
            if (user) user.status = 'offline';
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Nexora Ultimate запущен на http://localhost:${PORT}`);
    console.log(`✨ WebSocket активен`);
    console.log(`🎨 50+ языков | NFT | AI | Стикеры | GIF | Реакции`);
});
