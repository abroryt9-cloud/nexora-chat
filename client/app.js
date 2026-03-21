// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let ws = null;
let currentUserId = null;
let currentUsername = '';
let currentUserAvatar = '';
let currentUserEmail = '';
let currentChatId = null;
let messagesCache = new Map();
let chatsCache = new Map();
let typingTimeout = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingStartTime = null;
let recordingInterval = null;
let selectedAvatar = null;
let reconnectAttempts = 0;
let notificationPermission = false;

// Эмодзи для выбора
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Скрываем сплеш через 2 секунды
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.display = 'none';
        }
        showAuthScreen();
    }, 2000);
    
    setupAuthListeners();
    setupGlobalListeners();
    requestNotificationPermission();
});

// Запрос разрешения на уведомления
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermission = permission === 'granted';
    }
}

// Показать экран авторизации
function showAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (authScreen) {
        authScreen.style.display = 'flex';
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
}

// Скрыть экран авторизации и показать приложение
function hideAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const appContainer = document.getElementById('appContainer');
    const splash = document.getElementById('splashScreen');
    
    if (authScreen) {
        authScreen.style.display = 'none';
    }
    if (appContainer) {
        appContainer.style.display = 'flex';
    }
    if (splash) {
        splash.style.display = 'none';
    }
}

// ========== АВТОРИЗАЦИЯ ==========
function setupAuthListeners() {
    // Переключение табов
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabName}Form`).classList.add('active');
        });
    });
    
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showNotification('Заполните все поля', 'warning');
                return;
            }
            
            loginUser(email, password);
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const termsAgree = document.getElementById('termsAgree').checked;
            
            if (!username || !email || !password) {
                showNotification('Заполните все поля', 'warning');
                return;
            }
            
            if (!termsAgree) {
                showNotification('Примите условия использования', 'warning');
                return;
            }
            
            registerUser(username, email, password);
        });
    }
    
    // Демо-аккаунты
    const demoBtns = document.querySelectorAll('.demo-btn');
    demoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').value = 'demo123';
        });
    });
    
    // Условия использования
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTermsModal();
        });
    }
    
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyModal();
        });
    }
    
    // Выбор аватара при регистрации
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            const avatarNum = option.getAttribute('data-avatar');
            selectedAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarNum}`;
        });
    });
}

function loginUser(email, password) {
    showNotification('Вход...', 'info');
    
    initializeWebSocket();
    
    // Ждем подключения WebSocket
    const checkConnection = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            
            ws.send(JSON.stringify({
                type: 'auth',
                action: 'login',
                email: email,
                password: password
            }));
        }
    }, 100);
}

function registerUser(username, email, password) {
    const avatar = selectedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    
    showNotification('Регистрация...', 'info');
    
    initializeWebSocket();
    
    const checkConnection = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            
            ws.send(JSON.stringify({
                type: 'auth',
                action: 'register',
                username: username,
                email: email,
                password: password,
                avatar: avatar
            }));
        }
    }, 100);
}

// ========== WEBSOCKET СОЕДИНЕНИЕ ==========
function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✅ WebSocket соединение установлено');
        reconnectAttempts = 0;
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
    };
    
    ws.onclose = () => {
        console.log('WebSocket соединение закрыто');
        
        if (currentUserId) {
            showNotification('Соединение потеряно. Переподключение...', 'warning');
            
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, 30000);
            
            setTimeout(() => {
                initializeWebSocket();
            }, delay);
        }
    };
}

// ========== ОБРАБОТКА СООБЩЕНИЙ ОТ СЕРВЕРА ==========
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'auth_success':
            handleAuthSuccess(data.data);
            break;
            
        case 'auth_error':
            showNotification(data.data.message, 'error');
            break;
            
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
            
        case 'message_status':
            updateMessageStatus(data.data);
            break;
            
        case 'profile_updated':
            updateProfileUI(data.data);
            break;
            
        case 'new_chat':
            handleNewChat(data.data);
            break;
            
        case 'chat_created':
            showNotification(`Чат "${data.data.name}" создан!`, 'success');
            refreshChatsList();
            break;
            
        case 'search_results':
            showSearchResults(data.data);
            break;
            
        case 'chat_export':
            downloadChatExport(data.data);
            break;
            
        case 'user_updated':
            updateUserInChats(data.data);
            break;
            
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

