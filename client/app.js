// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let ws = null;
let currentUserId = 'current_user';
let currentUsername = 'Александр';
let currentChatId = null;
let currentUserAvatar = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=45&name=Александр';
let messagesCache = new Map(); // chatId -> массив сообщений
let chatsCache = new Map(); // chatId -> информация о чате
let typingTimeout = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// Эмодзи для выбора
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    setupEventListeners();
    initializeEmojiGrid();
    loadTheme();
});

// ========== WEBSOCKET СОЕДИНЕНИЕ ==========
function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✅ WebSocket соединение установлено');
        
        // Регистрация пользователя
        ws.send(JSON.stringify({
            type: 'register',
            userId: currentUserId,
            username: currentUsername,
            avatar: currentUserAvatar
        }));
        
        showNotification('Соединение установлено', 'success');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        showNotification('Ошибка соединения', 'error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket соединение закрыто');
        showNotification('Соединение потеряно. Переподключение...', 'warning');
        
        // Попытка переподключения через 3 секунды
        setTimeout(() => {
            initializeWebSocket();
        }, 3000);
    };
}

// ========== ОБРАБОТКА СООБЩЕНИЙ ОТ СЕРВЕРА ==========
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'chats_list':
            updateChatsList(data.data);
            break;
            
        case 'chat_history':
            loadMessagesHistory(data.data);
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
            
        case 'user_status':
            updateUserStatus(data.data);
            break;
            
        case 'message_status':
            updateMessageStatus(data.data);
            break;
            
        case 'messages_read':
            markMessagesAsRead(data.data);
            break;
            
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

// ========== ОБНОВЛЕНИЕ СПИСКА ЧАТОВ ==========
function updateChatsList(chats) {
    chatsCache.clear();
    const chatsList = document.getElementById('chatsList');
    chatsList.innerHTML = '';
    
    chats.forEach(chat => {
        chatsCache.set(chat.id, chat);
        
        const lastMessage = getLastMessage(chat.id);
        const unreadCount = chat.unreadCount || 0;
        
        const chatElement = document.createElement('div');
        chatElement.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
        chatElement.setAttribute('data-chat-id', chat.id);
        
        chatElement.innerHTML = `
            <img src="${chat.avatar || 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=52&name=' + encodeURIComponent(chat.name)}" 
                 alt="${chat.name}" 
                 class="chat-avatar-small">
            <div class="chat-info-small">
                <div class="chat-name">${escapeHtml(chat.name)}</div>
                <div class="chat-preview">${lastMessage ? escapeHtml(lastMessage.text.substring(0, 30)) : 'Нет сообщений'}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${lastMessage ? formatTime(lastMessage.timestamp) : ''}</div>
                ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
            </div>
        `;
        
        chatElement.addEventListener('click', () => switchChat(chat.id));
        chatsList.appendChild(chatElement);
    });
}

// Получение последнего сообщения в чате
function getLastMessage(chatId) {
    const messages = messagesCache.get(chatId);
    if (messages && messages.length > 0) {
        return messages[messages.length - 1];
    }
    return null;
}

// ========== ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ЧАТАМИ ==========
function switchChat(chatId) {
    if (currentChatId === chatId) return;
    
    currentChatId = chatId;
    const chat = chatsCache.get(chatId);
    
    if (!chat) return;
    
    // Обновляем UI
    updateChatHeader(chat);
    highlightActiveChat(chatId);
    
    // Загружаем историю сообщений
    loadChatHistory(chatId);
    
    // Отправляем уведомление о прочтении
    sendReadReceipt(chatId);
    
    // Сбрасываем непрочитанные
    clearUnreadCount(chatId);
}

