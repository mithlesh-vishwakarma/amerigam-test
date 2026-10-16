import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Trash2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT_UPDATED_EVENT } from '@/lib/content-store';
import { AUTH_CHANGED_EVENT, getCurrentUser } from '@/lib/user-profiles';
import { fetchStories, deleteStoryApi, resolveMediaUrl } from '@/lib/api';
import type { StoryItem } from '@/lib/types';

export function HomeStories() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<StoryItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Group all stories by author so each user has strictly ONE unique circle in the tray
  const storiesByAuthor = useMemo(() => {
    const map = new Map<string, StoryItem[]>();
    for (const story of stories) {
      const key = story.author?.id || story.author?.username || story.id;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(story);
    }
    return map;
  }, [stories]);

  // Current logged in user's stories
  const userStories = useMemo(() => {
    const byId = currentUser?.id ? storiesByAuthor.get(currentUser.id) : undefined;
    const byUsername = currentUser?.username ? storiesByAuthor.get(currentUser.username) : undefined;
    return byId || byUsername || [];
  }, [currentUser, storiesByAuthor]);

  const hasUserStory = userStories.length > 0;
  const userStory = userStories[0];

  // Unique other creator stories (1 circle per creator)
  const uniqueCreatorStories = useMemo(() => {
    const list: { key: string; author: StoryItem['author']; stories: StoryItem[]; latestStory: StoryItem }[] = [];
    storiesByAuthor.forEach((authorStories, key) => {
      if (key === currentUser?.id || key === currentUser?.username) return;
      if (authorStories.length > 0) {
        list.push({
          key,
          author: authorStories[0].author,
          stories: authorStories,
          latestStory: authorStories[0],
        });
      }
    });
    return list;
  }, [storiesByAuthor, currentUser]);

  const currentViewStory = activeStoryIndex !== null ? activePlaylist[activeStoryIndex] : null;

  // Determine if active story is a video
  const isVideo = useMemo(() => {
    if (!currentViewStory) return false;
    const type = currentViewStory.media_type;
    const url = currentViewStory.media_url || '';
    return (
      type === 'video' ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.includes('.mp4') ||
      url.includes('video')
    );
  }, [currentViewStory]);

  const resolvedMedia = useMemo(() => {
    if (!currentViewStory) return '';
    return resolveMediaUrl(currentViewStory.media_url);
  }, [currentViewStory]);

  // Handle video autoplay and playback changes
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video autoPlay prevented, retrying muted:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [activeStoryIndex, activePlaylist, isVideo]);

  // Handle pause / resume
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, isVideo]);

  // Next / Prev navigation
  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < activePlaylist.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      // Advance to next creator's stories if available
      const currentAuthorKey = activePlaylist[0]?.author?.id || activePlaylist[0]?.author?.username;
      const creatorIdx = uniqueCreatorStories.findIndex((c) => c.key === currentAuthorKey);
      if (creatorIdx >= 0 && creatorIdx < uniqueCreatorStories.length - 1) {
        const nextCreator = uniqueCreatorStories[creatorIdx + 1];
        setActivePlaylist(nextCreator.stories);
        setActiveStoryIndex(0);
        setProgress(0);
      } else {
        setActiveStoryIndex(null);
        setActivePlaylist([]);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    } else {
      // Go back to previous creator's last story
      const currentAuthorKey = activePlaylist[0]?.author?.id || activePlaylist[0]?.author?.username;
      const creatorIdx = uniqueCreatorStories.findIndex((c) => c.key === currentAuthorKey);
      if (creatorIdx > 0) {
        const prevCreator = uniqueCreatorStories[creatorIdx - 1];
        setActivePlaylist(prevCreator.stories);
        setActiveStoryIndex(prevCreator.stories.length - 1);
        setProgress(0);
      }
    }
  };

  // Story playback timer for images (5 seconds per image)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused || isVideo) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 2; // 5 seconds per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, isVideo, activePlaylist.length]);

  const handleOpenUserStory = () => {
    if (hasUserStory) {
      setActivePlaylist(userStories);
      setActiveStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
    } else {
      navigate('/create?type=story');
    }
  };

  const handleOpenCreatorStory = (creatorStories: StoryItem[]) => {
    setActivePlaylist(creatorStories);
    setActiveStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  return (
    <>
      <section className="stories" aria-label="Stories and creator highlights">
        {/* Your Story Card: 1 circle per user */}
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`story-card add-story ${hasUserStory ? 'has-active-story' : ''}`}
          onClick={handleOpenUserStory}
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
          <small>{hasUserStory ? (userStories.length > 1 ? `${userStories.length} updates` : userStory?.time || 'Active') : '24h update'}</small>
        </motion.div>

        {/* Distinct Creator Stories: strictly ONE circle per unique user */}
        {uniqueCreatorStories.map((creator) => (
          <motion.div
            key={creator.key}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="story-card creator-story"
            onClick={() => handleOpenCreatorStory(creator.stories)}
            style={{ cursor: 'pointer' }}
          >
            <span className="story-avatar has-ring">
              <img src={creator.author.avatar} alt={creator.author.name} />
            </span>
            <b>{creator.author.name}</b>
            <small>{creator.stories.length > 1 ? `${creator.stories.length} stories` : creator.latestStory.time}</small>
          </motion.div>
        ))}
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
              {/* Progress bars for the creator's stories playlist */}
              <div className="story-progress-row">
                {activePlaylist.map((st, i) => (
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
                  {/* Sound Toggle for Video */}
                  {isVideo && (
                    <button
                      type="button"
                      className="story-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        if (videoRef.current) {
                          videoRef.current.muted = nextMuted;
                        }
                      }}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  )}

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
                            setActivePlaylist([]);
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
                    onClick={() => {
                      setActiveStoryIndex(null);
                      setActivePlaylist([]);
                    }}
                    aria-label="Close story"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div className="story-media-container">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={resolvedMedia}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    className="story-media"
                    onTimeUpdate={() => {
                      if (videoRef.current && videoRef.current.duration) {
                        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                        setProgress(pct);
                      }
                    }}
                    onEnded={handleNextStory}
                  />
                ) : (
                  <img
                    src={resolvedMedia}
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
