import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, Play, ChevronDown } from 'lucide-react';
import { useTopLoader } from './top-loader';

export function FloatingPillNav() {
  const location = useLocation();
  const path = location.pathname;
  const { triggerPulse } = useTopLoader();

  const isFeed = path === '/feed';
  const isHome = path === '/home';
  const isSearch = path === '/search';
  const isCreate = path === '/create';
  const isMessages = path === '/messages';

  const handleClick = (target: string) => {
    if (path !== target) {
      triggerPulse();
    }
  };

  return (
    <nav className="floating-pill-wrapper" aria-label="Quick Navigation Pill">
      {/* Main Pill Bar */}
      <div className="floating-pill-bar">
        {/* Home */}
        <Link
          to="/home"
          onClick={() => handleClick('/home')}
          className={`floating-pill-item ${isHome ? 'active' : ''}`}
          aria-label="Home"
        >
          <Home size={22} strokeWidth={1.8} />
        </Link>

        {/* Feed (Reel) - Squircle Active Box matching user screenshot */}
        <Link
          to="/feed"
          onClick={() => handleClick('/feed')}
          className={`floating-pill-item reel-item ${isFeed ? 'active' : ''}`}
          aria-label="Reels Feed"
        >
          <div className="squircle-icon-box">
            <div className="squircle-outer-border">
              <Play size={12} fill="#fff" color="#fff" />
            </div>
          </div>
        </Link>

        {/* Search */}
        <Link
          to="/search"
          onClick={() => handleClick('/search')}
          className={`floating-pill-item ${isSearch ? 'active' : ''}`}
          aria-label="Explore Search"
        >
          <Search size={22} strokeWidth={1.8} />
        </Link>

        {/* Plus / Create */}
        <Link
          to="/create"
          onClick={() => handleClick('/create')}
          className={`floating-pill-item ${isCreate ? 'active' : ''}`}
          aria-label="Create Post"
        >
          <Plus size={24} strokeWidth={2} />
        </Link>

        {/* Messages */}
        <Link
          to="/messages"
          onClick={() => handleClick('/messages')}
          className={`floating-pill-item ${isMessages ? 'active' : ''}`}
          aria-label="Messages"
        >
          <MessageCircle size={22} strokeWidth={1.8} />
        </Link>
      </div>

      {/* Profile Avatar Button on the Right with Chevron Down */}
      <Link
        to="/auth"
        onClick={() => handleClick('/auth')}
        className="floating-pill-profile"
        aria-label="Profile and Account"
      >
        <div className="floating-avatar-circle">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Profile"
          />
        </div>
        <ChevronDown size={14} className="floating-profile-chevron" />
      </Link>
    </nav>
  );
}