function handleAuthSuccess(data) {
    currentUserId = data.userId;
    currentUsername = data.username;
    currentUserAvatar = data.avatar;
    currentUserEmail = data.email || '';
    
    // Обновляем UI
    document.getElementById('userName').textContent = currentUsername;
    document.getElementById('userAvatar').src = currentUserAvatar;
    document.getElementById('profileAvatar').src = currentUserAvatar;
    document.getElementById('editUsername').value = currentUsername;
    
    // Скрываем авторизацию, показываем приложение
    hideAuthScreen();
    
    showNotification(`Добро пожаловать, ${currentUsername}!`, 'success');
    
    // Загружаем чаты
    refreshChatsList();
}

// ========== УПРАВЛЕНИЕ ЧАТАМИ ==========
function updateChatsList(chats) {
    chatsCache.clear();
    const chatsList = document.getElementById('chatsList');
    
    if (!chats || chats.length === 0) {
        chatsList.innerHTML = `
            <div class="loading-chats">
                <p>Нет чатов</p>
                <button class="create-chat-btn" onclick="showCreateChatModal()">Создать чат</button>
            </div>
        `;
        return;
    }
    
    chatsList.innerHTML = '';
    
    chats.forEach(chat => {
        chatsCache.set(chat.id, chat);
        
        const lastMessage = getLastMessage(chat.id);
        const unreadCount = chat.unreadCount || 0;
        
        const chatElement = document.createElement('div');
        chatElement.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
        chatElement.setAttribute('data-chat-id', chat.id);
        
        chatElement.innerHTML = `
            <img src="${chat.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + chat.id}" 
                 alt="${escapeHtml(chat.name)}" 
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
    
    // Обновляем статистику в профиле
    updateProfileStats();
}

function getLastMessage(chatId) {
    const messages = messagesCache.get(chatId);
    if (messages && messages.length > 0) {
        return messages[messages.length - 1];
    }
    return null;
}

function switchChat(chatId) {
    if (currentChatId === chatId) return;
    
    currentChatId = chatId;
    const chat = chatsCache.get(chatId);
    
    if (!chat) return;
    
    // Обновляем UI
    updateChatHeader(chat);
    highlightActiveChat(chatId);
    
    // Загружаем историю
    loadChatHistory(chatId);
    
    // Отправляем уведомление о прочтении
    sendReadReceipt(chatId);
    
    // Сбрасываем непрочитанные
    clearUnreadCount(chatId);
}

function updateChatHeader(chat) {
    const chatName = document.getElementById('chatName');
    const chatStatus = document.getElementById('chatStatus');
    const chatAvatar = document.getElementById('chatAvatar');
    
    chatName.textContent = chat.name;
    
    if (chat.type === 'group') {
        chatStatus.textContent = `${chat.participants?.length || 0} участников`;
    } else {
        chatStatus.textContent = 'онлайн';
    }
    
    chatAvatar.src = chat.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat.id}`;
}

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

function loadChatHistory(chatId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'get_history',
            chatId: chatId
        }));
    }
}

function loadMessagesHistory(data) {
    const { chatId, messages } = data;
    messagesCache.set(chatId, messages);
    renderMessages(chatId);
}

function refreshChatsList() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'get_chats'
        }));
    }
}

