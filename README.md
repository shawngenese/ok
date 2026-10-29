# PulseChat — Modern Single Page Chat App

A responsive, feature-rich single page chat application built with modern web standards, semantic HTML5, CSS3, and vanilla JavaScript. It works offline out-of-the-box with smart AI simulation and can optionally connect to Google's Gemini API for live multi-turn reasoning.

---

## 🌟 Key Features

1. **Multiple Chat Channels & Direct Messages**:
   - 🤖 **Gemini AI Assistant**: Conversational assistant with markdown support, code blocks, and instant responses.
   - 👥 **Sprint Team Alpha**: Group chat simulation with multi-persona team responses (Alex, Sophia, Liam).
   - 💻 **Dev Mentorship Bot**: Coding tips, architecture insights, and code reviews.
   - 👤 **Sarah Connor**: Direct message channel with mock history and voice notes.
   - ➕ **Custom Conversations**: Create your own channels or AI personas with custom avatars and initial system prompts.

2. **Rich Message Formatting**:
   - **Markdown Parsing**: Fenced code blocks with language labels and one-click "Copy Code" button, inline code, bold, italics, blockquotes, lists, and links.
   - **Message Status Indicators**: Real-time Sent (`✓`), Delivered (`✓✓`), and Read (`✓✓` blue) checkmarks.
   - **Message Reactions**: Quick emoji reactions (👍, ❤️, 🔥, 😂, 🎉, 🚀, etc.) with reaction pills and counter tracking.
   - **Quoted Replies**: Click reply on any message to quote it directly above your text input.
   - **Image Attachments**: Attach photos from your device with image preview, thumbnail removal, and full-resolution lightbox viewer.
   - **Voice Memo Simulator**: Record audio messages with real-time timer, visualizer waveform, and audio playback.

3. **Audio Effects & Theming**:
   - **Web Audio API Synthesizers**: Subtle, pleasant message pop and chime sound effects with zero external audio assets (toggleable in Settings).
   - **Theme Switcher**: Dark mode, light mode, or system automatic sync (`color-scheme` support).
   - **Auto-Sizing Input**: Modern CSS `field-sizing: content` with progressive fallback for dynamic textarea expansion.

4. **Search & Data Management**:
   - **In-Chat Message Search**: Search messages in the active chat with match counts and yellow highlight focus.
   - **Sidebar Search & Filtering**: Filter chats by All, AI Bots, Groups, or Unread messages.
   - **Local Persistence**: All messages, reactions, chats, and settings are saved automatically in `localStorage`.
   - **Export Options**: Export the active conversation as a Markdown (`.md`) transcript or JSON, or download full data backup.
   - **Google Gemini API Integration**: Enter your own free API Key from Google AI Studio in Settings to talk with live Gemini models (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`) directly from your browser!

---

## 🚀 Quick Start

### Option 1: Direct Browser Opening (Zero install)
Simply double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run via Node.js
```bash
# In this directory:
npm start
# Or: node server.js
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Enter</kbd> | Send message |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Insert newline in message input |
| <kbd>/</kbd> | Quickly focus message input from anywhere |
| <kbd>Esc</kbd> | Close dialogs, dismiss reply preview, or close emoji picker |

---

## 🛠️ Standards & Best Practices

- **Semantic HTML5**: Native `<dialog>` elements for overlays with overscroll containment (`dialog:modal { overscroll-behavior: contain; }`), native `<button>` elements, accessible forms, and ARIA labels.
- **Form Controls**: Dynamic sizing using `field-sizing: content` with min/max block limits and progressive JavaScript fallback.
- **User Experience**: Content text is never restricted with `user-select: none`, ensuring seamless copy-pasting for code and chat text.
- **CSS Architecture**: CSS custom variables for light/dark themes, `color-scheme`, accessible contrast ratios, and responsive mobile drawer navigation.
