import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Trophy, 
  UserCheck, 
  Sparkles, 
  CheckCheck, 
  Trash2, 
  Filter,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'competition' | 'follow' | 'system';
  actor: {
    name: string;
    avatar: string;
    role?: string;
  };
  content: string;
  target?: string;
  targetUrl?: string;
  timestamp: string;
  read: boolean;
  badgeColor: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'like',
    actor: {
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Cinematographer',
    },
    content: 'liked your Golden hour color study post',
    target: 'Golden Hour Study #4',
    targetUrl: '/home',
    timestamp: '2m ago',
    read: false,
    badgeColor: '#ff3b44',
  },
  {
    id: 'n-2',
    type: 'competition',
    actor: {
      name: 'Amerigam Studio',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      role: 'Amerigam Official',
    },
    content: 'invited you to submit your reel to "Frame the Extraordinary"',
    target: 'Cash Prize $5,000',
    targetUrl: '/competitions',
    timestamp: '45m ago',
    read: false,
    badgeColor: '#00a8ed',
  },
  {
    id: 'n-3',
    type: 'comment',
    actor: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Motion Designer',
    },
    content: 'commented: "The anamorphic lens flare simulation is unreal! What LUT did you grade with?"',
    target: 'Cyberpunk Transit Reel',
    targetUrl: '/feed',
    timestamp: '2h ago',
    read: false,
    badgeColor: '#10b981',
  },
  {
    id: 'n-4',
    type: 'follow',
    actor: {
      name: 'Kavya Nair',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'Creative Director',
    },
    content: 'started following your work and added you to their visual team list',
    targetUrl: '/network',
    timestamp: '5h ago',
    read: true,
    badgeColor: '#8b5cf6',
  },
  {
    id: 'n-5',
    type: 'system',
    actor: {
      name: 'Amerigam Pulse',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      role: 'System',
    },
    content: 'Your weekly creator reach is up +148%! Check out trending audio tracks for this week.',
    target: 'Creator Insights',
    targetUrl: '/explore',
    timestamp: '1d ago',
    read: true,
    badgeColor: '#f59e0b',
  },
  {
    id: 'n-6',
    type: 'like',
    actor: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: '3D Artist',
    },
    content: 'bookmarked your Blender lighting breakdown',
    targetUrl: '/home',
    timestamp: '2d ago',
    read: true,
    badgeColor: '#ff3b44',
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'likes' | 'comments' | 'competitions'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'likes') return n.type === 'like';
    if (activeTab === 'comments') return n.type === 'comment';
    if (activeTab === 'competitions') return n.type === 'competition';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={14} fill="currentColor" />;
      case 'comment':
        return <MessageCircle size={14} fill="currentColor" />;
      case 'competition':
        return <Trophy size={14} />;
      case 'follow':
        return <UserCheck size={14} />;
      case 'system':
      default:
        return <Sparkles size={14} />;
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 0.75rem 4rem 0.75rem' }}>
        {/* Header with Title and Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 168, 237, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(0, 168, 237, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00a8ed'
            }}>
              <Bell size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Notifications
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Activity, community mentions, and competition calls
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <span style={{
                background: 'rgba(0, 168, 237, 0.15)',
                color: '#00a8ed',
                border: '1px solid rgba(0, 168, 237, 0.3)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {unreadCount} UNREAD
              </span>
            )}
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: unreadCount > 0 ? '#fff' : 'rgba(255, 255, 255, 0.35)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: unreadCount > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'likes', label: 'Likes & Saves' },
            { id: 'comments', label: 'Comments' },
            { id: 'competitions', label: 'Competitions' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #00a8ed' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? 'rgba(0, 168, 237, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#00a8ed' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications Feed */}
        {filteredNotifications.length === 0 ? (
          <div style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: '#121216',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.3)'
            }}>
              <CheckCheck size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              {activeTab === 'unread' ? 'All caught up!' : 'No notifications in this view'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '360px' }}>
              {activeTab === 'unread' 
                ? 'You have responded to and viewed all recent community activities.' 
                : 'When creators interact with your portfolio, notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleRead(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1rem',
                  background: item.read ? '#121216' : '#161922',
                  borderRadius: '14px',
                  border: item.read 
                    ? '1px solid rgba(255, 255, 255, 0.05)' 
                    : '1px solid rgba(0, 168, 237, 0.25)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, background 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Unread dot */}
                {!item.read && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#00a8ed',
                    boxShadow: '0 0 10px #00a8ed',
                  }} />
                )}

                {/* Avatar with Type Icon Badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={item.actor.avatar}
                    alt={item.actor.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '-3px',
                    right: '-3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: item.badgeColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                  }}>
                    {getIcon(item.type)}
                  </div>
                </div>

                {/* Content body */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                      {item.actor.name}
                    </span>
                    {item.actor.role && (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '1px 7px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        {item.actor.role}
                      </span>
                    )}
                  </div>

                  <p style={{
                    margin: '0.25rem 0 0.4rem 0',
                    fontSize: '0.88rem',
                    color: item.read ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.45,
                  }}>
                    {item.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {item.timestamp}
                    </span>

                    {item.targetUrl && (
                      <Link
                        to={item.targetUrl}
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.78rem',
                          color: '#00a8ed',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        {item.target || 'View details'} <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={e => handleDelete(item.id, e)}
                  title="Dismiss notification"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default NotificationsPage;
