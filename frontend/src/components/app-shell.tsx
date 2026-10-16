import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Compass,
  Globe,
  Home,
  MessageCircle,
  Network,
  PlusSquare,
  Rss,
  Search,
  Settings,
  Share2,
  Trophy,
  Sparkles,
  ChevronRight,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { InteractiveLogo } from './interactive-logo';
import { useTopLoader } from './top-loader';
import { FloatingPillNav } from './floating-pill-nav';

const nav = [
  ['Home', '/home', Home],
  ['Feed', '/feed', Rss],
  ['Explore', '/search', Compass],
  ['Competitions', '/competitions', Trophy],
  ['Create', '/create', PlusSquare],
  ['Messages', '/messages', MessageCircle],
  ['Notification', '/notifications', Bell],
] as const;

const communityProfiles = [
  {
    id: 'comm-1',
    name: 'Designers & 3D Crafters',
    tag: '18.4k members',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    query: 'Designers',
  },
  {
    id: 'comm-2',
    name: 'Next.js & Web Innovators',
    tag: '24.1k members',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500',
    query: 'Developers',
  },
  {
    id: 'comm-3',
    name: 'AI Art & Generative Media',
    tag: '31.2k members',
    icon: '🤖',
    color: 'from-purple-500 to-indigo-500',
    query: 'AI Art',
  },
  {
    id: 'comm-4',
    name: 'Cinema & Indie Filmmakers',
    tag: '12.8k members',
    icon: '🎬',
    color: 'from-amber-500 to-orange-500',
    query: 'Cinema',
  },
];

const mockFriends = [
  {
    id: 'friend-1',
    name: 'Khyatish sarapaddiya',
    role: 'Co-founder · Business',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=75',
    online: true,
  },
  {
    id: 'friend-2',
    name: 'Sarah Jenkins',
    role: 'Motion Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=75',
    online: true,
  },
  {
    id: 'friend-3',
    name: 'David Kim',
    role: 'Creative Technologist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=75',
    online: false,
  },
];

