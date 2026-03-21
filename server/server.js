const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Раздача статических файлов клиента
app.use(express.static(path.join(__dirname, '../client')));

// ========== ХРАНИЛИЩА ДАННЫХ ==========
// Хранение активных пользователей
const users = new Map(); // userId -> { ws, username, status, avatar }

// Хранение всех чатов
const chats = new Map(); // chatId -> { name, type, participants, avatar, createdAt }

// Хранение сообщений по чатам
const messages = new Map(); // chatId -> массив сообщений

// Хранение непрочитанных сообщений
const unreadMessages = new Map(); // userId -> Map(chatId -> count)

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== ИНИЦИАЛИЗАЦИЯ ТЕСТОВЫХ ДАННЫХ ==========
function initializeTestData() {
    // Создание тестовых чатов
    const chat1 = {
        id: 'chat_personal_1',
        name: 'Алексей Смирнов',
        type: 'personal',
        participants: ['current_user', 'user_alex'],
        avatar: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=40&name=Алексей',
        createdAt: new Date().toISOString()
    };
    
    const chat2 = {
        id: 'chat_group_1',
        name: 'Разработчики Nexus',
        type: 'group',
        participants: ['current_user', 'user_alex', 'user_maria', 'user_dmitry'],
        avatar: 'https://ui-avatars.com/api/?background=10b981&color=fff&bold=true&size=40&name=Dev',
        createdAt: new Date().toISOString()
    };
    
    const chat3 = {
        id: 'chat_group_2',
        name: 'Дизайн и Креатив',
        type: 'group',
        participants: ['current_user', 'user_maria', 'user_elena'],
        avatar: 'https://ui-avatars.com/api/?background=f59e0b&color=fff&bold=true&size=40&name=Design',
        createdAt: new Date().toISOString()
    };
    
    const chat4 = {
        id: 'chat_personal_2',
        name: 'Мария Иванова',
        type: 'personal',
        participants: ['current_user', 'user_maria'],
        avatar: 'https://ui-avatars.com/api/?background=ec489a&color=fff&bold=true&size=40&name=Мария',
        createdAt: new Date().toISOString()
    };
    
    chats.set(chat1.id, chat1);
    chats.set(chat2.id, chat2);
    chats.set(chat3.id, chat3);
    chats.set(chat4.id, chat4);
    
    // Тестовые сообщения для личного чата
    const personalMessages = [
        {
            id: generateId(),
            text: 'Привет! Как дела с проектом?',
            senderId: 'user_alex',
            senderName: 'Алексей Смирнов',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: 'Всё отлично! Заканчиваю разработку мессенджера',
            senderId: 'current_user',
            senderName: 'Текущий пользователь',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: 'Круто! Когда покажешь?',
            senderId: 'user_alex',
            senderName: 'Алексей Смирнов',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        }
    ];
    
    // Тестовые сообщения для группового чата
    const groupMessages = [
        {
            id: generateId(),
            text: 'Коллеги, сегодня в 18:00 созвон по спринту',
            senderId: 'user_dmitry',
            senderName: 'Дмитрий Волков',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'read',
            reactions: [{ emoji: '👍', users: ['user_alex', 'user_maria'] }],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: 'Отлично, буду!',
            senderId: 'user_maria',
            senderName: 'Мария Иванова',
            timestamp: new Date(Date.now() - 7100000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        },
        {
            id: generateId(),
            text: 'Тоже подключусь',
            senderId: 'user_alex',
            senderName: 'Алексей Смирнов',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
            status: 'read',
            reactions: [],
            edited: false,
            isVoice: false,
            isSticker: false
        }
    ];
    
    messages.set(chat1.id, personalMessages);
    messages.set(chat2.id, groupMessages);
    messages.set(chat3.id, []);
    messages.set(chat4.id, []);
    
    // Инициализация непрочитанных
    unreadMessages.set('current_user', new Map());
}

// Запуск инициализации
initializeTestData();

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
// Отправка сообщения конкретному пользователю
function sendToUser(userId, data) {
    const user = users.get(userId);
    if (user && user.ws && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(data));
    }
}

// Рассылка всем участникам чата
function broadcastToChat(chatId, data, excludeUserId = null) {
    const chat = chats.get(chatId);
    if (!chat) return;
    
    chat.participants.forEach(participantId => {
        if (participantId !== excludeUserId) {
            sendToUser(participantId, data);
        }
    });
}

