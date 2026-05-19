// ========================================
// STATE MANAGEMENT
// ========================================

const APP_STATE = {
    user: null,
    currentChat: null,
    chats: [],
    isDarkTheme: true,
    typingAnimationEnabled: true,
    notificationsEnabled: true,
};

// ========================================
// STORAGE UTILITIES
// ========================================

const Storage = {
    // User credentials
    setUser: (user) => {
        localStorage.setItem('leobotUser', JSON.stringify(user));
    },
    getUser: () => {
        const user = localStorage.getItem('leobotUser');
        return user ? JSON.parse(user) : null;
    },
    removeUser: () => {
        localStorage.removeItem('leobotUser');
    },

    // Chats
    setChats: (chats) => {
        localStorage.setItem('leobotChats', JSON.stringify(chats));
    },
    getChats: () => {
        const chats = localStorage.getItem('leobotChats');
        return chats ? JSON.parse(chats) : [];
    },

    // Settings
    setTheme: (isDark) => {
        localStorage.setItem('leobotTheme', isDark ? 'dark' : 'light');
    },
    getTheme: () => {
        const theme = localStorage.getItem('leobotTheme');
        return theme ? theme === 'dark' : true;
    },

    setTypingAnimation: (enabled) => {
        localStorage.setItem('leobotTypingAnimation', enabled);
    },
    getTypingAnimation: () => {
        const setting = localStorage.getItem('leobotTypingAnimation');
        return setting ? setting === 'true' : true;
    },

    setNotifications: (enabled) => {
        localStorage.setItem('leobotNotifications', enabled);
    },
    getNotifications: () => {
        const setting = localStorage.getItem('leobotNotifications');
        return setting ? setting === 'true' : true;
    },
};

// ========================================
// DOM ELEMENTS
// ========================================