// ========== ОТОБРАЖЕНИЕ СООБЩЕНИЙ ==========
function renderMessages(chatId) {
    const messages = messagesCache.get(chatId) || [];
    const messagesArea = document.getElementById('messagesArea');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (!messagesArea) return;
    
    if (messages.length === 0) {
        messagesArea.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-comment-dots"></i>
                </div>
                <h3>Нет сообщений</h3>
                <p>Напишите первое сообщение в этом чате!</p>
            </div>
        `;
        return;
    }
    
    messagesArea.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message, chatId);
        messagesArea.appendChild(messageElement);
    });
    
    // Прокрутка вниз с плавной анимацией
    if (messagesContainer) {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function createMessageElement(message, chatId) {
    const isOwn = message.senderId === currentUserId;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
    messageDiv.setAttribute('data-message-id', message.id);
    
    let contentHtml = '';
    
    if (message.isSticker) {
        contentHtml = `<div class="message-sticker">${message.text}</div>`;
    }
    else if (message.isVoice) {
        contentHtml = `
            <div class="message-voice">
                <button class="voice-play-btn" onclick="playVoiceMessage('${message.voiceUrl || message.text}')">
                    <i class="fas fa-play"></i>
                </button>
                <div class="voice-wave">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
                <span>0:30</span>
            </div>
        `;
    }
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
    
    // Статус
    let statusHtml = '';
    if (isOwn) {
        const statusIcon = {
            'sent': 'fa-check',
            'delivered': 'fa-check-double',
            'read': 'fa-check-double'
        };
        const statusColor = message.status === 'read' ? 'var(--success)' : 'var(--text-secondary)';
        statusHtml = `<i class="fas ${statusIcon[message.status] || 'fa-check'}" style="color: ${statusColor};"></i>`;
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

function addMessageToUI(message) {
    const messagesArea = document.getElementById('messagesArea');
    const welcomeMessage = messagesArea.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageElement = createMessageElement(message, currentChatId);
    messagesArea.appendChild(messageElement);
    
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
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
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messageData));
    }
    
    // Оптимистичное обновление
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
    
    if (!messagesCache.has(currentChatId)) {
        messagesCache.set(currentChatId, []);
    }
    messagesCache.get(currentChatId).push(tempMessage);
    addMessageToUI(tempMessage);
    
    input.value = '';
    sendTypingStatus(false);
    
    // Анимация отправки
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        sendBtn.style.transform = '';
    }, 150);
}

function receiveNewMessage(data) {
    const { chatId, ...message } = data;
    
    if (!messagesCache.has(chatId)) {
        messagesCache.set(chatId, []);
    }
    messagesCache.get(chatId).push(message);
    
    if (currentChatId === chatId) {
        addMessageToUI(message);
        sendReadReceipt(chatId);
    } else {
        updateUnreadCount(chatId);
        
        // Показываем уведомление
        const chat = chatsCache.get(chatId);
        if (chat && notificationPermission) {
            new Notification(`Новое сообщение от ${chat.name}`, {
                body: message.text.substring(0, 100),
                icon: chat.avatar,
                silent: false
            });
        }
        
        showNotification(`Новое сообщение от ${chat?.name || 'Неизвестный'}`, 'info');
    }
    
    refreshChatsList();
}

// ========== РЕДАКТИРОВАНИЕ И УДАЛЕНИЕ ==========
function editMessage(messageId, newText) {
    if (!newText.trim() || !currentChatId) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'edit_message',
            chatId: currentChatId,
            messageId: messageId,
            newText: newText,
            userId: currentUserId
        }));
    }
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
            showNotification('Сообщение отредактировано', 'success');
        }
    }
}

function deleteMessage(messageId) {
    if (!currentChatId) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'delete_message',
            chatId: currentChatId,
            messageId: messageId,
            userId: currentUserId
        }));
    }
}

function deleteMessageFromUI(data) {
    const { chatId, messageId } = data;
    
    if (chatId === currentChatId) {
        const messages = messagesCache.get(chatId);
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            messages.splice(index, 1);
            renderMessages(chatId);
            showNotification('Сообщение удалено', 'info');
        }
    }
}

// ========== РЕАКЦИИ ==========
function addReaction(messageId, emoji) {
    if (!currentChatId) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'reaction',
            chatId: currentChatId,
            messageId: messageId,
            emoji: emoji,
            userId: currentUserId,
            action: 'add'
        }));
    }
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
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'typing',
            chatId: currentChatId,
            userId: currentUserId,
            isTyping: isTyping
        }));
    }
}

function showTypingIndicator(data) {
    const { chatId, userId, isTyping } = data;
    
    if (chatId === currentChatId && userId !== currentUserId) {
        const typingIndicator = document.getElementById('typingIndicator');
        const typingText = document.getElementById('typingText');
        
        if (isTyping) {
            const chat = chatsCache.get(chatId);
            const user = chat?.participants?.find(p => p === userId);
            typingText.textContent = `${chat?.name || 'Кто-то'} печатает...`;
            typingIndicator.style.display = 'flex';
            
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
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'read_receipt',
                chatId: chatId,
                userId: currentUserId,
                messageId: lastMessage.id
            }));
        }
    }
}

function updateMessageStatus(data) {
    const { messageId, status } = data;
    
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
            statusSpan.innerHTML = `<i class="fas ${statusIcon[status]}" style="color: ${statusColor};"></i>`;
        }
    }
}

// ========== ГОЛОСОВЫЕ СООБЩЕНИЯ ==========
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingStartTime = Date.now();
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
            sendVoiceMessage(audioUrl, duration);
            stream.getTracks().forEach(track => track.stop());
            
            // Скрываем панель записи
            document.getElementById('voiceRecordingPanel').style.display = 'none';
            clearInterval(recordingInterval);
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Показываем панель записи
        const panel = document.getElementById('voiceRecordingPanel');
        panel.style.display = 'block';
        
        // Обновляем таймер
        recordingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('recordingTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.classList.add('voice-recording');
        
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
    }
}

function sendVoiceMessage(audioUrl, duration) {
    if (!currentChatId) return;
    
    const messageData = {
        type: 'new_message',
        chatId: currentChatId,
        text: audioUrl,
        senderId: currentUserId,
        senderName: currentUsername,
        isVoice: true,
        isSticker: false
    };
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messageData));
    }
    
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
        voiceUrl: audioUrl,
        duration: duration
    };
    
    if (!messagesCache.has(currentChatId)) {
        messagesCache.set(currentChatId, []);
    }
    messagesCache.get(currentChatId).push(tempMessage);
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
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messageData));
    }
    
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
    
    if (!messagesCache.has(currentChatId)) {
        messagesCache.set(currentChatId, []);
    }
    messagesCache.get(currentChatId).push(tempMessage);
    addMessageToUI(tempMessage);
    
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
    
    emojiGrid.innerHTML = '';
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
    
    const modal = document.getElementById('emojiModal');
    modal.classList.remove('open');
}

// ========== КОНТЕКСТНОЕ МЕНЮ ==========
function showMessageMenu(messageId, chatId) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
    
    const message = messagesCache.get(chatId)?.find(m => m.id === messageId);
    if (!message) return;
    
    const isOwn = message.senderId === currentUserId;
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    const reactionsHtml = `
        <div style="display: flex; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);">
            ${quickReactions.map(emoji => `
                <div style="cursor: pointer; font-size: 24px; padding: 4px; transition: transform 0.1s;" 
                     onmouseover="this.style.transform='scale(1.2)'" 
                     onmouseout="this.style.transform='scale(1)'"
                     onclick="addReaction('${messageId}', '${emoji}'); document.querySelector('.context-menu').remove();">
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
    
    const event = window.event;
    if (event) {
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    }
    
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

// ========== СОЗДАНИЕ ЧАТА ==========
function showCreateChatModal() {
    const modalHtml = `
        <div class="modal" id="createChatModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Создать новый чат</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px;">Тип чата</label>
                        <select id="chatType" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: none; border-radius: 12px; color: var(--text-primary);">
                            <option value="personal">Личный чат</option>
                            <option value="group">Групповой чат</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px;">Название чата</label>
                        <input type="text" id="chatName" placeholder="Введите название..." style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: none; border-radius: 12px; color: var(--text-primary);">
                    </div>
                    <div id="participantsSection" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px;">Участники</label>
                        <select id="participants" multiple style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: none; border-radius: 12px; color: var(--text-primary); min-height: 120px;">
                            <option value="user_alex">Алексей Смирнов</option>
                            <option value="user_maria">Мария Иванова</option>
                            <option value="user_dmitry">Дмитрий Волков</option>
                            <option value="user_elena">Елена Петрова</option>
                        </select>
                        <small style="color: var(--text-secondary);">Для выбора нескольких участников зажмите Ctrl (Cmd)</small>
                    </div>
                    <button onclick="createNewChat()" style="width: 100%; padding: 14px; background: var(--accent-color); border: none; border-radius: 12px; color: white; cursor: pointer; font-weight: 600;">
                        Создать чат
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('createChatModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('createChatModal');
    modal.classList.add('open');
    
    const chatTypeSelect = document.getElementById('chatType');
    const participantsSection = document.getElementById('participantsSection');
    
    chatTypeSelect.addEventListener('change', (e) => {
        participantsSection.style.display = e.target.value === 'personal' ? 'none' : 'block';
    });
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('open');
    };
}

function createNewChat() {
    const chatType = document.getElementById('chatType').value;
    const chatName = document.getElementById('chatName').value.trim();
    
    if (!chatName) {
        showNotification('Введите название чата', 'warning');
        return;
    }
    
    let participants = [];
    if (chatType === 'group') {
        const participantsSelect = document.getElementById('participants');
        participants = Array.from(participantsSelect.selectedOptions).map(opt => opt.value);
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'create_chat',
            name: chatName,
            type: chatType,
            participants: participants,
            creatorId: currentUserId
        }));
    }
    
    const modal = document.getElementById('createChatModal');
    modal.classList.remove('open');
    showNotification('Создание чата...', 'info');
}