// Обновление заголовка чата
function updateChatHeader(chat) {
    const chatName = document.getElementById('chatName');
    const chatStatus = document.getElementById('chatStatus');
    const chatAvatar = document.getElementById('chatAvatar');
    
    chatName.textContent = chat.name;
    chatStatus.textContent = chat.type === 'group' ? `${chat.participants.length} участников` : 'онлайн';
    chatAvatar.src = chat.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=40&name=${encodeURIComponent(chat.name)}`;
}

// Подсветка активного чата
function highlightActiveChat(chatId) {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        if (item.getAttribute('data-chat-id') === chatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Загрузка истории чата
function loadChatHistory(chatId) {
    ws.send(JSON.stringify({
        type: 'get_history',
        chatId: chatId
    }));
}

// Загрузка сообщений
function loadMessagesHistory(data) {
    const { chatId, messages } = data;
    messagesCache.set(chatId, messages);
    renderMessages(chatId);
}

// Отображение сообщений
function renderMessages(chatId) {
    const messages = messagesCache.get(chatId) || [];
    const messagesArea = document.getElementById('messagesArea');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (!messagesArea) return;
    
    messagesArea.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message, chatId);
        messagesArea.appendChild(messageElement);
    });
    
    // Прокрутка вниз
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Создание элемента сообщения
function createMessageElement(message, chatId) {
    const isOwn = message.senderId === currentUserId;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
    messageDiv.setAttribute('data-message-id', message.id);
    
    let contentHtml = '';
    
    // Стикеры
    if (message.isSticker) {
        contentHtml = `<div class="message-sticker">${message.text}</div>`;
    }
    // Голосовые сообщения
    else if (message.isVoice) {
        contentHtml = `
            <div class="message-voice">
                <button class="voice-play-btn" onclick="playVoiceMessage('${message.voiceUrl}')">
                    <i class="fas fa-play"></i>
                </button>
                <div class="voice-wave">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
                <span>0:00</span>
            </div>
        `;
    }
    // Текстовые сообщения
    else {
        contentHtml = `<div class="message-text">${escapeHtml(message.text)}</div>`;
    }
    
    // Реакции
    let reactionsHtml = '';
    if (message.reactions && message.reactions.length > 0) {
        reactionsHtml = '<div class="message-reactions">';
        message.reactions.forEach(reaction => {
            reactionsHtml += `
                <div class="reaction" onclick="addReaction('${message.id}', '${reaction.emoji}')">
                    ${reaction.emoji}
                    ${reaction.users.length > 1 ? `<span class="reaction-count">${reaction.users.length}</span>` : ''}
                </div>
            `;
        });
        reactionsHtml += '</div>';
    }
    
    // Статус сообщения
    let statusHtml = '';
    if (isOwn) {
        const statusIcon = {
            'sent': 'fa-check',
            'delivered': 'fa-check-double',
            'read': 'fa-check-double'
        };
        const statusColor = message.status === 'read' ? 'var(--success)' : 'var(--text-secondary)';
        statusHtml = `<i class="fas ${statusIcon[message.status] || 'fa-check'}" style="color: ${statusColor}; font-size: 12px;"></i>`;
    }
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${!isOwn && message.senderName ? `<div class="message-sender">${escapeHtml(message.senderName)}</div>` : ''}
            ${contentHtml}
            <div class="message-time">
                <span>${formatTime(message.timestamp)}</span>
                ${message.edited ? '<span class="message-edit-indicator">(ред.)</span>' : ''}
                <span class="message-status">${statusHtml}</span>
            </div>
            ${reactionsHtml}
            <div class="message-menu">
                <button class="message-menu-btn" onclick="showMessageMenu('${message.id}', '${chatId}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `;
    
    return messageDiv;
}

// ========== ОТПРАВКА СООБЩЕНИЙ ==========
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
        isSticker: false
    };
    
    ws.send(JSON.stringify(messageData));
    
    // Оптимистичное обновление UI
    const tempMessage = {
        id: 'temp_' + Date.now(),
        text: text,
        senderId: currentUserId,
        senderName: currentUsername,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reactions: [],
        edited: false,
        isVoice: false,
        isSticker: false
    };
    
    addMessageToUI(tempMessage);
    input.value = '';
    
    // Отправляем статус печатания
    sendTypingStatus(false);
}

// Получение нового сообщения
function receiveNewMessage(data) {
    const { chatId, ...message } = data;
    
    // Сохраняем в кэш
    if (!messagesCache.has(chatId)) {
        messagesCache.set(chatId, []);
    }
    messagesCache.get(chatId).push(message);
    
    // Обновляем UI если это активный чат
    if (currentChatId === chatId) {
        addMessageToUI(message);
        
        // Отправляем подтверждение прочтения
        sendReadReceipt(chatId);
    } else {
        // Увеличиваем счетчик непрочитанных
        updateUnreadCount(chatId);
        
        // Показываем уведомление
        const chat = chatsCache.get(chatId);
        if (chat) {
            showNotification(`Новое сообщение от ${chat.name}`, 'info');
        }
    }
    
    // Обновляем список чатов
    refreshChatsList();
}