// Форматирование сообщения для отправки
function formatMessage(message, chatId) {
    return {
        type: 'new_message',
        data: {
            ...message,
            chatId
        }
    };
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
// Обработка нового сообщения
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
        voiceUrl: isVoice ? text : null // Для голосовых храним URL
    };
    
    // Сохраняем сообщение
    if (!messages.has(chatId)) {
        messages.set(chatId, []);
    }
    messages.get(chatId).push(message);
    
    // Отправляем сообщение всем участникам чата
    broadcastToChat(chatId, {
        type: 'new_message',
        data: {
            ...message,
            chatId
        }
    });
    
    // Обновляем статус для отправителя
    const wsUser = Array.from(users.entries()).find(([_, u]) => u.ws === ws);
    if (wsUser) {
        sendToUser(wsUser[0], {
            type: 'message_status',
            data: { messageId: message.id, status: 'delivered' }
        });
    }
}

// Обработка редактирования сообщения
function handleEditMessage(ws, data) {
    const { chatId, messageId, newText } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    const message = chatMessages.find(m => m.id === messageId);
    if (message) {
        message.text = newText;
        message.edited = true;
        message.editedAt = new Date().toISOString();
        
        broadcastToChat(chatId, {
            type: 'message_edited',
            data: { chatId, messageId, newText, editedAt: message.editedAt }
        });
    }
}

// Обработка удаления сообщения
function handleDeleteMessage(ws, data) {
    const { chatId, messageId } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    const index = chatMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
        chatMessages.splice(index, 1);
        
        broadcastToChat(chatId, {
            type: 'message_deleted',
            data: { chatId, messageId }
        });
    }
}

// Обработка реакции на сообщение
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

// Обработка статуса прочтения
function handleReadReceipt(ws, data) {
    const { chatId, userId, messageId } = data;
    
    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;
    
    // Обновляем статус всех сообщений до этого
    const messageIndex = chatMessages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        for (let i = 0; i <= messageIndex; i++) {
            if (chatMessages[i].senderId !== userId && chatMessages[i].status !== 'read') {
                chatMessages[i].status = 'read';
            }
        }
    }
    
    // Уведомляем отправителей
    const affectedMessages = chatMessages.slice(0, messageIndex + 1);
    const senders = new Set();
    affectedMessages.forEach(msg => {
        if (msg.senderId !== userId) {
            senders.add(msg.senderId);
        }
    });
    
    senders.forEach(senderId => {
        sendToUser(senderId, {
            type: 'messages_read',
            data: { chatId, readBy: userId, upToMessageId: messageId }
        });
    });
}

// Обработка печатания
function handleTyping(ws, data) {
    const { chatId, userId, isTyping } = data;
    
    broadcastToChat(chatId, {
        type: 'user_typing',
        data: { chatId, userId, isTyping }
    }, userId);
}

// Получение истории чата
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

// Получение списка чатов
function handleGetChats(ws, data) {
    const { userId } = data;
    const userChats = Array.from(chats.values()).filter(chat => 
        chat.participants.includes(userId)
    );
    
    // Добавляем непрочитанные
    const userUnread = unreadMessages.get(userId) || new Map();
    const chatsWithUnread = userChats.map(chat => ({
        ...chat,
        unreadCount: userUnread.get(chat.id) || 0
    }));
    
    ws.send(JSON.stringify({
        type: 'chats_list',
        data: chatsWithUnread
    }));
}

// ========== WEBSOCKET СОЕДИНЕНИЕ ==========
wss.on('connection', (ws) => {
    let currentUserId = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'register':
                    // Регистрация пользователя
                    currentUserId = data.userId;
                    users.set(currentUserId, {
                        ws,
                        username: data.username,
                        status: 'online',
                        avatar: data.avatar
                    });
                    
                    // Отправляем список чатов
                    handleGetChats(ws, { userId: currentUserId });
                    
                    // Уведомляем друзей о входе
                    const userChats = Array.from(chats.values()).filter(chat => 
                        chat.participants.includes(currentUserId)
                    );
                    const friends = new Set();
                    userChats.forEach(chat => {
                        chat.participants.forEach(p => {
                            if (p !== currentUserId) friends.add(p);
                        });
                    });
                    
                    friends.forEach(friendId => {
                        sendToUser(friendId, {
                            type: 'user_status',
                            data: { userId: currentUserId, status: 'online' }
                        });
                    });
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
                    
                case 'get_chats':
                    handleGetChats(ws, { userId: currentUserId });
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
            // Обновляем статус
            const user = users.get(currentUserId);
            if (user) {
                user.status = 'offline';
                users.delete(currentUserId);
            }
            
            // Уведомляем друзей о выходе
            const userChats = Array.from(chats.values()).filter(chat => 
                chat.participants.includes(currentUserId)
            );
            const friends = new Set();
            userChats.forEach(chat => {
                chat.participants.forEach(p => {
                    if (p !== currentUserId) friends.add(p);
                });
            });
            
            friends.forEach(friendId => {
                sendToUser(friendId, {
                    type: 'user_status',
                    data: { userId: currentUserId, status: 'offline' }
                });
            });
        }
    });
});

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Nexora Server запущен на http://localhost:${PORT}`);
    console.log(`📡 WebSocket сервер активен`);
});
