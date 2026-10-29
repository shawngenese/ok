/**
 * PulseChat - Modern Single Page Chat Application
 * Features:
 * - LocalStorage state persistence
 * - Smart AI simulated responses + Direct Google Gemini API integration
 * - Group chat simulations with multi-persona responses
 * - Rich markdown parser with fenced code blocks & copy button
 * - Voice memo recorder & player simulation
 * - Image attachment handling with lightbox
 * - Message reactions, replies, copy, delete
 * - In-chat message search & contact filters
 * - Audio synthesizers (Web Audio API) for sound effects
 * - Modern Web Guidance: field-sizing fallback, dialog overscroll, color-scheme
 */

(() => {
  'use strict';

  // ==========================================================================
  // Sound Synthesizer (Web Audio API - Zero External Dependencies)
  // ==========================================================================
  class SoundFX {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playSend() {
      if (!appState.settings.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {
        console.warn('Audio FX error:', e);
      }
    }

    playReceive() {
      if (!appState.settings.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {
        console.warn('Audio FX error:', e);
      }
    }

    playClick() {
      if (!appState.settings.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {
        // ignore
      }
    }
  }

  const sfx = new SoundFX();

  // ==========================================================================
  // Default Seed Data
  // ==========================================================================
  const INITIAL_CHATS = [
    {
      id: 'chat-gemini-ai',
      name: 'Gemini AI Assistant',
      type: 'ai',
      avatar: '🤖',
      avatarClass: 'bot-avatar',
      status: 'online',
      subtitle: 'Online • Real Gemini API or Offline Smart AI',
      badge: 'Gemini 2.5',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-1',
          sender: 'ai',
          senderName: 'Gemini AI',
          text: "👋 Welcome to **PulseChat**! I'm your AI assistant.\n\nYou can ask me questions about code, brainstorming, writing, or anything else. Try asking me:\n\n* `How do CSS Container Queries work?`\n* `Write a debounce utility in TypeScript`\n* `Explain quantum computing in simple terms`\n\n*Tip: Connect your own Gemini API key in Settings to call Google's latest models directly!*",
          time: '10:00 AM',
          timestamp: Date.now() - 3600000,
          status: 'read',
          reactions: { '✨': 2, '🚀': 1 }
        }
      ]
    },
    {
      id: 'chat-sprint-team',
      name: 'Sprint Team Alpha',
      type: 'group',
      avatar: '👥',
      avatarClass: 'group-avatar',
      status: 'online',
      subtitle: 'Alex, Sophia, Liam, You',
      badge: 'Group',
      unreadCount: 1,
      messages: [
        {
          id: 'msg-team-1',
          sender: 'Alex',
          senderName: 'Alex (Tech Lead)',
          text: "Hey everyone! Quick check-in for today's release. Backend services are deployed and all tests passed ✅",
          time: '09:30 AM',
          timestamp: Date.now() - 5400000,
          status: 'read',
          reactions: { '🙌': 3 }
        },
        {
          id: 'msg-team-2',
          sender: 'Sophia',
          senderName: 'Sophia (UI/UX)',
          text: "Awesome! I just reviewed the new dark mode color contrast. The accessibility scores are looking great! 🎨",
          time: '09:35 AM',
          timestamp: Date.now() - 5100000,
          status: 'read',
          reactions: { '❤️': 2 }
        },
        {
          id: 'msg-team-3',
          sender: 'Liam',
          senderName: 'Liam (QA)',
          text: "Finished regression testing on Safari and Chromium. Good to ship when everyone is ready!",
          time: '09:48 AM',
          timestamp: Date.now() - 4200000,
          status: 'delivered',
          reactions: { '🚀': 1 }
        }
      ]
    },
    {
      id: 'chat-dev-support',
      name: 'Dev Mentorship Bot',
      type: 'ai',
      avatar: '💻',
      avatarClass: 'dev-avatar',
      status: 'online',
      subtitle: 'Code reviews, debugging & architecture',
      badge: 'DevBot',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-dev-1',
          sender: 'ai',
          senderName: 'Dev Mentor',
          text: "Hello developer! Need help debugging a script or optimizing SQL/algorithms? Paste your code snippet here and let's examine it together.",
          time: 'Yesterday',
          timestamp: Date.now() - 86400000,
          status: 'read',
          reactions: { '💻': 1 }
        }
      ]
    },
    {
      id: 'chat-sarah',
      name: 'Sarah Connor',
      type: 'direct',
      avatar: 'SC',
      avatarClass: '',
      status: 'online',
      subtitle: 'Active now',
      badge: 'Direct',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-sarah-1',
          sender: 'Sarah',
          senderName: 'Sarah Connor',
          text: "Hey! Did you get a chance to see that new UI mockup?",
          time: 'Yesterday',
          timestamp: Date.now() - 90000000,
          status: 'read',
          reactions: {}
        },
        {
          id: 'msg-sarah-2',
          sender: 'user',
          senderName: 'You',
          text: "Yes, I really liked the clean aesthetic and smooth transitions!",
          time: 'Yesterday',
          timestamp: Date.now() - 89000000,
          status: 'read',
          reactions: { '👍': 1 }
        }
      ]
    }
  ];

  // Quick reaction emoji palette
  const QUICK_REACTION_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '👀', '💯'];
  
  // Categorized Emojis for picker panel
  const EMOJI_PALETTE = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛',
    '😜', '🤪', '🤩', '🥳', '😎', '🤓', '🧐', '🤖', '👾', '👻',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟',
    '🤘', '👌', '🤌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '🔥', '✨', '⭐', '🌟', '💥', '⚡', '🎉', '🎊', '🎈', '🚀',
    '💡', '💻', '📱', '🔍', '📌', '🛠️', '🎯', '🏆', '☕', '🍕'
  ];

  // ==========================================================================
  // App State & Local Storage Management
  // ==========================================================================
  const STORAGE_KEY_CHATS = 'pulsechat_conversations_v1';
  const STORAGE_KEY_SETTINGS = 'pulsechat_settings_v1';
  const STORAGE_KEY_ACTIVE_ID = 'pulsechat_active_chat_id_v1';

  let appState = {
    chats: [],
    activeChatId: 'chat-gemini-ai',
    activeFilter: 'all',
    searchQuery: '',
    inChatSearchQuery: '',
    replyTarget: null,
    pendingAttachment: null,
    isVoiceRecording: false,
    voiceTimerInterval: null,
    voiceSeconds: 0,
    settings: {
      theme: 'dark',
      soundEnabled: true,
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash'
    }
  };

  function loadState() {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        appState.settings = { ...appState.settings, ...JSON.parse(storedSettings) };
      }

      const storedChats = localStorage.getItem(STORAGE_KEY_CHATS);
      if (storedChats) {
        appState.chats = JSON.parse(storedChats);
      } else {
        appState.chats = JSON.parse(JSON.stringify(INITIAL_CHATS));
      }

      const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (storedActiveId && appState.chats.some(c => c.id === storedActiveId)) {
        appState.activeChatId = storedActiveId;
      } else if (appState.chats.length > 0) {
        appState.activeChatId = appState.chats[0].id;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      appState.chats = JSON.parse(JSON.stringify(INITIAL_CHATS));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(appState.chats));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appState.settings));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, appState.activeChatId);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // ==========================================================================
  // Theme Management
  // ==========================================================================
  function applyTheme(theme) {
    appState.settings.theme = theme;
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    saveState();

    // Update settings radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme-pref"]');
    themeRadios.forEach(r => {
      r.checked = r.value === theme;
    });

    // Update theme toggle icon
    updateThemeIcon(effectiveTheme);
  }

  function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    }
  }

  // ==========================================================================
  // Markdown Parser (Fast, Safe, Client-Side)
  // ==========================================================================
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMarkdown(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // 1. Code blocks with ```lang ... ```
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      const safeCode = escapeHTML(code.trim());
      const label = lang ? lang.toUpperCase() : 'CODE';
      codeBlocks.push(`
        <pre><span class="code-lang-label" style="position: absolute; top: 6px; left: 10px; font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">${label}</span><button type="button" class="code-copy-btn" data-code="${encodeURIComponent(code.trim())}">Copy</button><code>${safeCode}</code></pre>
      `);
      return `%%CODEBLOCK_${idx}%%`;
    });

    // 2. Escape standard HTML in the remaining text
    text = escapeHTML(text);

    // 3. Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 4. Bold **text** or __text__
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // 5. Italic *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // 6. Blockquotes > quote
    text = text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // 7. Unordered lists
    text = text.replace(/(?:^[*\-]\s+(.+)$\n?)+/gm, match => {
      const items = match.trim().split('\n').map(line => `<li>${line.replace(/^[*\-]\s+/, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    });

    // 8. Ordered lists
    text = text.replace(/(?:^\d+\.\s+(.+)$\n?)+/gm, match => {
      const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    });

    // 9. Links [text](url)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // 10. Replace newlines with <br> inside paragraphs
    text = text.replace(/\n/g, '<br>');

    // 11. Restore Code Blocks
    text = text.replace(/%%CODEBLOCK_(\d+)%%/g, (match, idx) => {
      return codeBlocks[parseInt(idx, 10)];
    });

    return text;
  }

  // ==========================================================================
  // Modern Web Guidance: field-sizing content fallback check
  // ==========================================================================
  function setupGrowableTextarea(textarea) {
    if (!textarea) return;
    // Feature detect field-sizing: content
    if (!CSS.supports('field-sizing', 'content')) {
      const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
      };
      textarea.addEventListener('input', autoResize);
      autoResize();
    }
  }

  // ==========================================================================
  // Modern Web Guidance: Dialog dismiss fallback
  // ==========================================================================
  function setupDialogFallbacks() {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && outside(e, dialog)) dialog.close();
        });
      }
    }
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 200ms ease-out';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // ==========================================================================
  // Date & Time Formatting
  // ==========================================================================
  function formatTimestamp(ts) {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getActiveChat() {
    return appState.chats.find(c => c.id === appState.activeChatId) || appState.chats[0];
  }

  // ==========================================================================
  // Render Chat List (Sidebar)
  // ==========================================================================
  function renderChatList() {
    const chatListEl = document.getElementById('chat-list');
    if (!chatListEl) return;

    let filtered = appState.chats;

    // Filter tab
    if (appState.activeFilter === 'ai') {
      filtered = filtered.filter(c => c.type === 'ai');
    } else if (appState.activeFilter === 'groups') {
      filtered = filtered.filter(c => c.type === 'group');
    } else if (appState.activeFilter === 'unread') {
      filtered = filtered.filter(c => (c.unreadCount || 0) > 0);
    }

    // Search query in sidebar
    if (appState.searchQuery.trim()) {
      const q = appState.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.messages.length > 0 && c.messages[c.messages.length - 1].text.toLowerCase().includes(q))
      );
    }

    chatListEl.innerHTML = '';

    if (filtered.length === 0) {
      chatListEl.innerHTML = `
        <li style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No conversations found
        </li>
      `;
      return;
    }

    filtered.forEach(chat => {
      const isActive = chat.id === appState.activeChatId;
      const lastMsg = chat.messages[chat.messages.length - 1];
      const lastText = lastMsg ? (lastMsg.attachment ? '📷 Photo' : (lastMsg.isVoice ? '🎤 Voice note' : lastMsg.text)) : 'No messages yet';
      const lastTime = lastMsg ? (lastMsg.time || formatTimestamp(lastMsg.timestamp)) : '';

      const li = document.createElement('li');
      li.className = `chat-item ${isActive ? 'active' : ''}`;
      li.setAttribute('data-id', chat.id);
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `${chat.name}, ${lastText}`);

      li.innerHTML = `
        <div class="chat-item-avatar-wrapper">
          <div class="avatar ${chat.avatarClass || ''}">${escapeHTML(chat.avatar || '💬')}</div>
          <span class="status-indicator ${chat.status || 'online'}"></span>
        </div>
        <div class="chat-item-content">
          <div class="chat-item-top-row">
            <span class="chat-item-name">${escapeHTML(chat.name)}</span>
            <span class="chat-item-time">${escapeHTML(lastTime)}</span>
          </div>
          <div class="chat-item-bottom-row">
            <span class="chat-item-snippet">${escapeHTML(lastText)}</span>
            ${(chat.unreadCount && chat.unreadCount > 0 && !isActive) ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
          </div>
        </div>
      `;

      li.addEventListener('click', () => {
        selectChat(chat.id);
        closeMobileSidebar();
      });

      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectChat(chat.id);
          closeMobileSidebar();
        }
      });

      chatListEl.appendChild(li);
    });
  }

  function selectChat(chatId) {
    if (appState.activeChatId === chatId) return;
    appState.activeChatId = chatId;
    const chat = getActiveChat();
    if (chat) {
      chat.unreadCount = 0;
    }
    saveState();
    sfx.playClick();
    renderChatList();
    renderActiveChatHeader();
    renderMessages();
    cancelReply();
  }

  // ==========================================================================
  // Render Active Chat Header
  // ==========================================================================
  function renderActiveChatHeader() {
    const chat = getActiveChat();
    if (!chat) return;

    const avatarEl = document.getElementById('active-chat-avatar');
    const titleEl = document.getElementById('active-chat-title');
    const badgeEl = document.getElementById('active-chat-badge');
    const subtitleEl = document.getElementById('active-chat-subtitle');

    if (avatarEl) {
      avatarEl.textContent = chat.avatar || '💬';
      avatarEl.className = `avatar ${chat.avatarClass || ''}`;
    }
    if (titleEl) titleEl.textContent = chat.name;
    if (subtitleEl) subtitleEl.textContent = chat.subtitle || 'Active now';

    if (badgeEl) {
      if (chat.badge) {
        badgeEl.textContent = chat.badge;
        badgeEl.style.display = 'inline-block';
        badgeEl.className = `channel-badge ${chat.type === 'ai' ? 'badge-ai' : (chat.type === 'group' ? 'badge-group' : 'badge-ai')}`;
      } else {
        badgeEl.style.display = 'none';
      }
    }
  }

  // ==========================================================================
  // Render Messages
  // ==========================================================================
  function renderMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const chat = getActiveChat();
    container.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
      container.innerHTML = `
        <div style="margin: auto; text-align: center; color: var(--text-muted); max-width: 320px;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💬</div>
          <h3 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.35rem;">No messages yet</h3>
          <p style="font-size: 0.85rem;">Send a message below to start this conversation!</p>
        </div>
      `;
      return;
    }

    // Date separator placeholder
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date-separator';
    dateDiv.innerHTML = `<span class="date-separator-label">Today</span>`;
    container.appendChild(dateDiv);

    let matchCount = 0;
    const searchFilter = appState.inChatSearchQuery.trim().toLowerCase();

    chat.messages.forEach(msg => {
      const isOutgoing = msg.sender === 'user';
      const isMatch = searchFilter && msg.text && msg.text.toLowerCase().includes(searchFilter);
      if (isMatch) matchCount++;

      const row = document.createElement('div');
      row.className = `message-row ${isOutgoing ? 'outgoing' : 'incoming'} ${isMatch ? 'search-highlight' : ''}`;
      row.setAttribute('data-msg-id', msg.id);

      // Avatar for incoming messages in group / bots
      let avatarHtml = '';
      if (!isOutgoing) {
        let avatarChar = msg.senderName ? msg.senderName[0] : (chat.avatar || '💬');
        if (chat.type === 'ai') avatarChar = chat.avatar || '🤖';
        avatarHtml = `<div class="avatar message-avatar ${chat.avatarClass || ''}">${escapeHTML(avatarChar)}</div>`;
      }

      // Sender name for group chats
      let senderNameHtml = '';
      if (!isOutgoing && chat.type === 'group' && msg.senderName) {
        senderNameHtml = `<span class="message-sender-name">${escapeHTML(msg.senderName)}</span>`;
      }

      // Quoted reply snippet
      let replySnippetHtml = '';
      if (msg.replyTo) {
        replySnippetHtml = `
          <div class="quoted-reply">
            <div class="quoted-reply-sender">${escapeHTML(msg.replyTo.sender)}</div>
            <div class="quoted-reply-text">${escapeHTML(msg.replyTo.text)}</div>
          </div>
        `;
      }

      // Media / attachment preview
      let attachmentHtml = '';
      if (msg.attachment && msg.attachment.dataUrl) {
        attachmentHtml = `
          <img class="message-attachment-image" src="${msg.attachment.dataUrl}" alt="Attachment preview" loading="lazy" />
        `;
      }

      // Voice memo preview
      let voiceMemoHtml = '';
      if (msg.isVoice) {
        voiceMemoHtml = `
          <div class="voice-memo-card">
            <button type="button" class="voice-play-btn" aria-label="Play audio note">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <div class="voice-waveform-display">
              <span class="waveform-bar" style="height: 12px;"></span>
              <span class="waveform-bar" style="height: 18px;"></span>
              <span class="waveform-bar" style="height: 8px;"></span>
              <span class="waveform-bar" style="height: 22px;"></span>
              <span class="waveform-bar" style="height: 14px;"></span>
              <span class="waveform-bar" style="height: 16px;"></span>
              <span class="waveform-bar" style="height: 10px;"></span>
              <span class="waveform-bar" style="height: 20px;"></span>
            </div>
            <span class="voice-duration">${escapeHTML(msg.voiceDuration || '0:04')}</span>
          </div>
        `;
      }

      // Text body formatted with markdown
      let textHtml = '';
      if (msg.text) {
        textHtml = `<div class="message-text">${renderMarkdown(msg.text)}</div>`;
      }

      // Delivery Status ticks (for outgoing)
      let deliveryIcon = '';
      if (isOutgoing) {
        if (msg.status === 'read') {
          deliveryIcon = `<span class="delivery-status read" title="Read"><svg viewBox="0 0 16 15" width="14" height="13"><path fill="#60a5fa" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.055a.366.366 0 0 0-.064-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.055a.365.365 0 0 0-.063-.51z"/></svg></span>`;
        } else if (msg.status === 'delivered') {
          deliveryIcon = `<span class="delivery-status delivered" title="Delivered"><svg viewBox="0 0 16 15" width="14" height="13"><path fill="currentColor" opacity="0.7" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.055a.366.366 0 0 0-.064-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.055a.365.365 0 0 0-.063-.51z"/></svg></span>`;
        } else {
          deliveryIcon = `<span class="delivery-status sent" title="Sent"><svg viewBox="0 0 16 15" width="14" height="13"><path fill="currentColor" opacity="0.6" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.055a.365.365 0 0 0-.063-.51z"/></svg></span>`;
        }
      }

      // Reactions list
      let reactionsHtml = '';
      if (msg.reactions && Object.keys(msg.reactions).length > 0) {
        const pills = Object.entries(msg.reactions).map(([emoji, count]) => {
          return `<button type="button" class="reaction-pill" data-emoji="${emoji}">${emoji} <span>${count}</span></button>`;
        }).join('');
        reactionsHtml = `<div class="message-reactions">${pills}</div>`;
      }

      // Floating Action Bar on hover/focus
      const actionsBarHtml = `
        <div class="message-actions-bar" role="toolbar" aria-label="Message options">
          <button type="button" class="action-bar-btn reply-btn" title="Reply" aria-label="Reply to message">↩</button>
          <button type="button" class="action-bar-btn react-btn" title="React with 👍" aria-label="Add reaction">👍</button>
          <button type="button" class="action-bar-btn react-heart-btn" title="React with ❤️" aria-label="Add heart">❤️</button>
          <button type="button" class="action-bar-btn copy-msg-btn" title="Copy text" aria-label="Copy text">📋</button>
          <button type="button" class="action-bar-btn delete-msg-btn" title="Delete" aria-label="Delete message">🗑</button>
        </div>
      `;

      row.innerHTML = `
        ${avatarHtml}
        <div class="message-bubble-wrapper">
          ${senderNameHtml}
          <div class="message-bubble" tabindex="0">
            ${actionsBarHtml}
            ${replySnippetHtml}
            ${attachmentHtml}
            ${voiceMemoHtml}
            ${textHtml}
            <div class="message-meta">
              <span class="message-time">${escapeHTML(msg.time || formatTimestamp(msg.timestamp))}</span>
              ${deliveryIcon}
            </div>
          </div>
          ${reactionsHtml}
        </div>
      `;

      // Event listeners for actions inside this message
      setupMessageRowListeners(row, msg, chat);

      container.appendChild(row);
    });

    // Update in-chat search match count label
    const matchCountEl = document.getElementById('search-match-count');
    if (matchCountEl) {
      matchCountEl.textContent = searchFilter ? `${matchCount} found` : '';
    }

    // Scroll to bottom
    scrollToBottom(false);
  }

  function setupMessageRowListeners(row, msg, chat) {
    // Lightbox for image attachment
    const imgEl = row.querySelector('.message-attachment-image');
    if (imgEl) {
      imgEl.addEventListener('click', () => {
        openLightbox(imgEl.src);
      });
    }

    // Voice memo playback simulation
    const voiceBtn = row.querySelector('.voice-play-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        sfx.playReceive();
        showToast('Playing voice message...', 'info', 1500);
      });
    }

    // Copy code button inside pre blocks
    row.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const codeText = decodeURIComponent(btn.getAttribute('data-code') || '');
        navigator.clipboard.writeText(codeText).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 1800);
        });
      });
    });

    // Reply button
    const replyBtn = row.querySelector('.reply-btn');
    if (replyBtn) {
      replyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setReplyTarget(msg);
      });
    }

    // Quick react button (thumbs up)
    const reactBtn = row.querySelector('.react-btn');
    if (reactBtn) {
      reactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleReaction(msg.id, '👍');
      });
    }

    // Quick react button (heart)
    const reactHeartBtn = row.querySelector('.react-heart-btn');
    if (reactHeartBtn) {
      reactHeartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleReaction(msg.id, '❤️');
      });
    }

    // Copy full message text
    const copyBtn = row.querySelector('.copy-msg-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (msg.text) {
          navigator.clipboard.writeText(msg.text).then(() => {
            showToast('Message copied to clipboard', 'info');
          });
        }
      });
    }

    // Delete message
    const deleteBtn = row.querySelector('.delete-msg-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteMessage(msg.id);
      });
    }

    // Reaction pills click
    row.querySelectorAll('.reaction-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const emoji = pill.getAttribute('data-emoji');
        if (emoji) toggleReaction(msg.id, emoji);
      });
    });
  }

  // ==========================================================================
  // Lightbox Modal Handling
  // ==========================================================================
  function openLightbox(src) {
    const dialog = document.getElementById('lightbox-dialog');
    const img = document.getElementById('lightbox-img');
    if (dialog && img) {
      img.src = src;
      dialog.showModal();
    }
  }

  // ==========================================================================
  // Reply Context Handling
  // ==========================================================================
  function setReplyTarget(msg) {
    appState.replyTarget = {
      id: msg.id,
      sender: msg.senderName || (msg.sender === 'user' ? 'You' : 'Participant'),
      text: msg.text || (msg.attachment ? 'Photo attachment' : 'Voice note')
    };

    const previewBar = document.getElementById('reply-preview-bar');
    const senderEl = document.getElementById('reply-sender-name');
    const textEl = document.getElementById('reply-snippet-text');

    if (previewBar && senderEl && textEl) {
      senderEl.textContent = `Replying to ${appState.replyTarget.sender}`;
      textEl.textContent = appState.replyTarget.text;
      previewBar.hidden = false;
    }

    const input = document.getElementById('message-input');
    if (input) input.focus();
  }

  function cancelReply() {
    appState.replyTarget = null;
    const previewBar = document.getElementById('reply-preview-bar');
    if (previewBar) previewBar.hidden = true;
  }

  // ==========================================================================
  // Reactions Handling
  // ==========================================================================
  function toggleReaction(msgId, emoji) {
    const chat = getActiveChat();
    if (!chat) return;
    const msg = chat.messages.find(m => m.id === msgId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (msg.reactions[emoji]) {
      msg.reactions[emoji] += 1;
    } else {
      msg.reactions[emoji] = 1;
    }

    sfx.playClick();
    saveState();
    renderMessages();
  }

  // ==========================================================================
  // Delete Message Handling
  // ==========================================================================
  function deleteMessage(msgId) {
    const chat = getActiveChat();
    if (!chat) return;
    chat.messages = chat.messages.filter(m => m.id !== msgId);
    saveState();
    renderMessages();
    renderChatList();
    showToast('Message deleted', 'info');
  }

  // ==========================================================================
  // Scrolling & Unread Indicator
  // ==========================================================================
  function scrollToBottom(smooth = true) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function setupScrollListener() {
    const container = document.getElementById('messages-container');
    const scrollBtn = document.getElementById('scroll-bottom-btn');
    if (!container || !scrollBtn) return;

    container.addEventListener('scroll', () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom > 150) {
        scrollBtn.hidden = false;
      } else {
        scrollBtn.hidden = true;
      }
    });

    scrollBtn.addEventListener('click', () => {
      scrollToBottom(true);
    });
  }

  // ==========================================================================
  // Sending Messages
  // ==========================================================================
  function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input) return;

    const rawText = input.value.trim();
    const hasAttachment = Boolean(appState.pendingAttachment);

    if (!rawText && !hasAttachment) return;

    const chat = getActiveChat();
    if (!chat) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderName: 'You',
      text: rawText,
      time: formatTimestamp(Date.now()),
      timestamp: Date.now(),
      status: 'sent',
      reactions: {}
    };

    if (appState.replyTarget) {
      newMsg.replyTo = { ...appState.replyTarget };
    }

    if (appState.pendingAttachment) {
      newMsg.attachment = { ...appState.pendingAttachment };
    }

    chat.messages.push(newMsg);
    sfx.playSend();

    // Clear input & previews
    input.value = '';
    if (!CSS.supports('field-sizing', 'content')) {
      input.style.height = 'auto';
    }
    cancelReply();
    clearAttachment();

    saveState();
    renderMessages();
    renderChatList();

    // Simulated status update: delivered then read
    setTimeout(() => {
      newMsg.status = 'delivered';
      saveState();
      renderMessages();
    }, 600);

    // Trigger AI / Contact Response
    handleIncomingResponse(chat, rawText);
  }

  // ==========================================================================
  // Incoming Response Engine (Gemini API or Smart Simulation)
  // ==========================================================================
  async function handleIncomingResponse(chat, userPrompt) {
    const typingIndicator = document.getElementById('typing-indicator');
    const typingText = document.getElementById('typing-text');
    const typingAvatar = document.getElementById('typing-avatar');

    if (typingIndicator) {
      typingIndicator.hidden = false;
      if (typingAvatar) typingAvatar.textContent = chat.avatar || '💬';
      if (typingText) typingText.textContent = `${chat.name} is typing...`;
    }

    if (chat.type === 'ai') {
      // Check if real Gemini API key is configured
      if (appState.settings.geminiApiKey.trim()) {
        await handleGeminiApiCall(chat, userPrompt);
      } else {
        await handleSmartAiSimulation(chat, userPrompt);
      }
    } else if (chat.type === 'group') {
      handleGroupResponse(chat, userPrompt);
    } else {
      handleDirectResponse(chat, userPrompt);
    }
  }

  // ==========================================================================
  // Direct Google Gemini API Integration
  // ==========================================================================
  async function handleGeminiApiCall(chat, userPrompt) {
    const typingIndicator = document.getElementById('typing-indicator');
    const apiKey = appState.settings.geminiApiKey.trim();
    const model = appState.settings.geminiModel || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Build context history from recent messages
    const contents = chat.messages.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }]
    }));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

      if (typingIndicator) typingIndicator.hidden = true;

      deliverIncomingMessage(chat, {
        sender: 'ai',
        senderName: chat.name,
        text: aiReplyText
      });
    } catch (err) {
      console.error('Gemini API call error:', err);
      if (typingIndicator) typingIndicator.hidden = true;
      deliverIncomingMessage(chat, {
        sender: 'ai',
        senderName: chat.name,
        text: `⚠️ **Gemini API Error**: ${err.message}\n\n*Tip: Check your API Key in Settings or clear it to use the built-in offline smart assistant.*`
      });
    }
  }

  // ==========================================================================
  // Smart Offline AI Simulation
  // ==========================================================================
  async function handleSmartAiSimulation(chat, prompt) {
    const typingIndicator = document.getElementById('typing-indicator');
    const lower = prompt.toLowerCase();
    let reply = "";

    // Simulated reasoning delay
    const delay = Math.min(2200, Math.max(900, prompt.length * 20));
    await new Promise(r => setTimeout(r, delay));

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      reply = "Hello there! 👋 How can I assist you with your projects, coding, or questions today?";
    } else if (lower.includes('css') || lower.includes('container query') || lower.includes('flexbox') || lower.includes('grid')) {
      reply = "Modern CSS has evolved tremendously! Here is a great example of **CSS Container Queries**:\n\n```css\n.card-container {\n  container-type: inline-size;\n  container-name: card;\n}\n\n@container card (min-width: 450px) {\n  .card {\n    display: grid;\n    grid-template-columns: 1fr 2fr;\n    gap: 1.5rem;\n  }\n}\n```\n\nUnlike media queries which query the global viewport, container queries allow components to adapt dynamically based on their parent container's width!";
    } else if (lower.includes('typescript') || lower.includes('javascript') || lower.includes('debounce') || lower.includes('function')) {
      reply = "Here is a clean, type-safe **debounce** function in TypeScript:\n\n```typescript\nfunction debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delayMs: number\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout> | null = null;\n  \n  return (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delayMs);\n  };\n}\n```\n\nThis prevents redundant rapid executions on user inputs, searches, or resize events.";
    } else if (lower.includes('python') || lower.includes('api') || lower.includes('flask') || lower.includes('fastapi')) {
      reply = "In Python, **FastAPI** is a modern favorite for high-performance APIs:\n\n```python\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/api/health')\ndef health_check():\n    return {'status': 'healthy', 'version': '1.0.0'}\n```\n\nIt features automatic OpenAPI docs, Pydantic validation, and native async support!";
    } else if (lower.includes('quantum') || lower.includes('physics')) {
      reply = "🔬 **Quantum Computing in simple terms**:\n\n1. **Bits vs. Qubits**: Classical computers use bits (`0` or `1`). Quantum computers use qubits, which can exist in a **superposition** of both states simultaneously.\n2. **Entanglement**: Qubits can be linked so that the state of one instantaneously determines the other, unlocking exponential parallel calculation paths for cryptography, materials science, and optimization.";
    } else if (lower.includes('joke') || lower.includes('funny')) {
      reply = "Why do programmers prefer dark mode? 🕶️\n\n*Because light attracts bugs!* 🐛 😄";
    } else {
      reply = `I processed your inquiry: **"${escapeHTML(prompt)}"**.\n\n* **Status**: Analysis complete.\n* **Insight**: Everything is functioning normally. You can ask for code examples, technical explanations, or step-by-step guides.\n\nConnect an official **Gemini API key** in Settings if you'd like live web knowledge and deeper multi-turn reasoning!`;
    }

    if (typingIndicator) typingIndicator.hidden = true;

    deliverIncomingMessage(chat, {
      sender: 'ai',
      senderName: chat.name,
      text: reply
    });
  }

  // ==========================================================================
  // Group Chat Simulation
  // ==========================================================================
  function handleGroupResponse(chat, prompt) {
    const typingIndicator = document.getElementById('typing-indicator');
    const members = [
      { name: 'Alex (Tech Lead)', avatar: 'A' },
      { name: 'Sophia (UI/UX)', avatar: 'S' },
      { name: 'Liam (QA)', avatar: 'L' }
    ];
    const respondent = members[Math.floor(Math.random() * members.length)];

    setTimeout(() => {
      if (typingIndicator) typingIndicator.hidden = true;

      const responses = [
        `Good point on that! Let's incorporate it into our next PR review.`,
        `Checked it out. Looks solid to me! 👍`,
        `Nice work! I'll update the tracking board accordingly.`,
        `Sounds like a plan. Let me know if you need any extra test cases.`
      ];
      const randomText = responses[Math.floor(Math.random() * responses.length)];

      deliverIncomingMessage(chat, {
        sender: respondent.name.split(' ')[0],
        senderName: respondent.name,
        text: randomText
      });
    }, 1800);
  }

  // ==========================================================================
  // Direct Message Simulation
  // ==========================================================================
  function handleDirectResponse(chat, prompt) {
    const typingIndicator = document.getElementById('typing-indicator');

    setTimeout(() => {
      if (typingIndicator) typingIndicator.hidden = true;
      deliverIncomingMessage(chat, {
        sender: chat.name.split(' ')[0],
        senderName: chat.name,
        text: `Got your message! Thanks for keeping me updated.`
      });
    }, 1600);
  }

  // Deliver incoming message helper
  function deliverIncomingMessage(chat, msgData) {
    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: msgData.sender,
      senderName: msgData.senderName,
      text: msgData.text,
      time: formatTimestamp(Date.now()),
      timestamp: Date.now(),
      status: 'delivered',
      reactions: {}
    };

    chat.messages.push(newMsg);

    // If user is currently in a different chat, increase unread badge
    if (chat.id !== appState.activeChatId) {
      chat.unreadCount = (chat.unreadCount || 0) + 1;
    }

    sfx.playReceive();
    saveState();
    renderMessages();
    renderChatList();
  }

  // ==========================================================================
  // Attachment Handling
  // ==========================================================================
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      appState.pendingAttachment = {
        name: file.name,
        type: file.type,
        dataUrl: event.target.result
      };

      const previewBar = document.getElementById('attachment-preview-bar');
      const previewImg = document.getElementById('attachment-preview-img');
      const nameEl = document.getElementById('attachment-name');

      if (previewBar && previewImg && nameEl) {
        previewImg.src = event.target.result;
        nameEl.textContent = file.name;
        previewBar.hidden = false;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function clearAttachment() {
    appState.pendingAttachment = null;
    const previewBar = document.getElementById('attachment-preview-bar');
    if (previewBar) previewBar.hidden = true;
  }

  // ==========================================================================
  // Voice Memo Recording Simulator
  // ==========================================================================
  function startVoiceRecording() {
    appState.isVoiceRecording = true;
    appState.voiceSeconds = 0;

    const bar = document.getElementById('voice-recording-bar');
    const timer = document.getElementById('recording-timer');
    if (bar) bar.hidden = false;
    if (timer) timer.textContent = '00:00';

    sfx.playClick();

    appState.voiceTimerInterval = setInterval(() => {
      appState.voiceSeconds++;
      const mins = String(Math.floor(appState.voiceSeconds / 60)).padStart(2, '0');
      const secs = String(appState.voiceSeconds % 60).padStart(2, '0');
      if (timer) timer.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopVoiceRecording(shouldSend = false) {
    if (!appState.isVoiceRecording) return;
    clearInterval(appState.voiceTimerInterval);
    appState.isVoiceRecording = false;

    const bar = document.getElementById('voice-recording-bar');
    if (bar) bar.hidden = true;

    if (shouldSend) {
      const chat = getActiveChat();
      if (!chat) return;

      const mins = Math.floor(appState.voiceSeconds / 60);
      const secs = String(appState.voiceSeconds % 60).padStart(2, '0');
      const durationStr = `${mins}:${secs}`;

      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        senderName: 'You',
        isVoice: true,
        voiceDuration: durationStr === '0:00' ? '0:04' : durationStr,
        text: '',
        time: formatTimestamp(Date.now()),
        timestamp: Date.now(),
        status: 'sent',
        reactions: {}
      };

      chat.messages.push(newMsg);
      sfx.playSend();
      saveState();
      renderMessages();
      renderChatList();

      setTimeout(() => {
        newMsg.status = 'delivered';
        saveState();
        renderMessages();
      }, 500);

      // Trigger contact reaction
      handleIncomingResponse(chat, "voice message");
    }
  }

  // ==========================================================================
  // Emoji Picker Popover
  // ==========================================================================
  function setupEmojiPicker() {
    const grid = document.getElementById('emoji-grid');
    const panel = document.getElementById('emoji-picker-panel');
    const toggleBtn = document.getElementById('emoji-picker-btn');
    const closeBtn = document.getElementById('close-emoji-panel');
    const input = document.getElementById('message-input');

    if (!grid || !panel || !toggleBtn) return;

    grid.innerHTML = '';
    EMOJI_PALETTE.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', emoji);
      btn.addEventListener('click', () => {
        if (input) {
          input.value += emoji;
          input.focus();
          if (!CSS.supports('field-sizing', 'content')) {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
          }
        }
        panel.hidden = true;
      });
      grid.appendChild(btn);
    });

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.hidden = true;
      });
    }

    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== toggleBtn) {
        panel.hidden = true;
      }
    });
  }

  // ==========================================================================
  // Export Chat
  // ==========================================================================
  function exportChat(format = 'markdown') {
    const chat = getActiveChat();
    if (!chat) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'markdown') {
      filename = `${chat.name.replace(/\s+/g, '_')}_transcript.md`;
      mimeType = 'text/markdown;charset=utf-8;';
      content = `# Chat Transcript: ${chat.name}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
      chat.messages.forEach(m => {
        const time = m.time || formatTimestamp(m.timestamp);
        content += `**${m.senderName || m.sender}** [${time}]:\n${m.text || (m.isVoice ? '[Voice note]' : '[Attachment]')}\n\n`;
      });
    } else {
      filename = `${chat.name.replace(/\s+/g, '_')}_data.json`;
      mimeType = 'application/json;charset=utf-8;';
      content = JSON.stringify(chat, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Conversation exported as ${filename}`, 'success');
  }

  function exportAllData() {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PulseChat_Full_Backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('All app data exported successfully', 'success');
  }

  // ==========================================================================
  // Clear Messages & Reset Defaults
  // ==========================================================================
  function clearActiveChat() {
    const chat = getActiveChat();
    if (!chat) return;
    if (confirm(`Are you sure you want to clear all messages in "${chat.name}"?`)) {
      chat.messages = [];
      saveState();
      renderMessages();
      renderChatList();
      showToast('Chat history cleared', 'info');
    }
  }

  function resetToDefaults() {
    if (confirm('Reset all conversations and preferences to default demo data?')) {
      localStorage.removeItem(STORAGE_KEY_CHATS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      appState.chats = JSON.parse(JSON.stringify(INITIAL_CHATS));
      appState.activeChatId = appState.chats[0].id;
      applyTheme('dark');
      saveState();
      renderChatList();
      renderActiveChatHeader();
      renderMessages();
      showToast('Reset to demo data complete', 'success');
    }
  }

  // ==========================================================================
  // Mobile Sidebar Drawer
  // ==========================================================================
  function toggleMobileSidebar() {
    const sidebar = document.getElementById('chat-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar || !backdrop) return;
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('active');
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('chat-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  // ==========================================================================
  // Settings & New Chat Dialogs
  // ==========================================================================
  function setupDialogs() {
    setupDialogFallbacks();

    // Settings Dialog
    const settingsDialog = document.getElementById('settings-dialog');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    if (settingsDialog && openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        // Sync values
        const apiKeyInput = document.getElementById('gemini-api-key-input');
        const modelSelect = document.getElementById('gemini-model-select');
        const soundToggle = document.getElementById('sound-toggle-checkbox');

        if (apiKeyInput) apiKeyInput.value = appState.settings.geminiApiKey || '';
        if (modelSelect) modelSelect.value = appState.settings.geminiModel || 'gemini-2.5-flash';
        if (soundToggle) soundToggle.checked = appState.settings.soundEnabled;

        settingsDialog.showModal();
      });
    }

    // New Chat Dialog
    const newChatDialog = document.getElementById('new-chat-dialog');
    const openNewChatBtn = document.getElementById('open-new-chat-btn');
    const cancelNewChatBtn = document.getElementById('cancel-new-chat-btn');
    const newChatForm = document.getElementById('new-chat-form');

    if (newChatDialog && openNewChatBtn) {
      openNewChatBtn.addEventListener('click', () => {
        newChatDialog.showModal();
      });
    }

    if (cancelNewChatBtn && newChatDialog) {
      cancelNewChatBtn.addEventListener('click', () => {
        newChatDialog.close();
      });
    }

    if (newChatForm && newChatDialog) {
      newChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-contact-name')?.value.trim();
        const type = document.getElementById('new-contact-type')?.value || 'direct';
        const avatar = document.getElementById('new-contact-avatar')?.value.trim() || '💬';
        const prompt = document.getElementById('new-contact-prompt')?.value.trim();

        if (!name) return;

        const newId = 'chat-custom-' + Date.now();
        const newConversation = {
          id: newId,
          name: name,
          type: type,
          avatar: avatar,
          avatarClass: type === 'ai' ? 'bot-avatar' : (type === 'group' ? 'group-avatar' : ''),
          status: 'online',
          subtitle: type === 'ai' ? 'Custom AI Assistant' : (type === 'group' ? 'Custom Group' : 'Direct Contact'),
          badge: type === 'ai' ? 'AI' : (type === 'group' ? 'Group' : 'Direct'),
          unreadCount: 0,
          messages: []
        };

        if (prompt) {
          newConversation.messages.push({
            id: 'msg-' + Date.now(),
            sender: type === 'ai' ? 'ai' : name.split(' ')[0],
            senderName: name,
            text: prompt,
            time: formatTimestamp(Date.now()),
            timestamp: Date.now(),
            status: 'read',
            reactions: {}
          });
        }

        appState.chats.unshift(newConversation);
        appState.activeChatId = newId;
        saveState();
        renderChatList();
        renderActiveChatHeader();
        renderMessages();

        newChatDialog.close();
        newChatForm.reset();
        showToast(`Created "${name}" conversation`, 'success');
      });
    }

    // Theme selector inside settings
    document.querySelectorAll('input[name="theme-pref"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        applyTheme(e.target.value);
      });
    });

    // Sound toggle inside settings
    const soundToggle = document.getElementById('sound-toggle-checkbox');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        appState.settings.soundEnabled = e.target.checked;
        saveState();
        if (e.target.checked) sfx.playReceive();
      });
    }

    // Gemini API Key save & test
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const modelSelect = document.getElementById('gemini-model-select');
    const testApiBtn = document.getElementById('test-api-key-btn');
    const clearApiBtn = document.getElementById('clear-api-key-btn');
    const toggleKeyBtn = document.getElementById('toggle-key-visibility-btn');
    const apiTestStatus = document.getElementById('api-test-status');

    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', (e) => {
        appState.settings.geminiApiKey = e.target.value.trim();
        saveState();
      });
    }

    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        appState.settings.geminiModel = e.target.value;
        saveState();
      });
    }

    if (toggleKeyBtn && apiKeyInput) {
      toggleKeyBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
          apiKeyInput.type = 'text';
          toggleKeyBtn.textContent = 'Hide';
        } else {
          apiKeyInput.type = 'password';
          toggleKeyBtn.textContent = 'Show';
        }
      });
    }

    if (clearApiBtn && apiKeyInput) {
      clearApiBtn.addEventListener('click', () => {
        apiKeyInput.value = '';
        appState.settings.geminiApiKey = '';
        saveState();
        if (apiTestStatus) {
          apiTestStatus.hidden = false;
          apiTestStatus.className = 'api-test-status info';
          apiTestStatus.textContent = 'Key cleared. Running in smart offline demo mode.';
        }
        showToast('API Key cleared', 'info');
      });
    }

    if (testApiBtn && apiKeyInput) {
      testApiBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
          showToast('Please enter an API Key to test', 'error');
          return;
        }

        testApiBtn.disabled = true;
        testApiBtn.textContent = 'Testing...';
        if (apiTestStatus) {
          apiTestStatus.hidden = false;
          apiTestStatus.className = 'api-test-status';
          apiTestStatus.textContent = 'Connecting to Google Gemini API...';
        }

        try {
          const model = modelSelect?.value || 'gemini-2.5-flash';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Hello, respond with OK if connection is successful' }] }]
            })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${res.status}`);
          }

          if (apiTestStatus) {
            apiTestStatus.className = 'api-test-status success';
            apiTestStatus.textContent = '✅ Connected successfully to Gemini API!';
          }
          showToast('API Key verified!', 'success');
        } catch (err) {
          if (apiTestStatus) {
            apiTestStatus.className = 'api-test-status error';
            apiTestStatus.textContent = `❌ Test failed: ${err.message}`;
          }
          showToast('Connection failed', 'error');
        } finally {
          testApiBtn.disabled = false;
          testApiBtn.textContent = 'Test Connection';
        }
      });
    }

    // Export all data button
    const exportAllBtn = document.getElementById('export-all-data-btn');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', exportAllData);
    }

    // Reset defaults button
    const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
    if (resetDefaultsBtn) {
      resetDefaultsBtn.addEventListener('click', resetToDefaults);
    }
  }

  // ==========================================================================
  // DOM Event Bindings & Initialization
  // ==========================================================================
  function init() {
    loadState();
    applyTheme(appState.settings.theme);

    // Setup growable textarea
    const messageInput = document.getElementById('message-input');
    setupGrowableTextarea(messageInput);

    // Render initial views
    renderChatList();
    renderActiveChatHeader();
    renderMessages();
    setupScrollListener();
    setupDialogs();
    setupEmojiPicker();

    // Theme toggle button in sidebar
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const next = appState.settings.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // Sidebar filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        appState.activeFilter = tab.getAttribute('data-filter') || 'all';
        renderChatList();
      });
    });

    // Sidebar search
    const contactSearch = document.getElementById('contact-search-input');
    if (contactSearch) {
      contactSearch.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value;
        renderChatList();
      });
    }

    // In-chat search toggle
    const toggleSearchBtn = document.getElementById('toggle-search-btn');
    const inChatSearchBar = document.getElementById('in-chat-search-bar');
    const msgSearchInput = document.getElementById('message-search-input');
    const closeSearchBtn = document.getElementById('close-search-btn');

    if (toggleSearchBtn && inChatSearchBar && msgSearchInput) {
      toggleSearchBtn.addEventListener('click', () => {
        const isHidden = inChatSearchBar.hidden;
        inChatSearchBar.hidden = !isHidden;
        if (!inChatSearchBar.hidden) {
          msgSearchInput.focus();
        } else {
          appState.inChatSearchQuery = '';
          renderMessages();
        }
      });

      msgSearchInput.addEventListener('input', (e) => {
        appState.inChatSearchQuery = e.target.value;
        renderMessages();
      });

      if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
          inChatSearchBar.hidden = true;
          appState.inChatSearchQuery = '';
          renderMessages();
        });
      }
    }

    // Clear active chat button
    const clearChatBtn = document.getElementById('clear-chat-btn');
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', clearActiveChat);
    }

    // Export chat button
    const exportChatBtn = document.getElementById('export-chat-btn');
    if (exportChatBtn) {
      exportChatBtn.addEventListener('click', () => exportChat('markdown'));
    }

    // Mobile menu toggle & backdrop
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

    // Cancel reply button
    const cancelReplyBtn = document.getElementById('cancel-reply-btn');
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', cancelReply);

    // Remove attachment button
    const removeAttachmentBtn = document.getElementById('remove-attachment-btn');
    if (removeAttachmentBtn) removeAttachmentBtn.addEventListener('click', clearAttachment);

    // File input attachment
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('file-attachment-input');
    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleFileSelect);
    }

    // Voice record button
    const voiceRecordBtn = document.getElementById('voice-record-btn');
    const cancelVoiceBtn = document.getElementById('cancel-voice-btn');
    const sendVoiceBtn = document.getElementById('send-voice-btn');

    if (voiceRecordBtn) {
      voiceRecordBtn.addEventListener('click', () => {
        if (!appState.isVoiceRecording) {
          startVoiceRecording();
        }
      });
    }

    if (cancelVoiceBtn) {
      cancelVoiceBtn.addEventListener('click', () => stopVoiceRecording(false));
    }

    if (sendVoiceBtn) {
      sendVoiceBtn.addEventListener('click', () => stopVoiceRecording(true));
    }

    // Send button & Enter key on message input
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
      });
    }

    if (messageInput) {
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Focus input on '/' if not currently focusing an input
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        messageInput?.focus();
      }
      // Esc to dismiss reply preview or emoji picker
      if (e.key === 'Escape') {
        const emojiPanel = document.getElementById('emoji-picker-panel');
        if (emojiPanel && !emojiPanel.hidden) {
          emojiPanel.hidden = true;
        } else if (appState.replyTarget) {
          cancelReply();
        }
      }
    });

    console.log('PulseChat initialized successfully.');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
