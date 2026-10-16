import React, { useState, useEffect } from 'react';
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
  ChevronUp,
  UserCheck,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveLogo } from './interactive-logo';
import { useTopLoader } from './top-loader';
import {
  getCurrentUser,
  getJoinedCommunitiesForUser,
  AUTH_CHANGED_EVENT,
  UserProfile,
} from '@/lib/user-profiles';
import { fetchProfiles, toggleFollowApi, fetchCommunities, API_BASE } from '@/lib/api';

const communityCircles = [
  {
    id: 'comm-1',
    name: 'Designers & 3D Crafters',
    avatar: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'comm-2',
    name: 'Indie Cinema & Filmmakers',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'comm-3',
    name: 'Creative Tech & Code',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'comm-4',
    name: 'AI Art & Media',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
  },
];

const nav = [
  ['Home', '/home', Home],
  ['Feed', '/feed', Rss],
  ['Explore', '/explore', Compass],
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

export function AppShell({
  children,
  right = true,
  isReelFeed = false,
}: {
  children: React.ReactNode;
  right?: boolean;
  isReelFeed?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(getCurrentUser());
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { triggerPulse } = useTopLoader();
  const isFeedMode = isReelFeed || path === '/feed';

  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
  }, []);

  const queryParam = new URLSearchParams(location.search).get('q') || '';
  const [headerSearch, setHeaderSearch] = useState(queryParam);

  useEffect(() => {
    setHeaderSearch(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = headerSearch.trim();
    triggerPulse();
    if (q) {
      navigate('/search?q=' + encodeURIComponent(q));
    } else {
      navigate('/search');
    }
  };

  const handleNavClick = (href: string) => {
    if (path !== href) {
      triggerPulse();
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Amerigam', url: window.location.href }).catch(() => { });
    } else {
      triggerPulse();
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={`app-shell ${isFeedMode ? 'is-reel-page' : ''}`}>
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="mobile-drawer-root">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="mobile-drawer-panel"
            >
              <div className="mobile-drawer-header">
                <InteractiveLogo size="sm" />
                <button
                  type="button"
                  className="mobile-drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mobile-drawer-nav">
                {nav.map(([label, href, I]) => (
                  <Link
                    key={href}
                    className={`mobile-drawer-item ${path === href ? 'active' : ''}`}
                    to={href}
                    onClick={() => {
                      handleNavClick(href);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <I size={20} strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                ))}

                <div className="nav-divider" />

                <Link
                  className={`mobile-drawer-item ${path === '/communities' ? 'active' : ''}`}
                  to="/communities"
                  onClick={() => {
                    handleNavClick('/communities');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Globe size={20} strokeWidth={1.8} />
                  <span>Communities</span>
                </Link>

                <Link
                  className={`mobile-drawer-item ${path === '/network' ? 'active' : ''}`}
                  to="/network"
                  onClick={() => {
                    handleNavClick('/network');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Network size={20} strokeWidth={1.8} />
                  <span>Network</span>
                </Link>
              </nav>

              {/* Mobile Drawer Footer: Notification & Settings shifted here right where the profile is settled */}
              <div className="mobile-drawer-footer">
                <div className="drawer-shifted-actions">
                  <Link
                    to="/notifications"
                    className={`drawer-shifted-action-btn ${path === '/notifications' ? 'active' : ''}`}
                    onClick={() => {
                      handleNavClick('/notifications');
                      setMobileMenuOpen(false);
                    }}
                    title="Notifications"
                  >
                    <div className="shifted-icon-wrap">
                      <Bell size={18} strokeWidth={1.8} />
                      <span className="shifted-badge-dot" />
                    </div>
                    <span>Notification</span>
                  </Link>
                  <Link
                    to="/settings"
                    className={`drawer-shifted-action-btn ${path === '/settings' ? 'active' : ''}`}
                    onClick={() => {
                      handleNavClick('/settings');
                      setMobileMenuOpen(false);
                    }}
                    title="Settings"
                  >
                    <div className="shifted-icon-wrap">
                      <Settings size={18} strokeWidth={1.8} />
                    </div>
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="drawer-user-row">
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
                    alt={user?.display_name || 'User'}
                    className="drawer-avatar"
                    style={{ border: `2px solid ${user?.themeColor || '#00a8ed'}` }}
                  />
                  <div className="drawer-user-info">
                    <b>{user?.display_name || 'Alex Rivera'}</b>
                    <small>{user?.role || 'Developer'} · Rank {user?.rank || '#1'}</small>
                  </div>
                  <Link
                    to="/login"
                    className="drawer-switch-link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      triggerPulse();
                    }}
                  >
                    Switch
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed topbar with proper padding, increased search length, and matched icons */}
      <header className="topbar">
        <div className="brand brand-container">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>
          <InteractiveLogo size="md" />
        </div>

        <form className="search-wrap" onSubmit={handleSearchSubmit}>
          <input
            aria-label="Search posts"
            placeholder="Search creators, stories, and tags..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
          />
          {headerSearch ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setHeaderSearch('');
                if (location.pathname === '/search' || location.pathname === '/explore') {
                  navigate(location.pathname);
                }
              }}
              aria-label="Clear search"
              style={{ background: 'transparent', border: 0, color: '#888', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} />
            </button>
          ) : null}
          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Submit search"
            style={{ background: 'transparent', border: 0, color: '#888', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
          >
            <Search size={18} className="search-icon" />
          </button>
        </form>

        {/* Action icons strictly matching user reference screenshot: Share, Globe, Bell, Settings */}
        <div className="top-actions">
          <button
            type="button"
            className="action-icon-btn desktop-only-action"
            aria-label="Share"
            title="Share"
            onClick={handleShare}
          >
            <Share2 size={19} strokeWidth={1.7} />
          </button>
          <Link
            to="/search"
            className="action-icon-btn desktop-only-action"
            aria-label="Explore Global"
            title="Explore Global"
            onClick={() => handleNavClick('/search')}
          >
            <Globe size={19} strokeWidth={1.7} />
          </Link>
          <Link
            to="/notifications"
            className={`action-icon-btn desktop-only-action ${path === '/notifications' ? 'active' : ''}`}
            aria-label="Notifications"
            title="Notifications"
            onClick={() => handleNavClick('/notifications')}
          >
            <Bell size={19} strokeWidth={1.7} />
          </Link>
          <Link
            to="/settings"
            className={`action-icon-btn desktop-only-action ${path === '/settings' ? 'active' : ''}`}
            aria-label="Settings"
            title="Settings"
            onClick={() => handleNavClick('/settings')}
          >
            <Settings size={19} strokeWidth={1.7} />
          </Link>

          {/* User profile avatar link to login / switch account */}
          <Link
            to="/login"
            className="action-icon-btn user-avatar-top-btn"
            aria-label="Switch Profile"
            title={`Active: ${user?.display_name || 'User'} (${user?.role || 'Role'}) - Click to Switch Account`}
            onClick={() => handleNavClick('/login')}
            style={{ padding: 2 }}
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
              alt={user?.display_name || 'User'}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `2px solid ${user?.themeColor || '#00a8ed'}`,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Link>
        </div>
      </header>

      {/* 3-column body where left-nav, main-content, and right-rail each have their own scroll */}
      <div className={`app-body ${isFeedMode ? 'reel-body-layout' : ''}`}>
        {/* Left column - independently scrollable (hidden on mobile via CSS) */}
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

            {/* Shifted with the divider line near the above menus */}
            <div className="nav-divider" />
            <div className="left-nav-secondary">
              <Link
                className={`nav-item secondary ${path === '/communities' ? 'active' : ''}`}
                to="/communities"
                onClick={() => handleNavClick('/communities')}
              >
                <Globe size={20} strokeWidth={1.8} className="nav-icon" />
                <span>Communities</span>
              </Link>
              <Link
                className={`nav-item secondary ${path === '/network' ? 'active' : ''}`}
                to="/network"
                onClick={() => handleNavClick('/network')}
              >
                <Network size={20} strokeWidth={1.8} className="nav-icon" />
                <span>Network</span>
              </Link>
            </div>
          </div>

          {/* Bottom section: Settings kept strictly to the end only */}
          <div className="left-nav-bottom">
            <div className="nav-divider" />
            <div className="left-nav-secondary">
              <Link
                className={`nav-item secondary nav-setting ${path === '/settings' ? 'active' : ''}`}
                to="/settings"
                onClick={() => handleNavClick('/settings')}
              >
                <Settings size={20} strokeWidth={1.8} className="nav-icon" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Central feed column - independently scrollable */}
        <main className={`main-content ${isFeedMode ? 'reel-main-content' : ''}`} tabIndex={-1}>
          {children}
        </main>

        {/* Right column - independently scrollable (hidden on reel feed mode) */}
        {!isFeedMode && right && <RightRail />}
      </div>
    </div>
  );
}

function RightRail() {
  const [expanded, setExpanded] = useState(false);
  const [followedFriends, setFollowedFriends] = useState<Record<string, boolean>>({});
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [dbCommunities, setDbCommunities] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile>(getCurrentUser());
  const { triggerPulse } = useTopLoader();

  const loadData = async (activeUserId: string) => {
    try {
      const [profs, comms, followingRes] = await Promise.all([
        fetchProfiles(),
        fetchCommunities(),
        fetch(`${API_BASE}/profiles/${activeUserId}/following`).then((r) => (r.ok ? r.json() : { following: [] })),
      ]);

      if (profs && profs.length > 0) {
        setFriendsList(
          profs
            .filter((p) => p.id !== activeUserId)
            .map((p) => ({
              id: p.id,
              name: p.display_name,
              role: p.role,
              avatar: p.avatar_url,
              online: true,
            }))
        );
      }

      if (comms && comms.length > 0) {
        setDbCommunities(comms);
      }

      if (followingRes && Array.isArray(followingRes.following)) {
        const map: Record<string, boolean> = {};
        followingRes.following.forEach((id: string) => {
          map[id] = true;
        });
        setFollowedFriends(map);
      }
    } catch (err) {
      console.warn('RightRail loadData error:', err);
    }
  };

  useEffect(() => {
    loadData(user.id);
  }, [user.id]);

  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuth = () => {
      const nextUser = getCurrentUser();
      setUser(nextUser);
      loadData(nextUser.id);
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
  }, []);

  const toggleFollow = async (id: string) => {
    const nextState = !followedFriends[id];
    setFollowedFriends((prev) => ({ ...prev, [id]: nextState }));
    try {
      await toggleFollowApi(user.id, id);
    } catch {}
  };

  const userCommunities = dbCommunities.length > 0 ? dbCommunities : getJoinedCommunitiesForUser(user);

  return (
    <aside className="right-rail" aria-label="Sidebar information">
      {/* Profile Box */}
      <section className="profile-box">
        <div className="profile-summary">
          <img
            className="profile-photo"
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
            alt={user?.display_name || 'User'}
            style={{ border: `2px solid ${user?.themeColor || '#00a8ed'}` }}
          />
          <div className="profile-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <b className="profile-role" style={{ color: user?.themeColor || '#00a8ed' }}>{user?.role || 'Developer'}</b>
              <Link to="/login" className="profile-switch-badge" title="Switch Profile">
                Switch
              </Link>
            </div>
            <div className="stats">
              <span>
                <strong>{user?.rank || '#1'}</strong>
                <small>Rank</small>
              </span>
              <span>
                <strong>{user?.points ? user.points.replace(' AP', '') : '4,820'}</strong>
                <small>AP</small>
              </span>
              <span>
                <strong>{user?.rating || '4.9'}</strong>
                <small>Rating</small>
              </span>
            </div>
          </div>
        </div>

        {/* Communities Section - Displayed in Circles */}
        <div className="profile-communities-circles">
          <div className="panel-heading" style={{ marginBottom: '10px' }}>
            <b>Your Communities</b>
            <Link to="/search?tab=communities" onClick={() => triggerPulse()} className="explore-link">
              <Compass size={14} strokeWidth={1.8} />
              <span>Explore</span>
              <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>

          <div className="communities-circle-row" role="list">
            {userCommunities.map((comm) => (
              <Link
                key={comm.id}
                to={`/search?tab=communities&comm=${comm.id}`}
                onClick={() => triggerPulse()}
                className="community-circle-link"
                title={`${comm.name} (${comm.members})`}
              >
                <img src={comm.avatar} alt={comm.name} />
              </Link>
            ))}

            {/* Right arrow key/button to see more communities */}
            <Link
              to="/search?tab=communities"
              onClick={() => triggerPulse()}
              className="community-circle-btn chevron-circle"
              aria-label="See more communities"
              title="See all communities"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        <div className="rail-handle" />
      </section>

      {/* Find Friends / Active Friends Card */}
      <section className="friend-box">
        <div className="panel-heading">
          <b>Active Friends</b>
          <span className="online-badge-count">{friendsList.length} creators</span>
        </div>

        <div className="friends-list">
          {(expanded ? friendsList : friendsList.slice(0, 2)).map((friend) => (
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
