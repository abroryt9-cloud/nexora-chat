const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Раздача статических файлов
app.use(express.static(path.join(__dirname, '../client')));

// ========== ХРАНИЛИЩА ДАННЫХ ==========
const users = new Map(); // userId -> { ws, username, status, avatar, lastActive, bio, email }
const chats = new Map(); // chatId -> { name, type, participants, avatar, createdAt, createdBy }
const messages = new Map(); // chatId -> массив сообщений
const unreadMessages = new Map(); // userId -> Map(chatId -> count)
const pendingUsers = new Map(); // Временное хранение для регистрации

// Генерация уникального ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
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

// ========== ИНИЦИАЛИЗАЦИЯ ТЕСТОВЫХ ДАННЫХ ==========
function initializeTestData() {
    // Тестовые пользователи
    const testUsers = [
        { id: 'user_alex', username: 'Алексей Смирнов', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', email: 'alex@example.com', bio: 'Full-stack разработчик | Люблю код и кофе ☕' },
        { id: 'user_maria', username: 'Мария Иванова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', email: 'maria@example.com', bio: 'UI/UX дизайнер | Создаю красоту ✨' },
        { id: 'user_dmitry', username: 'Дмитрий Волков', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry', email: 'dmitry@example.com', bio: 'Product Manager | Организую процессы 📊' },
        { id: 'user_elena', username: 'Елена Петрова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', email: 'elena@example.com', bio: 'Marketing specialist | Творческий подход 🎨' }
    ];
    
    testUsers.forEach(user => {
        users.set(user.id, {
            ...user,
            ws: null,
            status: 'offline',
            lastActive: null
        });
    });
    
    // Создание чатов
    const chatsData = [
        {
            id: 'chat_personal_1',
            name: 'Алексей Смирнов',
            type: 'personal',
            participants: ['current_user', 'user_alex'],
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            createdAt: new Date().toISOString()
        },
        {
            id: 'chat_group_1',
            name: 'Nexora Team 🚀',
            type: 'group',
            participants: ['current_user', 'user_alex', 'user_maria', 'user_dmitry'],
            avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Nexora',
            createdAt: new Date().toISOString()
        },
        {
            id: 'chat_group_2',
            name: 'Дизайн Бюро 🎨',
            type: 'group',
            participants: ['current_user', 'user_maria', 'user_elena'],
            avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Design',
            createdAt: new Date().toISOString()
        },
        {
            id: 'chat_personal_2',
            name: 'Мария Иванова',
            type: 'personal',
            participants: ['current_user', 'user_maria'],
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
            createdAt: new Date().toISOString()
        }
    ];
    
    chatsData.forEach(chat => {
        chats.set(chat.id, chat);
        messages.set(chat.id, []);
    });
    
    // Тестовые сообщения
    const testMessages = [
        {
            id: generateId(),
            text: 'Добро пожаловать в Nexora! 🎉 Это современный мессенджер с полным функционалом.',
            senderId: 'user_alex',
            senderName: 'Алексей Смирнов',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read',
            reactions: [{ emoji: '🎉', users: ['current_user'] }],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: 'Попробуйте отправить стикер или голосовое сообщение!',
            senderId: 'user_maria',
            senderName: 'Мария Иванова',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: '😊',
            senderId: 'user_dmitry',
            senderName: 'Дмитрий Волков',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: true
        }
    ];
    
    messages.get('chat_group_1').push(...testMessages);
}

// Запуск инициализации
initializeTestData();

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

// Регистрация/логин пользователя
function handleAuth(ws, data) {
    const { username, email, avatar, action } = data;
    
    if (action === 'register') {
        // Проверка существования пользователя
        let existingUser = Array.from(users.values()).find(u => u.email === email);
        if (existingUser) {
            ws.send(JSON.stringify({
                type: 'auth_error',
                data: { message: 'Пользователь с таким email уже существует' }
            }));
            return;
        }
        
        const userId = generateId();
        const newUser = {
            id: userId,
            username: username,
            email: email,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            bio: 'Новый пользователь Nexora',
            status: 'online',
            lastActive: Date.now(),
            ws: ws,
            createdAt: new Date().toISOString()
        };
        
        users.set(userId, newUser);
        
        ws.send(JSON.stringify({
            type: 'auth_success',
            data: { userId, username, avatar: newUser.avatar, token: generateId() }
        }));
        
        // Отправляем список чатов
        setTimeout(() => {
            sendChatsList(userId);
        }, 100);
        
        return userId;
    } 
    else if (action === 'login') {
        // Поиск пользователя по email
        const user = Array.from(users.values()).find(u => u.email === email);
        
        if (!user) {
            ws.send(JSON.stringify({
                type: 'auth_error',
                data: { message: 'Пользователь не найден' }
            }));
            return null;
        }
        
        // Обновляем WebSocket соединение
        user.ws = ws;
        user.status = 'online';
        user.lastActive = Date.now();
        
        ws.send(JSON.stringify({
            type: 'auth_success',
            data: { userId: user.id, username: user.username, avatar: user.avatar, token: generateId() }
        }));
        
        // Отправляем список чатов
        setTimeout(() => {
            sendChatsList(user.id);
        }, 100);
        
        return user.id;
    }
    
    return null;
}

function sendChatsList(userId) {
    const userChats = Array.from(chats.values()).filter(chat => 
        chat.participants.includes(userId)
    );
    
    const userUnread = unreadMessages.get(userId) || new Map();
    const chatsWithUnread = userChats.map(chat => ({
        ...chat,
        unreadCount: userUnread.get(chat.id) || 0
    }));
    
    sendToUser(userId, {
        type: 'chats_list',
        data: chatsWithUnread
    });
}

function handleNewMessage(ws, data) {
    const { chatId, text, senderId, senderName, isVoice = false, isSticker = false, stickerData = null } = data;
    
    const chat = chats.get(chatId);
    if (!chat) return;
    
    const message = {
        id: generateId(),
        text: isSticker ? stickerData : text,
        senderId,
        senderName,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reactions: [],
        edited: false,
        isVoice,
        isSticker,
        voiceUrl: isVoice ? text : null
    };
    
    if (!messages.has(chatId)) {
        messages.set(chatId, []);
    }
    messages.get(chatId).push(message);
    
    // Ограничиваем историю 1000 сообщениями
    if (messages.get(chatId).length > 1000) {
        messages.get(chatId).shift();
    }
    
    broadcastToChat(chatId, {
        type: 'new_message',
        data: { ...message, chatId }
    });
    
    // Увеличиваем счетчик непрочитанных для всех, кроме отправителя
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

function handleEditMessage(ws, data) {
    const { chatId, messageId, newText } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    const message = chatMessages.find(m => m.id === messageId);
    if (message && message.senderId === data.userId) {
        message.text = newText;
        message.edited = true;
        message.editedAt = new Date().toISOString();
        
        broadcastToChat(chatId, {
            type: 'message_edited',
            data: { chatId, messageId, newText, editedAt: message.editedAt }
        });
    }
}

function handleDeleteMessage(ws, data) {
    const { chatId, messageId, userId } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    const index = chatMessages.findIndex(m => m.id === messageId);
    if (index !== -1 && chatMessages[index].senderId === userId) {
        chatMessages.splice(index, 1);
        
        broadcastToChat(chatId, {
            type: 'message_deleted',
            data: { chatId, messageId }
        });
    }
}

function handleReaction(ws, data) {
    const { chatId, messageId, emoji, userId, action } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    const message = chatMessages.find(m => m.id === messageId);
    if (message) {
        if (!message.reactions) message.reactions = [];
        
        if (action === 'add') {
            const existingReaction = message.reactions.find(r => r.emoji === emoji);
            if (existingReaction) {
                if (!existingReaction.users.includes(userId)) {
                    existingReaction.users.push(userId);
                }
            } else {
                message.reactions.push({ emoji, users: [userId] });
            }
        } else if (action === 'remove') {
            const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
            if (reactionIndex !== -1) {
                const reaction = message.reactions[reactionIndex];
                const userIndex = reaction.users.indexOf(userId);
                if (userIndex !== -1) {
                    reaction.users.splice(userIndex, 1);
                    if (reaction.users.length === 0) {
                        message.reactions.splice(reactionIndex, 1);
                    }
                }
            }
        }
        
        broadcastToChat(chatId, {
            type: 'reaction_updated',
            data: { chatId, messageId, reactions: message.reactions }
        });
    }
}

function handleReadReceipt(ws, data) {
    const { chatId, userId, messageId } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    // Сбрасываем непрочитанные
    if (unreadMessages.has(userId)) {
        const userUnread = unreadMessages.get(userId);
        userUnread.delete(chatId);
    }
    
    const messageIndex = chatMessages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        for (let i = 0; i <= messageIndex; i++) {
            if (chatMessages[i].senderId !== userId && chatMessages[i].status !== 'read') {
                chatMessages[i].status = 'read';
                
                sendToUser(chatMessages[i].senderId, {
                    type: 'message_status',
                    data: { messageId: chatMessages[i].id, status: 'read' }
                });
            }
        }
    }
}

function handleTyping(ws, data) {
    const { chatId, userId, isTyping } = data;
    
    broadcastToChat(chatId, {
        type: 'user_typing',
        data: { chatId, userId, isTyping }
    }, userId);
}

function handleGetHistory(ws, data) {
    const { chatId } = data;
    const chatMessages = messages.get(chatId) || [];
    
    ws.send(JSON.stringify({
        type: 'chat_history',
        data: {
            chatId,
            messages: chatMessages
        }
    }));
}

function handleUpdateProfile(ws, data) {
    const { userId, username, bio, avatar } = data;
    const user = users.get(userId);
    
    if (user) {
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (avatar) user.avatar = avatar;
        
        ws.send(JSON.stringify({
            type: 'profile_updated',
            data: { username: user.username, bio: user.bio, avatar: user.avatar }
        }));
        
        // Уведомляем чаты об изменении имени
        const userChats = Array.from(chats.values()).filter(chat => 
            chat.participants.includes(userId)
        );
        
        userChats.forEach(chat => {
            broadcastToChat(chat.id, {
                type: 'user_updated',
                data: { userId, username: user.username, avatar: user.avatar }
            });
        });
    }
}

function handleCreateChat(ws, data) {
    const { name, type, participants, creatorId } = data;
    
    const chatId = generateId();
    const newChat = {
        id: chatId,
        name: name,
        type: type,
        participants: [creatorId, ...participants],
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${chatId}`,
        createdAt: new Date().toISOString(),
        createdBy: creatorId
    };
    
    chats.set(chatId, newChat);
    messages.set(chatId, []);
    
    newChat.participants.forEach(participantId => {
        sendToUser(participantId, {
            type: 'new_chat',
            data: newChat
        });
    });
    
    ws.send(JSON.stringify({
        type: 'chat_created',
        data: newChat
    }));
}

function handleSearchMessages(ws, data) {
    const { chatId, query } = data;
    
    const chatMessages = messages.get(chatId) || [];
    const results = chatMessages.filter(msg => 
        msg.text.toLowerCase().includes(query.toLowerCase())
    );
    
    ws.send(JSON.stringify({
        type: 'search_results',
        data: {
            chatId,
            query,
            results: results.slice(0, 50)
        }
    }));
}

function handleExportChat(ws, data) {
    const { chatId } = data;
    
    const chat = chats.get(chatId);
    const chatMessages = messages.get(chatId) || [];
    
    const exportData = {
        chatName: chat.name,
        exportDate: new Date().toISOString(),
        totalMessages: chatMessages.length,
        messages: chatMessages.map(msg => ({
            sender: msg.senderName,
            text: msg.text,
            timestamp: msg.timestamp,
            isSticker: msg.isSticker,
            isVoice: msg.isVoice
        }))
    };
    
    ws.send(JSON.stringify({
        type: 'chat_export',
        data: exportData
    }));
}

// ========== WEBSOCKET СОЕДИНЕНИЕ ==========
wss.on('connection', (ws) => {
    let currentUserId = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'auth':
                    const userId = handleAuth(ws, data);
                    if (userId) currentUserId = userId;
                    break;
                    
                case 'new_message':
                    handleNewMessage(ws, data);
                    break;
                    
                case 'edit_message':
                    handleEditMessage(ws, data);
                    break;
                    
                case 'delete_message':
                    handleDeleteMessage(ws, data);
                    break;
                    
                case 'reaction':
                    handleReaction(ws, data);
                    break;
                    
                case 'read_receipt':
                    handleReadReceipt(ws, data);
                    break;
                    
                case 'typing':
                    handleTyping(ws, data);
                    break;
                    
                case 'get_history':
                    handleGetHistory(ws, data);
                    break;
                    
                case 'update_profile':
                    handleUpdateProfile(ws, data);
                    break;
                    
                case 'create_chat':
                    handleCreateChat(ws, data);
                    break;
                    
                case 'search_messages':
                    handleSearchMessages(ws, data);
                    break;
                    
                case 'export_chat':
                    handleExportChat(ws, data);
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        if (currentUserId) {
            const user = users.get(currentUserId);
            if (user) {
                user.status = 'offline';
                user.lastActive = Date.now();
                user.ws = null;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Nexora Server запущен на http://localhost:${PORT}`);
    console.log(`📡 WebSocket сервер активен`);
});