// Добавление сообщения в UI
function addMessageToUI(message) {
    const messagesArea = document.getElementById('messagesArea');
    const messageElement = createMessageElement(message, currentChatId);
    messagesArea.appendChild(messageElement);
    
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========== РЕДАКТИРОВАНИЕ И УДАЛЕНИЕ ==========
function editMessage(messageId, newText) {
    if (!newText.trim() || !currentChatId) return;
    
    ws.send(JSON.stringify({
        type: 'edit_message',
        chatId: currentChatId,
        messageId: messageId,
        newText: newText
    }));
}

function updateEditedMessage(data) {
    const { chatId, messageId, newText, editedAt } = data;
    
    if (chatId === currentChatId) {
        const messages = messagesCache.get(chatId);
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.text = newText;
            message.edited = true;
            message.editedAt = editedAt;
            renderMessages(chatId);
        }
    }
}

function deleteMessage(messageId) {
    if (!currentChatId) return;
    
    ws.send(JSON.stringify({
        type: 'delete_message',
        chatId: currentChatId,
        messageId: messageId
    }));
}

function deleteMessageFromUI(data) {
    const { chatId, messageId } = data;
    
    if (chatId === currentChatId) {
        const messages = messagesCache.get(chatId);
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            messages.splice(index, 1);
            renderMessages(chatId);
        }
    }
}

// ========== РЕАКЦИИ ==========
function addReaction(messageId, emoji) {
    ws.send(JSON.stringify({
        type: 'reaction',
        chatId: currentChatId,
        messageId: messageId,
        emoji: emoji,
        userId: currentUserId,
        action: 'add'
    }));
}

function updateMessageReactions(data) {
    const { chatId, messageId, reactions } = data;
    
    if (chatId === currentChatId) {
        const messages = messagesCache.get(chatId);
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.reactions = reactions;
            renderMessages(chatId);
        }
    }
}

// ========== СТАТУС ПЕЧАТАНИЯ ==========
function sendTypingStatus(isTyping) {
    if (!currentChatId) return;
    
    ws.send(JSON.stringify({
        type: 'typing',
        chatId: currentChatId,
        userId: currentUserId,
        isTyping: isTyping
    }));
}

function showTypingIndicator(data) {
    const { chatId, userId, isTyping } = data;
    
    if (chatId === currentChatId && userId !== currentUserId) {
        const typingIndicator = document.getElementById('typingIndicator');
        const typingText = document.getElementById('typingText');
        
        if (isTyping) {
            const user = chatsCache.get(chatId)?.participants?.find(p => p.id === userId);
            typingText.textContent = `${user?.name || 'Кто-то'} печатает...`;
            typingIndicator.style.display = 'block';
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                typingIndicator.style.display = 'none';
            }, 3000);
        } else {
            typingIndicator.style.display = 'none';
        }
    }
}

// ========== СТАТУС ПРОЧТЕНИЯ ==========
function sendReadReceipt(chatId) {
    const messages = messagesCache.get(chatId) || [];
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.senderId !== currentUserId) {
        ws.send(JSON.stringify({
            type: 'read_receipt',
            chatId: chatId,
            userId: currentUserId,
            messageId: lastMessage.id
        }));
    }
}

function markMessagesAsRead(data) {
    const { chatId, readBy, upToMessageId } = data;
    
    if (chatId === currentChatId && readBy !== currentUserId) {
        const messages = messagesCache.get(chatId);
        const upToIndex = messages.findIndex(m => m.id === upToMessageId);
        
        if (upToIndex !== -1) {
            for (let i = 0; i <= upToIndex; i++) {
                if (messages[i].senderId === currentUserId && messages[i].status !== 'read') {
                    messages[i].status = 'read';
                }
            }
            renderMessages(chatId);
        }
    }
}