function handleNewChat(chat) {
    if (!chatsCache.has(chat.id)) {
        chatsCache.set(chat.id, chat);
        refreshChatsList();
        showNotification(`Новый чат: ${chat.name}`, 'success');
    }
}

// ========== ПОИСК И ЭКСПОРТ ==========
function searchInChat() {
    const query = prompt('Введите текст для поиска:');
    if (!query || !currentChatId) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'search_messages',
            chatId: currentChatId,
            query: query
        }));
    }
    showNotification(`Поиск: "${query}"...`, 'info');
}

function showSearchResults(data) {
    const modalHtml = `
        <div class="modal" id="searchResultsModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Результаты поиска: "${data.query}"</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                    <div id="searchResultsList"></div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('searchResultsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const resultsList = document.getElementById('searchResultsList');
    
    if (!data.results || data.results.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Ничего не найдено</p>';
    } else {
        resultsList.innerHTML = data.results.map(msg => `
            <div style="padding: 12px; margin-bottom: 8px; background: var(--bg-tertiary); border-radius: 12px; cursor: pointer; transition: all 0.2s;" 
                 onmouseover="this.style.transform='translateX(5px)'" 
                 onmouseout="this.style.transform='translateX(0)'"
                 onclick="scrollToMessage('${msg.id}')">
                <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">${escapeHtml(msg.senderName)}</div>
                <div style="font-size: 14px;">${escapeHtml(msg.text)}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${formatTime(msg.timestamp)}</div>
            </div>
        `).join('');
    }
    
    const modal = document.getElementById('searchResultsModal');
    modal.classList.add('open');
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('open');
    };
}

function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.style.animation = 'highlight 1s ease';
        setTimeout(() => {
            messageElement.style.animation = '';
        }, 1000);
        
        const modal = document.getElementById('searchResultsModal');
        if (modal) modal.classList.remove('open');
    }
}

function exportChat() {
    if (!currentChatId) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'export_chat',
            chatId: currentChatId
        }));
    }
    showNotification('Экспорт чата...', 'info');
}

function downloadChatExport(exportData) {
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chat_export_${exportData.chatName}_${new Date().toISOString().slice(0, 19)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification(`Чат "${exportData.chatName}" экспортирован!`, 'success');
}

// ========== ПРОФИЛЬ ==========
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    panel.classList.toggle('open');
}

function updateProfileUI(data) {
    if (data.username) {
        currentUsername = data.username;
        document.getElementById('userName').textContent = currentUsername;
        document.getElementById('editUsername').value = currentUsername;
    }
    if (data.bio) {
        document.getElementById('editBio').value = data.bio;
    }
    if (data.avatar) {
        currentUserAvatar = data.avatar;
        document.getElementById('userAvatar').src = currentUserAvatar;
        document.getElementById('profileAvatar').src = currentUserAvatar;
    }
    showNotification('Профиль обновлен', 'success');
}

function saveProfile() {
    const newUsername = document.getElementById('editUsername').value.trim();
    const newBio = document.getElementById('editBio').value.trim();
    
    if (!newUsername) {
        showNotification('Имя не может быть пустым', 'warning');
        return;
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'update_profile',
            userId: currentUserId,
            username: newUsername,
            bio: newBio
        }));
    }
}

function updateProfileStats() {
    const totalChats = chatsCache.size;
    const totalMessages = Array.from(messagesCache.values()).reduce((sum, msgs) => sum + msgs.length, 0);
    
    document.getElementById('statChats').textContent = totalChats;
    document.getElementById('statMessages').textContent = totalMessages;
    document.getElementById('statMemberSince').textContent = new Date().getFullYear();
}

function updateUserInChats(data) {
    const { userId, username, avatar } = data;
    
    // Обновляем в списке чатов
    chatsCache.forEach(chat => {
        if (chat.participants?.includes(userId)) {
            if (chat.type === 'personal' && chat.name !== username) {
                chat.name = username;
                chat.avatar = avatar;
            }
        }
    });
    
    refreshChatsList();
    
    if (currentChatId) {
        const currentChat = chatsCache.get(currentChatId);
        if (currentChat) {
            updateChatHeader(currentChat);
        }
    }
}

// ========== ИНФОРМАЦИЯ О ЧАТЕ ==========
function showChatInfo() {
    if (!currentChatId) return;
    
    const chat = chatsCache.get(currentChatId);
    const messages = messagesCache.get(currentChatId) || [];
    const totalMessages = messages.length;
    const participants = chat.participants?.length || 0;
    
    const modal = document.getElementById('chatInfoModal');
    const content = document.getElementById('chatInfoContent');
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${chat.avatar}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px;">
            <h3>${escapeHtml(chat.name)}</h3>
            <p style="color: var(--text-secondary);">${chat.type === 'group' ? 'Групповой чат' : 'Личный чат'}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: var(--accent-color);">${totalMessages}</div>
                <div style="font-size: 12px;">сообщений</div>
            </div>
            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: var(--accent-color);">${participants}</div>
                <div style="font-size: 12px;">участников</div>
            </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px;">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">📅 Создан</div>
            <div style="font-size: 13px; color: var(--text-secondary);">${new Date(chat.createdAt).toLocaleDateString('ru-RU')}</div>
        </div>
    `;
    
    modal.classList.add('open');
}

