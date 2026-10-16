import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopLoader } from './top-loader';

export function FloatingPillNav() {
  const [isVisible, setIsVisible] = useState(true);
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

  // Keyboard shortcut: pressing Down Arrow key hides floating menu, Up Arrow un-hides (when not typing in form)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowDown' && isVisible && !isFeed) {
        setIsVisible(false);
      } else if (e.key === 'ArrowUp' && !isVisible) {
        setIsVisible(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isFeed]);

  return (
    <div className="floating-pill-root">
      <AnimatePresence>
        {isVisible ? (
          <motion.nav
            key="floating-menu"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="floating-pill-wrapper"
            aria-label="Quick Navigation Pill"
          >
            {/* Main Pill Bar with expanded gap */}
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

            {/* Profile Avatar Button on the Right */}
            <Link
              to="/settings"
              onClick={() => handleClick('/settings')}
              className="floating-pill-profile"
              aria-label="Profile and Settings"
            >
              <div className="floating-avatar-circle">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Profile"
                />
              </div>
            </Link>

            {/* Down arrow button to hide floating menu */}
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="floating-pill-hide-btn"
              aria-label="Hide floating menu"
              title="Hide floating menu (or press Down arrow)"
            >
              <ChevronDown size={18} strokeWidth={2.2} />
            </button>
          </motion.nav>
        ) : (
          /* Sleek restore button when menu is hidden */
          <motion.button
            key="show-menu-trigger"
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVisible(true)}
            className="floating-pill-show-btn"
            aria-label="Show navigation menu"
            title="Show navigation menu"
          >
            <ChevronUp size={16} strokeWidth={2.5} />
            <span>Show Menu</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