export function AppShell({
  children,
  right = true,
  isReelFeed = false,
}: {
  children: React.ReactNode;
  right?: boolean;
  isReelFeed?: boolean;
}) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { triggerPulse } = useTopLoader();
  const isFeedMode = isReelFeed || path === '/feed';

  const handleNavClick = (href: string) => {
    if (path !== href) {
      triggerPulse();
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Amerigam', url: window.location.href }).catch(() => {});
    } else {
      triggerPulse();
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={`app-shell ${isFeedMode ? 'is-reel-page' : ''}`}>
      {/* Fixed topbar with proper padding, increased search length, and matched icons */}
      <header className="topbar">
        <div className="brand brand-container">
          <InteractiveLogo size="md" />
        </div>

        <div className="search-wrap">
          <input
            aria-label="Search posts"
            placeholder="Search creators, stories, and tags..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                triggerPulse();
                navigate('/search?q=' + encodeURIComponent(e.currentTarget.value.trim()));
              }
            }}
          />
          <Search size={19} className="search-icon" />
        </div>

        {/* Action icons strictly matching user reference screenshot: Share, Globe, Bell, Settings */}
        <div className="top-actions">
          <button
            type="button"
            className="action-icon-btn"
            aria-label="Share"
            title="Share"
            onClick={handleShare}
          >
            <Share2 size={19} strokeWidth={1.7} />
          </button>
          <Link
            to="/search"
            className="action-icon-btn"
            aria-label="Explore Global"
            title="Explore Global"
            onClick={() => handleNavClick('/search')}
          >
            <Globe size={19} strokeWidth={1.7} />
          </Link>
          <Link
            to="/notifications"
            className={`action-icon-btn ${path === '/notifications' ? 'active' : ''}`}
            aria-label="Notifications"
            title="Notifications"
            onClick={() => handleNavClick('/notifications')}
          >
            <Bell size={19} strokeWidth={1.7} />
          </Link>
          <Link
            to="/settings"
            className={`action-icon-btn ${path === '/settings' ? 'active' : ''}`}
            aria-label="Settings"
            title="Settings"
            onClick={() => handleNavClick('/settings')}
          >
            <Settings size={19} strokeWidth={1.7} />
          </Link>
        </div>
      </header>

      {/* 3-column body where left-nav, main-content, and right-rail each have their own scroll */}
      <div className={`app-body ${isFeedMode ? 'reel-body-layout' : ''}`}>
        {/* Left column - independently scrollable (hidden on reel feed mode) */}
        {!isFeedMode && (
          <aside className="left-nav" aria-label="Main Navigation">
            <div className="left-nav-top">
              <nav className="left-nav-menu">
                {nav.map(([label, href, I]) => (
                  <Link
                    key={href}
                    className={`nav-item ${path === href ? 'active' : ''}`}
                    to={href}
                    onClick={() => handleNavClick(href)}
                  >
                    <I size={20} strokeWidth={1.8} className="nav-icon" />
                    <span className="nav-label">{label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom section: Communities, Network, Settings anchored to the bottom */}
            <div className="left-nav-bottom">
              <div className="nav-divider" />
              <div className="left-nav-secondary">
                <Link
                  className={`nav-item secondary ${path === '/search' ? 'active' : ''}`}
                  to="/search"
                  onClick={() => handleNavClick('/search')}
                >
                  <Globe size={20} strokeWidth={1.8} className="nav-icon" />
                  <span>Communities</span>
                </Link>
                <Link
                  className="nav-item secondary"
                  to="/search?tab=network"
                  onClick={() => handleNavClick('/search?tab=network')}
                >
                  <Network size={20} strokeWidth={1.8} className="nav-icon" />
                  <span>Network</span>
                </Link>
                <Link
                  className="nav-item secondary nav-setting"
                  to="/settings"
                  onClick={() => handleNavClick('/settings')}
                >
                  <Settings size={20} strokeWidth={1.8} className="nav-icon" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Central feed column - independently scrollable */}
        <main className={`main-content ${isFeedMode ? 'reel-main-content' : ''}`} tabIndex={-1}>
          {children}
        </main>

        {/* Right column - independently scrollable (hidden on reel feed mode) */}
        {!isFeedMode && right && <RightRail />}
      </div>

      {/* Floating pill navigation visible on mobile or when on feed */}
      <div className="mobile-only-pill">
        <FloatingPillNav />
      </div>
    </div>
  );
}

function RightRail() {
  const [expanded, setExpanded] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({
    'comm-1': true,
  });
  const [followedFriends, setFollowedFriends] = useState<Record<string, boolean>>({});
  const { triggerPulse } = useTopLoader();

  const toggleCommunity = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoinedCommunities((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (id: string) => {
    setFollowedFriends((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="right-rail" aria-label="Sidebar information">
      {/* Profile Box */}
      <section className="profile-box">
        <div className="profile-summary">
          <img
            className="profile-photo"
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
            alt="Your profile"
          />
          <div className="profile-info">
            <b className="profile-role">Editor</b>
            <div className="stats">
              <span>
                <strong>#17</strong>
                <small>Rank</small>
              </span>
              <span>
                <strong>0</strong>
                <small>AP</small>
              </span>
              <span>
                <strong>5.0</strong>
                <small>Rating</small>
              </span>
            </div>
          </div>
        </div>

        {/* Communities Section - Profiles Shown & Clickable */}
        <div className="panel-heading">
          <b>Your Communities</b>
          <Link to="/search?tab=communities" onClick={() => triggerPulse()} className="explore-link">
            <Compass size={14} strokeWidth={1.8} />
            <span>Explore</span>
            <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>

        <div className="communities-list" role="list">
          {communityProfiles.map((comm) => {
            const isJoined = joinedCommunities[comm.id];
            return (
              <Link
                key={comm.id}
                to={`/search?q=${encodeURIComponent(comm.query)}`}
                onClick={() => triggerPulse()}
                className="community-profile-card"
                role="listitem"
              >
                <div className="community-avatar-wrap">
                  <span className="community-icon-badge">{comm.icon}</span>
                </div>
                <div className="community-meta">
                  <span className="community-title">{comm.name}</span>
                  <small className="community-subtitle">{comm.tag}</small>
                </div>
                <button
                  type="button"
                  aria-label={isJoined ? `Joined ${comm.name}` : `Join ${comm.name}`}
                  className={`community-join-pill ${isJoined ? 'joined' : ''}`}
                  onClick={(e) => toggleCommunity(comm.id, e)}
                >
                  {isJoined ? 'Joined' : '+ Join'}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="rail-handle" />
      </section>

      {/* Find Friends / Active Friends Card */}
      <section className="friend-box">
        <div className="panel-heading">
          <b>Active Friends</b>
          <span className="online-badge-count">2 online</span>
        </div>

        <div className="friends-list">
          {(expanded ? mockFriends : mockFriends.slice(0, 2)).map((friend) => (
            <div className="friend-row" key={friend.id}>
              <div className="online-avatar">
                <img src={friend.avatar} alt={friend.name} />
                {friend.online && <i className="online-indicator" />}
              </div>
              <div className="friend-info">
                <b>{friend.name}</b>
                <small>{friend.role}</small>
              </div>
              <button
                type="button"
                className={`friend-action-btn ${followedFriends[friend.id] ? 'following' : ''}`}
                onClick={() => toggleFollow(friend.id)}
                aria-label="Connect"
              >
                {followedFriends[friend.id] ? <UserCheck size={14} /> : <UserPlus size={14} />}
              </button>
            </div>
          ))}
        </div>

        <button
          className="expand-friends-btn"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Show fewer friends' : 'Show more friends'}
        >
          <span>{expanded ? 'Show less' : 'View more friends'}</span>
          <span className={`expand-arrow ${expanded ? 'rotated' : ''}`}>⌄</span>
        </button>
      </section>
    </aside>
  );
}