const DOM = {
    // Login page
    loginPage: document.getElementById('loginPage'),
    loginForm: document.getElementById('loginForm'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),

    // Chat page
    chatPage: document.getElementById('chatPage'),
    sidebar: document.getElementById('sidebar'),
    profileDropdown: document.getElementById('profileDropdown'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    emptyState: document.getElementById('emptyState'),
    chatHistory: document.getElementById('chatHistory'),

    // Navbar
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    profileToggle: document.getElementById('profileToggle'),
    dropdownAvatar: document.getElementById('dropdownAvatar'),
    dropdownName: document.getElementById('dropdownName'),

    // Buttons
    newChatBtn: document.getElementById('newChatBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    toggleSidebar: document.getElementById('toggleSidebar'),
    attachBtn: document.getElementById('attachBtn'),
    micBtn: document.getElementById('micBtn'),
    chatSearch: document.getElementById('chatSearch'),

    // Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),

    // Settings
    themeToggle: document.getElementById('themeToggle'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    typingAnimationToggle: document.getElementById('typingAnimationToggle'),
    notificationsToggle: document.getElementById('notificationsToggle'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Toast
    toast: document.getElementById('toast'),
};

// ========================================
// INITIALIZATION
// ========================================

function initializeApp() {
    // Load saved user and chats
    APP_STATE.user = Storage.getUser();
    APP_STATE.chats = Storage.getChats();
    APP_STATE.isDarkTheme = Storage.getTheme();
    APP_STATE.typingAnimationEnabled = Storage.getTypingAnimation();
    APP_STATE.notificationsEnabled = Storage.getNotifications();

    // Setup theme
    if (!APP_STATE.isDarkTheme) {
        document.body.classList.add('light-theme');
    }

    // Show appropriate page
    if (APP_STATE.user) {
        showChatPage();
        initializeChatPage();
    } else {
        showLoginPage();
    }

    // Attach event listeners
    attachEventListeners();

    // If first time, create a default chat
    if (APP_STATE.chats.length === 0 && APP_STATE.user) {
        createNewChat();
    }
}

// ========================================
// PAGE NAVIGATION
// ========================================

function showLoginPage() {
    DOM.loginPage.classList.add('active');
    DOM.chatPage.classList.remove('active');
}

function showChatPage() {
    DOM.chatPage.classList.add('active');
    DOM.loginPage.classList.remove('active');
    updateUserDisplay();
}

// ========================================
// AUTHENTICATION
// ========================================

function handleLogin(e) {
    e.preventDefault();

    const username = DOM.usernameInput.value.trim();
    const password = DOM.passwordInput.value.trim();

    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Fake authentication (demo purposes)
    const user = {
        id: Math.random().toString(36).substr(2, 9),
        username: username,
        email: `${username.toLowerCase()}@leobot.ai`,
        avatar: username.charAt(0).toUpperCase(),
        loginTime: new Date().toLocaleString(),
    };

    APP_STATE.user = user;
    Storage.setUser(user);

    // Clear form
    DOM.loginForm.reset();

    // Show success and redirect
    showToast(`Welcome, ${username}!`, 'success');
    setTimeout(() => {
        showChatPage();
        initializeChatPage();
        if (APP_STATE.chats.length === 0) {
            createNewChat();
        }
    }, 500);
}

function handleLogout() {
    Storage.removeUser();
    APP_STATE.user = null;
    APP_STATE.currentChat = null;
    
    // Clear profile dropdown
    DOM.profileDropdown.classList.remove('active');

    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        showLoginPage();
    }, 300);
}

// ========================================
// USER DISPLAY
// ========================================

function updateUserDisplay() {
    if (!APP_STATE.user) return;

    const { username, avatar } = APP_STATE.user;

    DOM.userAvatar.textContent = avatar;
    DOM.userName.textContent = username;
    DOM.dropdownAvatar.textContent = avatar;
    DOM.dropdownName.textContent = username;
}

// ========================================
// CHAT MANAGEMENT
// ========================================

function createNewChat() {
    const chat = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Chat ${APP_STATE.chats.length + 1}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    APP_STATE.chats.unshift(chat);
    APP_STATE.currentChat = chat;
    Storage.setChats(APP_STATE.chats);

    // Add initial greeting from Leo 
    addBotMessage('Hello! I\'m Leo . How can I help you today?');

    refreshChatUI();
    showToast('New chat created', 'success');
}

function selectChat(chatId) {
    const chat = APP_STATE.chats.find(c => c.id === chatId);
    if (chat) {
        APP_STATE.currentChat = chat;
        refreshChatUI();
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            DOM.sidebar.classList.remove('active');
        }
    }
}

function deleteChat(chatId) {
    const index = APP_STATE.chats.findIndex(c => c.id === chatId);
    if (index > -1) {
        APP_STATE.chats.splice(index, 1);
        Storage.setChats(APP_STATE.chats);

        // If deleted chat was active, select another one
        if (APP_STATE.currentChat && APP_STATE.currentChat.id === chatId) {
            if (APP_STATE.chats.length > 0) {
                APP_STATE.currentChat = APP_STATE.chats[0];
            } else {
                APP_STATE.currentChat = null;
                createNewChat();
            }
        }

        refreshChatUI();
        showToast('Chat deleted', 'success');
    }
}

function renameChat(chatId, newTitle) {
    const chat = APP_STATE.chats.find(c => c.id === chatId);
    if (chat) {
        chat.title = newTitle || `Chat ${APP_STATE.chats.indexOf(chat) + 1}`;
        chat.updatedAt = new Date();
        Storage.setChats(APP_STATE.chats);
        refreshChatUI();
    }
}

function clearAllChats() {
    if (confirm('Are you sure? This will delete all chats. This action cannot be undone.')) {
        APP_STATE.chats = [];
        APP_STATE.currentChat = null;
        Storage.setChats(APP_STATE.chats);
        createNewChat();
        refreshChatUI();
        showToast('All chats cleared', 'success');
        closeModal(DOM.settingsModal);
    }
}

// ========================================
// CHAT UI
// ========================================

function initializeChatPage() {
    DOM.messagesContainer.innerHTML = '';
    if (APP_STATE.chats.length === 0) {
        DOM.emptyState.style.display = 'flex';
        DOM.messagesContainer.style.display = 'none';
    } else if (!APP_STATE.currentChat && APP_STATE.chats.length > 0) {
        APP_STATE.currentChat = APP_STATE.chats[0];
    }
    refreshChatUI();
}

function refreshChatUI() {
    // Update chat history list
    updateChatHistory();

    // Update messages
    if (APP_STATE.currentChat) {
        DOM.emptyState.style.display = 'none';
        DOM.messagesContainer.style.display = 'flex';
        renderMessages();
    } else {
        DOM.emptyState.style.display = 'flex';
        DOM.messagesContainer.style.display = 'none';
    }
}

function updateChatHistory() {
    DOM.chatHistory.innerHTML = '';

    APP_STATE.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${APP_STATE.currentChat && APP_STATE.currentChat.id === chat.id ? 'active' : ''}`;
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                <div class="chat-item-time">${formatDate(chat.updatedAt)}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-action-btn" title="Rename" onclick="renameCurrentChat('${chat.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="chat-action-btn" title="Delete" onclick="deleteChatConfirm('${chat.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-action-btn')) {
                selectChat(chat.id);
            }
        });
        DOM.chatHistory.appendChild(chatItem);
    });
}

function renderMessages() {
    if (!APP_STATE.currentChat) return;

    DOM.messagesContainer.innerHTML = '';
    const messages = APP_STATE.currentChat.messages;

    messages.forEach((msg, index) => {
        const messageEl = createMessageElement(msg);
        DOM.messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
    setTimeout(() => {
        DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
    }, 0);
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = message.role === 'user' ? APP_STATE.user.avatar : 'L';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessageContent(message.content);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-timestamp';
    timeSpan.textContent = formatTime(message.timestamp);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'message-copy';
    copyBtn.title = 'Copy message';
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>`;
    copyBtn.addEventListener('click', () => copyToClipboard(message.content));

    metaDiv.appendChild(timeSpan);
    metaDiv.appendChild(copyBtn);

    contentWrapper.appendChild(contentDiv);
    contentWrapper.appendChild(metaDiv);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentWrapper);

    return messageDiv;
}

