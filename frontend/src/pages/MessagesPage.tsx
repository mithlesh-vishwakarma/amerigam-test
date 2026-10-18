import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  Send,
  Search,
  Sparkles,
  CheckCheck,
  Circle,
  Image as ImageIcon,
  Smile,
  Phone,
  Video,
  Info,
  X,
  Plus,
  ShieldCheck,
  Mic,
  MoreVertical,
  Paperclip,
  Check,
  PhoneOff,
  VideoOff,
  User,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
  VolumeX,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, USER_PROFILES, AUTH_CHANGED_EVENT, UserProfile } from '@/lib/user-profiles';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  image?: string;
  reaction?: string;
}

interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  themeColor: string;
  online: boolean;
  unreadCount?: number;
  bio?: string;
  rank?: string;
  points?: string;
  rating?: string;
  skills?: string[];
  hobbies?: string[];
  messages: Message[];
}

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '🚀', '😂', '✨', '🎬', '💡'];

const SAMPLE_ATTACHMENTS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
];

export function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'online'>('all');
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState<'directory' | 'chat'>('chat');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize conversations dynamically based on current user
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return buildDefaultConversations(getCurrentUser());
  });

  useEffect(() => {
    const handleAuth = () => {
      const nextUser = getCurrentUser();
      setCurrentUser(nextUser);
      setConversations(buildDefaultConversations(nextUser));
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
  }, []);

  // Set default active conversation if not set
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  const handleSendMessage = (e?: React.FormEvent, customImg?: string) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if ((!trimmed && !customImg) || !activeConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: trimmed || (customImg ? 'Shared an image attachment' : ''),
      image: customImg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation.id
          ? {
            ...conv,
            unreadCount: 0,
            messages: [...conv.messages, newMsg],
          }
          : conv
      )
    );
    setInputText('');
    setShowEmojiBar(false);

    // Simulated reply after 1.4 seconds if this was user's first query
    if (activeConversation.messages.length % 2 === 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          'Brilliant point! Completely aligned with our creative direction.',
          'Love this idea. Let me draft a prototype workflow for this.',
          'Got it! Checking the metrics now, looks super promising.',
          'Awesome breakdown! Shared it with the community guild as well. 🚀',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: Message = {
          id: `msg-reply-${Date.now()}`,
          senderId: activeConversation.id,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation.id
              ? {
                ...conv,
                messages: [...conv.messages, replyMsg],
              }
              : conv
          )
        );
      }, 1400);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversation.id) return conv;
        return {
          ...conv,
          messages: conv.messages.map((m) =>
            m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m
          ),
        };
      })
    );
  };

  const handleSendSampleImage = () => {
    const randomImg = SAMPLE_ATTACHMENTS[Math.floor(Math.random() * SAMPLE_ATTACHMENTS.length)];
    handleSendMessage(undefined, randomImg);
    showToast('Image attachment sent!');
  };

  const handleSimulateVoiceNote = () => {
    setIsRecordingVoice(true);
    showToast('Recording voice message...');
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceMsg: Message = {
        id: `voice-${Date.now()}`,
        senderId: currentUser.id,
        text: '🎙️ Voice note (0:14) • High fidelity opus audio',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? { ...conv, messages: [...conv.messages, voiceMsg] }
            : conv
        )
      );
      showToast('Voice note delivered!');
    }, 2000);
  };

  const handleClearChat = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: [] } : c))
    );
    setShowMoreMenu(false);
    showToast('Conversation cleared.');
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(filterQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'unread') return (c.unreadCount || 0) > 0;
    if (activeTab === 'online') return c.online;
    return true;
  });

  return (
    <AppShell right={false} contentClassName="messages-main-content">
      <div className="messages-hub-container">
        {/* Main 2-Pane / 3-Pane Layout */}
        <div className="messages-layout-card">
          {/* ================= LEFT PANE: DIRECTORY ================= */}
          <aside className={`messages-directory-pane ${mobileView === 'directory' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="messages-directory-header">
              <div className="messages-header-top-row">
                <div className="messages-header-title">
                  <h2>Messages</h2>
                  <span className="online-pill">
                    <span className="pulse-dot" /> Live
                  </span>
                </div>
                <button
                  type="button"
                  className="new-chat-trigger-btn"
                  onClick={() => setShowNewChatModal(true)}
                  title="Start New Direct Message"
                >
                  <Plus size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Search Conversations Input */}
              <div className="conv-search-box">
                <Search size={15} color="#8c8e98" />
                <input
                  type="text"
                  placeholder="Search creators or roles..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    style={{ background: 'transparent', border: 0, color: '#888', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="conv-filter-tabs">
              <button
                type="button"
                className={`conv-filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({conversations.length})
              </button>
              <button
                type="button"
                className={`conv-filter-tab ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread
              </button>
              <button
                type="button"
                className={`conv-filter-tab ${activeTab === 'online' ? 'active' : ''}`}
                onClick={() => setActiveTab('online')}
              >
                Online Now
              </button>
            </div>

            {/* Conversation List */}
            <div className="conversation-list-scroll">
              {filteredConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#71717a', fontSize: '13px' }}>
                  No creators found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConvId;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`conversation-item-btn ${isSelected ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setMobileView('chat');
                        setConversations((prev) =>
                          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                        );
                      }}
                    >
                      <div className="conv-avatar-wrap">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="conv-avatar"
                          style={{ borderColor: isSelected ? conv.themeColor : 'transparent' }}
                        />
                        {conv.online && <span className="conv-online-badge" />}
                      </div>

                      <div className="conv-text-meta">
                        <div className="conv-top-row">
                          <span className="conv-name">{conv.name}</span>
                          <span className="conv-time">{lastMsg?.time || ''}</span>
                        </div>
                        <div className="conv-bottom-row">
                          <span
                            className="conv-role-chip"
                            style={{
                              color: conv.themeColor,
                              borderColor: `${conv.themeColor}33`,
                              background: `${conv.themeColor}12`,
                            }}
                          >
                            {conv.role}
                          </span>
                          <p className="conv-last-msg">{lastMsg?.text || 'No messages yet'}</p>
                        </div>
                      </div>

                      {Boolean(conv.unreadCount) && (
                        <span className="conv-unread-pill">{conv.unreadCount}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ================= RIGHT PANE: ACTIVE CHAT ================= */}
          <section className="messages-chat-pane">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <header className="chat-active-header">
                  <div className="chat-header-user">
                    <button
                      type="button"
                      className="chat-mobile-back-btn"
                      onClick={() => setMobileView('directory')}
                      title="Back to conversations"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="chat-avatar-wrap">
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="chat-header-avatar"
                        style={{ borderColor: activeConversation.themeColor }}
                      />
                      {activeConversation.online && <span className="chat-online-badge" />}
                    </div>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <h3 className="chat-user-name">{activeConversation.name}</h3>
                        <span
                          className="chat-user-role-badge"
                          style={{
                            color: activeConversation.themeColor,
                            background: `${activeConversation.themeColor}15`,
                            border: `1px solid ${activeConversation.themeColor}30`,
                          }}
                        >
                          {activeConversation.role}
                        </span>
                      </div>
                      <p className="chat-user-status">
                        {activeConversation.online ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Circle size={7} fill="#10b981" /> Active Now
                          </span>
                        ) : (
                          <span>@{activeConversation.username} · Offline</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="chat-header-actions">
                    <button
                      type="button"
                      className="chat-header-btn"
                      onClick={() => setActiveCallType('audio')}
                      title="Start Secure Audio Call"
                    >
                      <Phone size={17} />
                    </button>
                    <button
                      type="button"
                      className="chat-header-btn"
                      onClick={() => setActiveCallType('video')}
                      title="Start 4K Video Link"
                    >
                      <Video size={17} />
                    </button>
                    <button
                      type="button"
                      className={`chat-header-btn ${showInfoSidebar ? 'btn-active' : ''}`}
                      onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                      title={showInfoSidebar ? 'Hide Creator Info' : 'Show Creator Info'}
                    >
                      {showInfoSidebar ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className="chat-header-btn"
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        title="More Options"
                      >
                        <MoreVertical size={17} />
                      </button>
                      {showMoreMenu && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '42px',
                            background: '#1b1c25',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            padding: '6px',
                            minWidth: '160px',
                            zIndex: 30,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              showToast('Notifications muted for 8 hours.');
                              setShowMoreMenu(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              background: 'transparent',
                              border: 0,
                              color: '#cbd5e1',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              textAlign: 'left',
                            }}
                          >
                            <VolumeX size={14} /> Mute Chat
                          </button>
                          <button
                            type="button"
                            onClick={handleClearChat}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              background: 'transparent',
                              border: 0,
                              color: '#f43f5e',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              textAlign: 'left',
                            }}
                          >
                            <Trash2 size={14} /> Clear Messages
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                {/* Messages Bubbles Scroll Area */}
                <div className="chat-bubbles-scroll">
                  <div className="chat-encryption-notice">
                    <ShieldCheck size={14} color="#00a8ed" />
                    <span>Direct end-to-end creator messaging on Amerigam</span>
                  </div>

                  <div className="chat-date-separator">
                    <span className="chat-date-pill">Today</span>
                  </div>

                  {activeConversation.messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`chat-bubble-row ${isMe ? 'is-me' : 'is-them'}`}
                      >
                        {!isMe && (
                          <img
                            src={activeConversation.avatar}
                            alt=""
                            className="chat-bubble-avatar"
                          />
                        )}

                        <div className="chat-bubble-content">
                          {/* Hover Reaction Bar */}
                          <div className="chat-reaction-bar">
                            {QUICK_EMOJIS.slice(0, 5).map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className="reaction-btn"
                                onClick={() => handleAddReaction(msg.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className={`chat-bubble-card ${isMe ? 'card-me' : 'card-them'}`}>
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Attachment"
                                className="chat-bubble-attached-img"
                                onClick={() => setPreviewImage(msg.image || null)}
                                title="Click to view full image"
                              />
                            )}
                            <p>{msg.text}</p>
                          </div>

                          {/* Reaction badge if reacted */}
                          {msg.reaction && (
                            <div className="msg-reaction-badge">
                              <span>{msg.reaction}</span>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>1</span>
                            </div>
                          )}

                          <div className={`chat-bubble-footer ${isMe ? 'text-right' : ''}`}>
                            <span>{msg.time}</span>
                            {isMe && <CheckCheck size={13} className="msg-check-icon" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && (
                    <div className="typing-indicator-row">
                      <div className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                      <span>{activeConversation.name.split(' ')[0]} is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Composer Bar */}
                <form className="chat-composer-form" onSubmit={handleSendMessage}>
                  {showEmojiBar && (
                    <div className="quick-emoji-popover">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            setShowEmojiBar(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="chat-composer-inner">
                    <button
                      type="button"
                      className="chat-tool-btn"
                      onClick={handleSendSampleImage}
                      title="Attach Image"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button
                      type="button"
                      className={`chat-tool-btn ${showEmojiBar ? 'active' : ''}`}
                      onClick={() => setShowEmojiBar(!showEmojiBar)}
                      title="Emojis"
                    >
                      <Smile size={18} />
                    </button>
                    <button
                      type="button"
                      className={`chat-tool-btn ${isRecordingVoice ? 'active' : ''}`}
                      onClick={handleSimulateVoiceNote}
                      title="Send Voice Note"
                    >
                      <Mic size={18} />
                    </button>

                    <input
                      type="text"
                      placeholder={`Message @${activeConversation.username}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="chat-text-input"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`chat-send-btn ${inputText.trim() ? 'can-send' : ''}`}
                      aria-label="Send Message"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '12px',
                  color: '#94a3b8',
                }}
              >
                <Sparkles size={36} color="#00a8ed" />
                <h3 style={{ color: '#fff', margin: 0 }}>Choose a Creator to Chat</h3>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Select any peer from your left panel to review message threads.
                </p>
              </div>
            )}
          </section>

          {/* ================= THIRD PANE: CREATOR INFO SIDEBAR ================= */}
          {showInfoSidebar && activeConversation && (
            <aside className="chat-info-sidebar">
              <div className="info-sidebar-header">
                <span className="info-sidebar-header-title">Creator Profile</span>
                <button
                  type="button"
                  className="info-sidebar-close-btn"
                  onClick={() => setShowInfoSidebar(false)}
                  title="Close Creator Info"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="info-sidebar-profile">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="info-sidebar-avatar"
                  style={{ borderColor: activeConversation.themeColor }}
                />
                <h4 className="info-sidebar-name">{activeConversation.name}</h4>
                <span className="info-sidebar-handle">@{activeConversation.username}</span>
                <span
                  className="chat-user-role-badge"
                  style={{
                    color: activeConversation.themeColor,
                    background: `${activeConversation.themeColor}15`,
                    border: `1px solid ${activeConversation.themeColor}30`,
                  }}
                >
                  {activeConversation.role}
                </span>

                {/* Quick actions row */}
                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => showToast(`Connected with @${activeConversation.username}`)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: '8px',
                      background: 'rgba(0, 168, 237, 0.15)',
                      border: '1px solid rgba(0, 168, 237, 0.35)',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <User size={13} />
                    <span>Connect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin + '/user/' + activeConversation.username);
                      showToast(`Link to @${activeConversation.username}'s profile copied!`);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                    title="Share profile link"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="info-stats-row">
                <div className="info-stat-item">
                  <strong>{activeConversation.rank || '#1'}</strong>
                  <small>Rank</small>
                </div>
                <div className="info-stat-item">
                  <strong>{activeConversation.points || '7,200'}</strong>
                  <small>Points</small>
                </div>
                <div className="info-stat-item">
                  <strong>{activeConversation.rating || '4.9'}</strong>
                  <small>Rating</small>
                </div>
              </div>

              {/* Bio Block */}
              {activeConversation.bio && (
                <div className="info-section-block">
                  <span className="info-section-title">About Creator</span>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    {activeConversation.bio}
                  </p>
                </div>
              )}

              {/* Skills Block */}
              {activeConversation.skills && activeConversation.skills.length > 0 && (
                <div className="info-section-block">
                  <span className="info-section-title">Expertise</span>
                  <div className="info-chips-wrap">
                    {activeConversation.skills.map((skill) => (
                      <span key={skill} className="info-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies Block */}
              {activeConversation.hobbies && activeConversation.hobbies.length > 0 && (
                <div className="info-section-block">
                  <span className="info-section-title">Passions & Hobbies</span>
                  <div className="info-chips-wrap">
                    {activeConversation.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="info-chip"
                        style={{ borderColor: 'rgba(236, 72, 153, 0.3)', color: '#f472b6' }}
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Attachments preview */}
              <div className="info-section-block">
                <span className="info-section-title">Shared Media</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {SAMPLE_ATTACHMENTS.slice(0, 2).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Shared media"
                      onClick={() => setPreviewImage(img)}
                      title="Click to view full image"
                      style={{
                        width: '100%',
                        height: '75px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* ================= CALL OVERLAY MODAL ================= */}
        {activeCallType && activeConversation && (
          <div className="call-modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="call-modal-card"
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={activeConversation.avatar}
                  alt=""
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: `3px solid ${activeConversation.themeColor}`,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #181922',
                  }}
                />
              </div>

              <div>
                <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '18px' }}>
                  {activeConversation.name}
                </h3>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
                  {activeCallType === 'audio'
                    ? 'Encrypted Peer Audio Call...'
                    : '4K Ultra-Low Latency Video Link...'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                }}
              >
                <Sparkles size={13} color="#00a8ed" />
                <span>WebRTC 256-bit AES Handshake</span>
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCallType(null);
                    showToast('Call ended.');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '24px',
                    background: '#ef4444',
                    border: 0,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {activeCallType === 'audio' ? <PhoneOff size={16} /> : <VideoOff size={16} />}
                  <span>End Call</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= NEW CHAT MODAL ================= */}
        {showNewChatModal && (
          <div className="new-chat-modal-overlay" onClick={() => setShowNewChatModal(false)}>
            <div className="new-chat-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b style={{ color: '#fff', fontSize: '16px' }}>New Direct Message</b>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  style={{ background: 'transparent', border: 0, color: '#888', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                Select a creator from your network to start a conversation:
              </p>

              <div className="new-chat-modal-list">
                {USER_PROFILES.filter((p) => p.id !== currentUser.id).map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      // Check if conversation exists, otherwise add it
                      if (!conversations.some((c) => c.id === profile.id)) {
                        const newConv: Conversation = {
                          id: profile.id,
                          name: profile.display_name,
                          username: profile.username,
                          avatar: profile.avatar_url,
                          role: profile.role,
                          themeColor: profile.themeColor || '#00a8ed',
                          online: true,
                          bio: profile.bio,
                          rank: profile.rank,
                          points: profile.points,
                          rating: profile.rating,
                          skills: profile.skills,
                          hobbies: profile.hobbies,
                          messages: [
                            {
                              id: `start-${Date.now()}`,
                              senderId: profile.id,
                              text: `Hi ${currentUser.display_name}! Glad to connect on Amerigam.`,
                              time: 'Just now',
                              status: 'read',
                            },
                          ],
                        };
                        setConversations([newConv, ...conversations]);
                      }
                      setActiveConvId(profile.id);
                      setMobileView('chat');
                      setShowNewChatModal(false);
                      showToast(`Chat opened with ${profile.display_name}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#1d1e27',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '13.5px' }}>
                        {profile.display_name}
                      </strong>
                      <small style={{ color: '#94a3b8' }}>@{profile.username} • {profile.role}</small>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: profile.themeColor || '#00a8ed',
                        background: `${profile.themeColor || '#00a8ed'}15`,
                      }}
                    >
                      Connect
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= IMAGE PREVIEW LIGHTBOX ================= */}
        {previewImage && (
          <div className="new-chat-modal-overlay" onClick={() => setPreviewImage(null)}>
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Enlarged attachment preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '82vh',
                  borderRadius: '14px',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  objectFit: 'contain',
                }}
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '-16px',
                  background: '#1b1c26',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                }}
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Global Toast Message */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#1c1d27',
              border: '1px solid rgba(0, 168, 237, 0.4)',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={15} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/**
 * Builds standard conversations for whichever user is active
 */
function buildDefaultConversations(activeUser: UserProfile): Conversation[] {
  const others = USER_PROFILES.filter((p) => p.id !== activeUser.id);

  const roleChatMap: Record<string, Message[]> = {
    Editor: [
      {
        id: 'ed-1',
        senderId: 'user-editor',
        text: 'Hey! Loved your breakdown on the WebGL canvas pipeline. Are you planning to add LUT post-processing shaders next?',
        time: '10:42 AM',
        status: 'read',
      },
      {
        id: 'ed-2',
        senderId: activeUser.id,
        text: 'Thanks Aarav! Yes, currently testing a custom Kodak 2383 3D LUT texture sample in the fragment pass.',
        time: '10:45 AM',
        status: 'read',
      },
      {
        id: 'ed-3',
        senderId: 'user-editor',
        text: 'That would be huge for our colorist community. Send over a preview reel whenever you have a build ready! 🎬',
        time: '10:48 AM',
        status: 'read',
      },
    ],
    'Content Writer': [
      {
        id: 'wr-1',
        senderId: 'user-writer',
        text: `Hi ${activeUser.display_name.split(' ')[0]}, I am drafting an essay on "Digital Craftsmanship & Tactile Interfaces" and would love to quote your design philosophy.`,
        time: 'Yesterday',
        status: 'read',
      },
      {
        id: 'wr-2',
        senderId: activeUser.id,
        text: 'Sounds fantastic Elena! Feel free to cite our open-source shader benchmarks.',
        time: 'Yesterday',
        status: 'read',
      },
    ],
    'Business Analyst': [
      {
        id: 'an-1',
        senderId: 'user-analyst',
        text: 'The creator economy metrics for Q3 are out. Our vertical communities have 3.4x higher 30-day retention than general feeds.',
        time: 'Oct 14',
        status: 'read',
      },
    ],
    Developer: [
      {
        id: 'dev-1',
        senderId: 'user-dev',
        text: 'Hi there! Just pushed the latest reactive state cache pipeline. Let me know if you hit any latency bottlenecks.',
        time: '09:15 AM',
        status: 'read',
      },
    ],
  };

  return others.map((profile) => ({
    id: profile.id,
    name: profile.display_name,
    username: profile.username,
    avatar: profile.avatar_url,
    role: profile.role,
    themeColor: profile.themeColor || '#00a8ed',
    online: profile.role !== 'Business Analyst',
    unreadCount: profile.role === 'Editor' ? 1 : 0,
    bio: profile.bio,
    rank: profile.rank,
    points: profile.points,
    rating: profile.rating,
    skills: profile.skills,
    hobbies: profile.hobbies,
    messages: roleChatMap[profile.role] || [
      {
        id: `gen-${profile.id}`,
        senderId: profile.id,
        text: `Hey ${activeUser.display_name}! Looking forward to collaborating on our upcoming release.`,
        time: '11:00 AM',
        status: 'read',
      },
    ],
  }));
}

export default MessagesPage;