function showTermsModal() {
    const modal = document.getElementById('termsModal');
    modal.classList.add('open');
}

function showPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    modal.classList.add('open');
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
        if (badge) badge.remove();
    }
}

// ========== ТЕМА ОФОРМЛЕНИЯ ==========
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;
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

// ========== ВЫХОД И УДАЛЕНИЕ АККАУНТА ==========
function logout() {
    if (ws) ws.close();
    currentUserId = null;
    currentChatId = null;
    messagesCache.clear();
    chatsCache.clear();
    
    localStorage.removeItem('nexora_session');
    
    showAuthScreen();
    showNotification('Вы вышли из аккаунта', 'info');
}

function deleteAccount() {
    showConfirmModal('Удаление аккаунта', 'Вы уверены? Все ваши данные будут безвозвратно удалены.', () => {
        if (ws) ws.close();
        currentUserId = null;
        messagesCache.clear();
        chatsCache.clear();
        showAuthScreen();
        showNotification('Аккаунт удален', 'success');
    });
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const yesBtn = modal.querySelector('.confirm-yes');
    const noBtn = modal.querySelector('.confirm-no');
    
    const handleYes = () => {
        onConfirm();
        modal.classList.remove('open');
        cleanup();
    };
    
    const handleNo = () => {
        modal.classList.remove('open');
        cleanup();
    };
    
    const cleanup = () => {
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    };
    
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
    
    modal.classList.add('open');
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
                'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]}" style="font-size: 20px;"></i>
        <span style="flex: 1;">${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
}

// ========== ПОИСК ЧАТОВ ==========
function searchChats(query) {
    const chatItems = document.querySelectorAll('.chat-item');
    const searchTerm = query.toLowerCase().trim();
    
    chatItems.forEach(item => {
        const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        const chatPreview = item.querySelector('.chat-preview')?.textContent.toLowerCase() || '';
        
        if (searchTerm === '' || chatName.includes(searchTerm) || chatPreview.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.animation = 'fadeInSlide 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    if (!timestamp) return '';
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
function setupGlobalListeners() {
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
        
        let typingTimer = null;
        messageInput.addEventListener('input', () => {
            if (currentChatId) {
                sendTypingStatus(true);
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
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
        let pressTimer = null;
        let isLongPress = false;
        
        voiceBtn.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                isLongPress = true;
                startVoiceRecording();
            }, 200);
        });
        
        voiceBtn.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                isLongPress = false;
                stopVoiceRecording();
            } else {
                // Короткое нажатие - показать подсказку
                showNotification('Удерживайте для записи голосового сообщения', 'info');
            }
        });
        
        voiceBtn.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                isLongPress = false;
                stopVoiceRecording();
            }
        });
        
        // Для тач-экранов
        voiceBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressTimer = setTimeout(() => {
                isLongPress = true;
                startVoiceRecording();
            }, 200);
        });
        
        voiceBtn.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                isLongPress = false;
                stopVoiceRecording();
            }
        });
    }
    
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            showNotification('Функция загрузки файлов будет доступна в следующей версии', 'info');
        });
    }
    
    // Поиск чатов
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchChats(e.target.value);
        });
    }
    
    // Профиль
    const userProfileBtn = document.getElementById('userProfileBtn');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const settingsBtn = document.querySelector('.settings-btn');
    
    if (userProfileBtn) userProfileBtn.addEventListener('click', toggleProfilePanel);
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', toggleProfilePanel);
    if (settingsBtn) settingsBtn.addEventListener('click', toggleProfilePanel);
    
    // Сохранение профиля
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    
    // Смена аватара
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            showNotification('Выберите новое изображение', 'info');
            // Создаем input для загрузки файла
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const newAvatar = event.target.result;
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'update_profile',
                                userId: currentUserId,
                                avatar: newAvatar
                            }));
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }
    
    // Смена темы
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
    
    // Уведомления toggle
    const notificationsToggle = document.getElementById('notificationsToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                requestNotificationPermission();
            }
            localStorage.setItem('notifications_enabled', e.target.checked);
        });
        
        const saved = localStorage.getItem('notifications_enabled');
        if (saved !== null) {
            notificationsToggle.checked = saved === 'true';
        }
    }
    
    // Выход и удаление аккаунта
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', deleteAccount);
    
    // Действия в чате
    const searchMessagesBtn = document.getElementById('searchMessagesBtn');
    const chatInfoBtn = document.getElementById('chatInfoBtn');
    const exportChatBtn = document.getElementById('exportChatBtn');
    const callBtn = document.getElementById('callBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const createChatFab = document.getElementById('createChatFab');
    
    if (searchMessagesBtn) searchMessagesBtn.addEventListener('click', searchInChat);
    if (chatInfoBtn) chatInfoBtn.addEventListener('click', showChatInfo);
    if (exportChatBtn) exportChatBtn.addEventListener('click', exportChat);
    if (createChatFab) createChatFab.addEventListener('click', showCreateChatModal);
    
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            showNotification('Аудиозвонки будут доступны в следующей версии', 'info');
        });
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
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
    
    // Стикеры
    const stickers = document.querySelectorAll('.sticker');
    stickers.forEach(sticker => {
        sticker.addEventListener('click', () => {
            const stickerValue = sticker.getAttribute('data-sticker') || sticker.textContent;
            sendSticker(stickerValue);
        });
    });
    
    // Эмодзи грид
    initializeEmojiGrid();
    
    // Двойной клик на сообщение для быстрой реакции
    document.addEventListener('dblclick', (e) => {
        const messageBubble = e.target.closest('.message-bubble');
        if (messageBubble) {
            const messageDiv = messageBubble.closest('.message');
            if (messageDiv) {
                const messageId = messageDiv.getAttribute('data-message-id');
                if (messageId) {
                    addReaction(messageId, '👍');
                    showNotification('👍', 'success');
                }
            }
        }
    });
    
    // Закрытие мобильного меню при клике на чат
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) {
                closeMobileMenu();
            }
        }
    });
    
    // Загрузка темы
    loadTheme();
    
    // Добавляем стиль для анимации подсветки
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0%, 100% {
                background: transparent;
            }
            50% {
                background: rgba(99, 102, 241, 0.3);
                border-radius: 12px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
console.log('🚀 Nexora Messenger v3.0 загружен');
console.log('💡 Советы:');
console.log('   - Двойной клик на сообщение ставит 👍');
console.log('   - Удерживайте микрофон для голосового сообщения');
console.log('   - Нажмите на три точки у сообщения для дополнительных действий');
console.log('   - Используйте поиск для быстрого нахождения сообщений');
console.log('   - Экспортируйте чаты в JSON формат');