// ========================================
// MESSAGE HANDLING
// ========================================

async function sendMessage() {
    const content = DOM.messageInput.value.trim();

    if (!content) {
        showToast('Please enter a message', 'error');
        return;
    }

    if (!APP_STATE.currentChat) {
        createNewChat();
    }

    // 1. Add user message visually to the UI chat stream
    addUserMessage(content);

    // 2. Clear out the input window and reset its height
    DOM.messageInput.value = '';
    DOM.messageInput.style.height = 'auto';

    try {
        // 3. Connect to your FastAPI '/chat' route on port 8000
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: content }) 
        });

        const data = await response.json();
        
        // Log the exact payload to your browser console for tracking
        console.log("Response data object received:", data);

        // 4. Safely handle the response structure without displaying default errors
        if (data && data.reply) {
            addBotMessage(data.reply);
        } else if (data && data.response) {
            addBotMessage(data.response);
        } else if (typeof data === 'string') {
            addBotMessage(data);
        } else {
            // Safe fallback: stringify whatever object arrived so the user sees the real text
            addBotMessage(JSON.stringify(data));
        }

    } catch (error) {
        console.error("API connection failed:", error);
        addBotMessage("Unable to reach the server. Please verify your Python backend is active.");
    }
}
function addUserMessage(content) {
    const message = {
        role: 'user',
        content: content,
        timestamp: new Date(),
    };

    APP_STATE.currentChat.messages.push(message);
    APP_STATE.currentChat.updatedAt = new Date();
    Storage.setChats(APP_STATE.chats);

    renderMessages();
}

function addBotMessage(content) {
    const message = {
        role: 'assistant',
        content: content,
        timestamp: new Date(),
    };

    APP_STATE.currentChat.messages.push(message);
    APP_STATE.currentChat.updatedAt = new Date();
    Storage.setChats(APP_STATE.chats);

    renderMessages();
}