// ========== ГОЛОСОВЫЕ СООБЩЕНИЯ ==========
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            sendVoiceMessage(audioUrl);
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.classList.add('voice-recording');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        
        showNotification('Запись началась...', 'info');
    } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        showNotification('Не удалось получить доступ к микрофону', 'error');
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
                const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.classList.remove('voice-recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        
        showNotification('Запись завершена, отправка...', 'success');
    }
}

function sendVoiceMessage(audioUrl) {
    if (!currentChatId) return;
    
    // В реальном приложении здесь нужно загрузить аудио на сервер
    // Для демо используем заглушку
    const messageData = {
        type: 'new_message',
        chatId: currentChatId,
        text: audioUrl, // В реальности это URL аудиофайла
        senderId: currentUserId,
        senderName: currentUsername,
        isVoice: true,
        isSticker: false
    };
    
    ws.send(JSON.stringify(messageData));
    
    // Оптимистичное обновление UI
    const tempMessage = {
        id: 'temp_' + Date.now(),
        text: audioUrl,
        senderId: currentUserId,
        senderName: currentUsername,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reactions: [],
        edited: false,
        isVoice: true,
        voiceUrl: audioUrl
    };
    
    addMessageToUI(tempMessage);
}

function playVoiceMessage(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
        showNotification('Не удалось воспроизвести аудио', 'error');
    });
}

// ========== СТИКЕРЫ ==========
function showStickerModal() {
    const modal = document.getElementById('stickerModal');
    modal.classList.add('open');
}

function sendSticker(sticker) {
    if (!currentChatId) return;
    
    const messageData = {
        type: 'new_message',
        chatId: currentChatId,
        text: sticker,
        senderId: currentUserId,
        senderName: currentUsername,
        isVoice: false,
        isSticker: true,
        stickerData: sticker
    };
    
    ws.send(JSON.stringify(messageData));
    
    // Оптимистичное обновление UI
    const tempMessage = {
        id: 'temp_' + Date.now(),
        text: sticker,
        senderId: currentUserId,
        senderName: currentUsername,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reactions: [],
        edited: false,
        isVoice: false,
        isSticker: true
    };
    
    addMessageToUI(tempMessage);
    
    // Закрываем модальное окно
    const modal = document.getElementById('stickerModal');
    modal.classList.remove('open');
}

// ========== ЭМОДЗИ ==========
function showEmojiModal() {
    const modal = document.getElementById('emojiModal');
    modal.classList.add('open');
}

function initializeEmojiGrid() {
    const emojiGrid = document.getElementById('emojiGrid');
    if (!emojiGrid) return;
    
    emojis.forEach(emoji => {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = emoji;
        emojiElement.onclick = () => insertEmoji(emoji);
        emojiGrid.appendChild(emojiElement);
    });
}

function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();
    
    // Закрываем модальное окно
    const modal = document.getElementById('emojiModal');
    modal.classList.remove('open');
}

// ========== КОНТЕКСТНОЕ МЕНЮ ==========
function showMessageMenu(messageId, chatId) {
    // Удаляем существующее контекстное меню
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const message = messagesCache.get(chatId)?.find(m => m.id === messageId);
    if (!message) return;
    
    const isOwn = message.senderId === currentUserId;
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    // Реакции быстрого доступа
    const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    const reactionsHtml = `
        <div style="display: flex; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);">
            ${quickReactions.map(emoji => `
                <div style="cursor: pointer; font-size: 24px; padding: 4px;" onclick="addReaction('${messageId}', '${emoji}'); document.querySelector('.context-menu').remove();">
                    ${emoji}
                </div>
            `).join('')}
        </div>
    `;
    
    let menuHtml = reactionsHtml;
    
    if (isOwn) {
        menuHtml += `
            <div class="context-menu-item" onclick="editMessagePrompt('${messageId}', '${escapeHtml(message.text).replace(/'/g, "\\'")}'); document.querySelector('.context-menu').remove();">
                <i class="fas fa-edit"></i>
                <span>Редактировать</span>
            </div>
            <div class="context-menu-item danger" onclick="deleteMessage('${messageId}'); document.querySelector('.context-menu').remove();">
                <i class="fas fa-trash"></i>
                <span>Удалить</span>
            </div>
        `;
    } else {
        menuHtml += `
            <div class="context-menu-item" onclick="reportMessage('${messageId}'); document.querySelector('.context-menu').remove();">
                <i class="fas fa-flag"></i>
                <span>Пожаловаться</span>
            </div>
        `;
    }
    
    menuHtml += `
        <div class="context-menu-item" onclick="copyMessageText('${escapeHtml(message.text).replace(/'/g, "\\'")}'); document.querySelector('.context-menu').remove();">
            <i class="fas fa-copy"></i>
            <span>Копировать текст</span>
        </div>
    `;
    
    menu.innerHTML = menuHtml;
    
    document.body.appendChild(menu);
    
    // Позиционирование меню
    const event = window.event;
    if (event) {
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        
        // Проверка выхода за границы экрана
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    }
    
    // Закрытие при клике вне меню
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function editMessagePrompt(messageId, currentText) {
    const newText = prompt('Редактировать сообщение:', currentText);
    if (newText && newText !== currentText) {
        editMessage(messageId, newText);
    }
}

function copyMessageText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Текст скопирован', 'success');
    }).catch(() => {
        showNotification('Не удалось скопировать текст', 'error');
    });
}

