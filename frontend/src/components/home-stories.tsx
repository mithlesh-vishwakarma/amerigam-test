import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Plus, Check, X, ChevronLeft, ChevronRight, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT_UPDATED_EVENT } from '@/lib/content-store';
import { AUTH_CHANGED_EVENT, getCurrentUser } from '@/lib/user-profiles';
import { fetchStories, deleteStoryApi, toggleFollowApi } from '@/lib/api';
import type { StoryItem } from '@/lib/types';

export function HomeStories() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [following, setFollowing] = useState(false);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const loadStories = async () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    try {
      const backendStories = await fetchStories(user.id);
      setStories(backendStories || []);
    } catch (err) {
      console.warn('Stories fetch failed:', err);
      setStories([]);
    }
  };

  useEffect(() => {
    loadStories();
    const handleUpdate = () => loadStories();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    window.addEventListener(AUTH_CHANGED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleUpdate);
    };
  }, []);

  // Story playback timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // 5 seconds per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories.length]);

  const userStory = stories.find((s) => s.author?.username === currentUser.username);
  const hasUserStory = !!userStory;

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const currentViewStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <>
      <section className="stories" aria-label="Stories and friend discovery">
        {/* Your Story Card: If user has an active story, show glowing ring and view on click; '+' icon opens create */}
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`story-card add-story ${hasUserStory ? 'has-active-story' : ''}`}
          onClick={() => {
            if (hasUserStory) {
              const idx = stories.findIndex((s) => s.author.username === currentUser.username);
              handleOpenStory(idx >= 0 ? idx : 0);
            } else {
              navigate('/create?type=story');
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className={`story-avatar ${hasUserStory ? 'has-ring ring-user-active' : ''}`}>
            <img
              src={currentUser.avatar_url}
              alt="Your story"
            />
            <i
              aria-hidden="true"
              title="Create new story"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/create?type=story');
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
            </i>
          </span>
          <b>{hasUserStory ? 'Your Story' : 'Add Story'}</b>
          <small>{hasUserStory ? userStory?.time || 'Active now' : '24h update'}</small>
        </motion.div>

        {/* Find Friends Card */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`story-card find-friends ${following ? 'is-following' : ''}`}
          onClick={() => setFollowing(!following)}
        >
          <span className="friend-icon">
            {following ? <Check size={18} strokeWidth={2.5} /> : <UserPlus size={18} strokeWidth={2} />}
          </span>
          <b>{following ? 'Following' : 'Find Friends'}</b>
          <small>{following ? 'Suggestions ready' : 'Discover creators'}</small>
        </motion.button>

        {/* Following Creator Stories */}
        {stories
          .filter((story) => story.author.username !== currentUser.username)
          .map((story) => {
            const actualIndex = stories.findIndex((s) => s.id === story.id);
            return (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="story-card creator-story"
                onClick={() => handleOpenStory(actualIndex)}
                style={{ cursor: 'pointer' }}
              >
                <span className="story-avatar has-ring">
                  <img src={story.author.avatar} alt={story.author.name} />
                </span>
                <b>{story.author.name}</b>
                <small>{story.time}</small>
              </motion.div>
            );
          })}
      </section>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {currentViewStory && (
          <div className="story-modal-backdrop" onClick={() => setActiveStoryIndex(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="story-viewer-card"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Progress bars */}
              <div className="story-progress-row">
                {stories.map((st, i) => (
                  <div key={st.id} className="story-progress-track">
                    <div
                      className="story-progress-fill"
                      style={{
                        width:
                          i === activeStoryIndex
                            ? `${progress}%`
                            : i < activeStoryIndex
                            ? '100%'
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="story-header-row">
                <div className="story-header-author">
                  <img src={currentViewStory.author.avatar} alt={currentViewStory.author.name} />
                  <div>
                    <strong>{currentViewStory.author.name}</strong>
                    <span>@{currentViewStory.author.username} · {currentViewStory.time}</span>
                  </div>
                </div>

                <div className="story-header-actions">
                  {currentViewStory.author.username === currentUser.username && (
                    <>
                      <span className="story-badge-user">
                        <Sparkles size={12} /> Your Story
                      </span>
                      <button
                        type="button"
                        className="story-close-btn"
                        style={{ color: '#ef4444' }}
                        title="Delete this story"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this story?')) {
                            await deleteStoryApi(currentViewStory.id);
                            setActiveStoryIndex(null);
                            loadStories();
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="story-close-btn"
                    onClick={() => setActiveStoryIndex(null)}
                    aria-label="Close story"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div className="story-media-container">
                {currentViewStory.media_type === 'video' ? (
                  <video
                    src={currentViewStory.media_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="story-media"
                  />
                ) : (
                  <img
                    src={currentViewStory.media_url}
                    alt={currentViewStory.caption || 'Story content'}
                    className="story-media"
                  />
                )}

                {/* Text overlay / caption */}
                {currentViewStory.text_overlay && (
                  <div className="story-text-overlay-pill">
                    {currentViewStory.text_overlay}
                  </div>
                )}

                {/* Bottom caption */}
                {currentViewStory.caption && (
                  <div className="story-bottom-scrim">
                    <p className="story-caption-text">{currentViewStory.caption}</p>
                  </div>
                )}

                {/* Left/Right click triggers */}
                <button
                  type="button"
                  className="story-nav-tap-area left"
                  onClick={handlePrevStory}
                  aria-label="Previous story"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  className="story-nav-tap-area right"
                  onClick={handleNextStory}
                  aria-label="Next story"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