async function simulateBotResponse() {
    // Add typing indicator
    if (APP_STATE.typingAnimationEnabled) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.innerHTML = `
            <div class="message-avatar">L</div>
            <div class="message-content-wrapper">
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        DOM.messagesContainer.appendChild(typingDiv);
        DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Remove typing indicator
        typingDiv.remove();
    } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate response
    const response = generateBotResponse();
    addBotMessage(response);

    // Update chat title if it's generic
    if (APP_STATE.currentChat.messages.length === 2) {
        const userMessage = APP_STATE.currentChat.messages[0].content;
        const title = userMessage.substring(0, 30);
        renameChat(APP_STATE.currentChat.id, title);
    }

    // Show notification if enabled
    if (APP_STATE.notificationsEnabled) {
        showToast('Leo Bot replied', 'success');
    }
}


// ========================================
// UTILITIES
// ========================================

function formatMessageContent(content) {
    let html = escapeHtml(content);

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert `code` to <code>
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString();
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function showToast(message, type = 'success') {
    DOM.toast.textContent = message;
    DOM.toast.className = `toast show ${type}`;

    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function openModal(modalEl) {
    modalEl.classList.add('active');
}

function closeModal(modalEl) {
    modalEl.classList.remove('active');
}

// ========================================
// SIDEBAR INTERACTIONS
// ========================================

function toggleSidebar() {
    DOM.sidebar.classList.toggle('active');
}

function toggleProfileDropdown() {
    DOM.profileDropdown.classList.toggle('active');
}

function renameCurrentChat(chatId) {
    const chat = APP_STATE.chats.find(c => c.id === chatId);
    if (!chat) return;

    const newTitle = prompt('Enter new chat title:', chat.title);
    if (newTitle !== null && newTitle.trim()) {
        renameChat(chatId, newTitle.trim());
    }
}

function deleteChatConfirm(chatId) {
    if (confirm('Delete this chat?')) {
        deleteChat(chatId);
    }
}

function searchChats(query) {
    const items = DOM.chatHistory.querySelectorAll('.chat-item');
    items.forEach(item => {
        const title = item.querySelector('.chat-item-title').textContent.toLowerCase();
        if (title.includes(query.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========================================
// THEME MANAGEMENT
// ========================================

function toggleTheme() {
    APP_STATE.isDarkTheme = !APP_STATE.isDarkTheme;
    Storage.setTheme(APP_STATE.isDarkTheme);

    if (APP_STATE.isDarkTheme) {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }

    // Update toggle in settings
    DOM.darkModeToggle.checked = APP_STATE.isDarkTheme;
}

// ========================================
// SETTINGS
// ========================================

function saveSettings() {
    APP_STATE.typingAnimationEnabled = DOM.typingAnimationToggle.checked;
    APP_STATE.notificationsEnabled = DOM.notificationsToggle.checked;

    Storage.setTypingAnimation(APP_STATE.typingAnimationEnabled);
    Storage.setNotifications(APP_STATE.notificationsEnabled);

    showToast('Settings saved', 'success');
}

function exportChat() {
    if (!APP_STATE.currentChat) {
        showToast('No chat to export', 'error');
        return;
    }

    const chatData = {
        title: APP_STATE.currentChat.title,
        messages: APP_STATE.currentChat.messages,
        exportedAt: new Date().toLocaleString(),
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leo-chat-${APP_STATE.currentChat.id}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('Chat exported', 'success');
}

// ========================================
// TEXTAREA AUTO-RESIZE
// ========================================

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    // Login
    DOM.loginForm.addEventListener('submit', handleLogin);

    // Chat controls
    DOM.newChatBtn.addEventListener('click', createNewChat);
    DOM.logoutBtn.addEventListener('click', handleLogout);
    DOM.settingsBtn.addEventListener('click', () => openModal(DOM.settingsModal));
    DOM.closeSettingsBtn.addEventListener('click', () => closeModal(DOM.settingsModal));

    // Messages
    DOM.sendBtn.addEventListener('click', sendMessage);
    DOM.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    DOM.messageInput.addEventListener('input', (e) => {
        autoResizeTextarea(e.target);
    });

    // Profile
    DOM.profileToggle.addEventListener('click', toggleProfileDropdown);

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile') && !e.target.closest('.profile-dropdown')) {
            DOM.profileDropdown.classList.remove('active');
        }
    });

    // Sidebar
    DOM.toggleSidebar.addEventListener('click', toggleSidebar);
    DOM.chatSearch.addEventListener('input', (e) => {
        searchChats(e.target.value);
    });

    // Action buttons (no-op for now, can add real functionality)
    DOM.attachBtn.addEventListener('click', () => {
        showToast('Attachment feature coming soon!', 'success');
    });
    DOM.micBtn.addEventListener('click', () => {
        showToast('Voice input feature coming soon!', 'success');
    });

    // Theme
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.darkModeToggle.addEventListener('change', (e) => {
        if (e.target.checked !== APP_STATE.isDarkTheme) {
            toggleTheme();
        }
    });

    // Settings
    DOM.typingAnimationToggle.addEventListener('change', saveSettings);
    DOM.notificationsToggle.addEventListener('change', saveSettings);
    DOM.clearHistoryBtn.addEventListener('click', clearAllChats);

    // Export
    DOM.exportBtn?.addEventListener('click', exportChat);

    // Export button in navbar
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportChat);
    }

    // Close modal on outside click
    DOM.settingsModal.addEventListener('click', (e) => {
        if (e.target === DOM.settingsModal) {
            closeModal(DOM.settingsModal);
        }
    });

    // Close sidebar on mobile when clicking on messages
    DOM.messagesContainer.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            DOM.sidebar.classList.remove('active');
        }
    });

    // Sync settings from storage on load
    DOM.darkModeToggle.checked = APP_STATE.isDarkTheme;
    DOM.typingAnimationToggle.checked = APP_STATE.typingAnimationEnabled;
    DOM.notificationsToggle.checked = APP_STATE.notificationsEnabled;
}

// ========================================
// APP START
// ========================================

document.addEventListener('DOMContentLoaded', initializeApp);

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && DOM.sidebar.classList.contains('active')) {
        DOM.sidebar.classList.remove('active');
    }
});