function reportMessage(messageId) {
    showNotification('Жалоба отправлена модераторам', 'info');
}

// ========== ОБНОВЛЕНИЕ СТАТУСОВ ==========
function updateUserStatus(data) {
    const { userId, status } = data;
    
    // Обновляем статус в списке чатов
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const chatId = item.getAttribute('data-chat-id');
        const chat = chatsCache.get(chatId);
        
        if (chat && chat.type === 'personal' && chat.participants.includes(userId)) {
            const statusText = status === 'online' ? 'онлайн' : 'офлайн';
            if (currentChatId === chatId) {
                document.getElementById('chatStatus').textContent = statusText;
            }
        }
    });
}

function updateMessageStatus(data) {
    const { messageId, status } = data;
    
    // Обновляем статус сообщения в UI
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        const statusSpan = messageElement.querySelector('.message-status');
        if (statusSpan) {
            const statusIcon = {
                'sent': 'fa-check',
                'delivered': 'fa-check-double',
                'read': 'fa-check-double'
            };
            const statusColor = status === 'read' ? 'var(--success)' : 'var(--text-secondary)';
            statusSpan.innerHTML = `<i class="fas ${statusIcon[status]}" style="color: ${statusColor}; font-size: 12px;"></i>`;
        }
    }
}

// ========== УПРАВЛЕНИЕ НЕПРОЧИТАННЫМИ ==========
function updateUnreadCount(chatId) {
    const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (chatItem) {
        let badge = chatItem.querySelector('.unread-badge');
        let currentCount = badge ? parseInt(badge.textContent) : 0;
        const newCount = currentCount + 1;
        
        if (badge) {
            badge.textContent = newCount;
        } else {
            const metaDiv = chatItem.querySelector('.chat-meta');
            if (metaDiv) {
                badge = document.createElement('div');
                badge.className = 'unread-badge';
                badge.textContent = newCount;
                metaDiv.appendChild(badge);
            }
        }
    }
}

function clearUnreadCount(chatId) {
    const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (chatItem) {
        const badge = chatItem.querySelector('.unread-badge');
        if (badge) {
            badge.remove();
        }
    }
}

function refreshChatsList() {
    ws.send(JSON.stringify({
        type: 'get_chats'
    }));
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const colorMap = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#6366f1'
    };
    
    toast.style.borderLeftColor = colorMap[type];
    toast.innerHTML = `
        <i class="fas ${iconMap[type]}" style="color: ${colorMap[type]}; font-size: 20px;"></i>
        <span style="flex: 1;">${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// ========== ПОИСК ==========
function searchChats(query) {
    const chatItems = document.querySelectorAll('.chat-item');
    const searchTerm = query.toLowerCase().trim();
    
    chatItems.forEach(item => {
        const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        const chatPreview = item.querySelector('.chat-preview')?.textContent.toLowerCase() || '';
        
        if (chatName.includes(searchTerm) || chatPreview.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========== ТЕМА ОФОРМЛЕНИЯ ==========
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeSelect = document.getElementById('themeSelect');
    
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else if (theme === 'dark') {
        document.body.classList.remove('light');
    } else if (theme === 'auto') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
        }
    }
    
    localStorage.setItem('theme', theme);
}

// ========== ПАНЕЛЬ ПРОФИЛЯ ==========
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    panel.classList.toggle('open');
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
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ========== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ==========
function setupEventListeners() {
    // Отправка сообщения
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Статус печатания
        let typingTimeout = null;
        messageInput.addEventListener('input', () => {
            if (currentChatId) {
                sendTypingStatus(true);
                
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    sendTypingStatus(false);
                }, 2000);
            }
        });
    }
    
    // Инструменты ввода
    const emojiBtn = document.getElementById('emojiBtn');
    const stickerBtn = document.getElementById('stickerBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const attachBtn = document.getElementById('attachBtn');
    
    if (emojiBtn) emojiBtn.addEventListener('click', showEmojiModal);
    if (stickerBtn) stickerBtn.addEventListener('click', showStickerModal);
    if (voiceBtn) {
        let isMouseDown = false;
        
        voiceBtn.addEventListener('mousedown', () => {
            isMouseDown = true;
            startVoiceRecording();
        });
        
        voiceBtn.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                stopVoiceRecording();
            }
        });
        
        voiceBtn.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                stopVoiceRecording();
            }
        });
    }
    if (attachBtn) attachBtn.addEventListener('click', () => {
        showNotification('Функция загрузки файлов в разработке', 'info');
    });
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchChats(e.target.value);
        });
    }
    
    // Профиль
    const userProfileBtn = document.getElementById('userProfileBtn');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    
    if (userProfileBtn) userProfileBtn.addEventListener('click', toggleProfilePanel);
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', toggleProfilePanel);
    
    // Смена темы
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
    
    // Закрытие модальных окон
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.classList.remove('open');
        });
    });
    
    // Закрытие модалки по клику вне контента
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    });
    
    // Действия в чате
    const searchMessagesBtn = document.getElementById('searchMessagesBtn');
    const chatInfoBtn = document.getElementById('chatInfoBtn');
    const callBtn = document.getElementById('callBtn');
    const videoCallBtn = document.getElementById('videoCallBtn');
    
    if (searchMessagesBtn) {
        searchMessagesBtn.addEventListener('click', () => {
            showNotification('Поиск по сообщениям будет доступен в следующей версии', 'info');
        });
    }
    
    if (chatInfoBtn) {
        chatInfoBtn.addEventListener('click', () => {
            if (currentChatId) {
                const chat = chatsCache.get(currentChatId);
                if (chat) {
                    let info = `Чат: ${chat.name}\nТип: ${chat.type === 'group' ? 'Групповой' : 'Личный'}\n`;
                    if (chat.type === 'group') {
                        info += `Участников: ${chat.participants.length}`;
                    }
                    alert(info);
                }
            }
        });
    }
    
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            showNotification('Аудиозвонки будут доступны в следующей версии', 'info');
        });
    }
    
    if (videoCallBtn) {
        videoCallBtn.addEventListener('click', () => {
            showNotification('Видеозвонки будут доступны в следующей версии', 'info');
        });
    }
    
    // Настройка стикеров
    const stickers = document.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
        sticker.addEventListener('click', () => {
            const stickerValue = sticker.getAttribute('data-sticker') || sticker.textContent;
            sendSticker(stickerValue);
        });
    });
    
    // Обработка кликов на сообщения для реакций
    document.addEventListener('click', (e) => {
        const messageBubble = e.target.closest('.message-bubble');
        if (messageBubble && e.target.classList.contains('message-text')) {
            const messageDiv = messageBubble.closest('.message');
            if (messageDiv) {
                const messageId = messageDiv.getAttribute('data-message-id');
                if (messageId) {
                    // Двойной клик для быстрой реакции
                    if (e.detail === 2) {
                        addReaction(messageId, '👍');
                    }
                }
            }
        }
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
console.log('🚀 Nexora Messenger загружен');
console.log('💡 Советы:');
console.log('   - Двойной клик на сообщение ставит 👍');
console.log('   - Нажмите и удерживайте микрофон для голосового сообщения');
console.log('   - Нажмите на три точки у сообщения для дополнительных действий');
