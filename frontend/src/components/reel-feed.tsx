import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Play,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReelItem } from '@/lib/types';
import { CONTENT_UPDATED_EVENT } from '@/lib/content-store';
import { getCurrentUser, AUTH_CHANGED_EVENT } from '@/lib/user-profiles';
import {
  fetchPosts,
  togglePostLikeApi,
  togglePostSaveApi,
  incrementPostViewsApi,
  incrementPostShareApi,
  toggleFollowApi,
  resolveMediaUrl,
} from '@/lib/api';
import { useTopLoader } from './top-loader';
import { CommentsModal } from './comments-modal';

export function ReelFeed() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);
  const { triggerPulse } = useTopLoader();

  const loadReels = useCallback(async (viewerId?: string) => {
    try {
      const activeViewerId = viewerId || getCurrentUser().id;
      const posts = await fetchPosts({ kind: 'reel', viewer_id: activeViewerId });
      if (posts && posts.length > 0) {
        const mapped: ReelItem[] = posts.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          video_url: resolveMediaUrl(
            p.media_urls?.find(
              (m: string) =>
                m.endsWith('.mp4') ||
                m.endsWith('.webm') ||
                m.includes('reel') ||
                m.includes('video')
            ) ||
            p.media_urls?.[0] ||
            '/media/reel-1.mp4'
          ),
          poster_url: resolveMediaUrl(
            p.poster_url ||
            p.media_urls?.[0] ||
            'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
          ),
          creator: {
            id: p.profiles?.id || p.author_id,
            name: p.profiles?.display_name || 'Creator',
            username: p.profiles?.username || 'creator',
            avatar:
              p.profiles?.avatar_url ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            initial: (p.profiles?.display_name || 'C')[0],
            role: p.profiles?.role || 'Creator',
          },
          likes: p.like_count ?? 0,
          comments: p.comment_count ?? 0,
          shares: p.shares ?? 0,
          views: p.views ?? 0,
          duration: p.duration || '0:30',
          post_type: p.post_type,
          field_tag: p.field_tag,
          hobby_tag: p.hobby_tag,
          is_ad: p.is_ad,
          sponsor_name: p.sponsor_name,
          ad_cta_label: p.ad_cta_label,
          ad_cta_url: p.ad_cta_url,
        }));

        setReels(mapped);
        setCurrentIndex(0);

        const initLikes: Record<string, { count: number; liked: boolean }> = {};
        const initSaves: Record<string, boolean> = {};
        posts.forEach((p) => {
          initLikes[p.id] = { count: p.like_count || 0, liked: !!p.liked };
          if (p.saved) initSaves[p.id] = true;
        });
        setLikes(initLikes);
        setBookmarks(initSaves);
      } else {
        setReels([]);
      }
    } catch (err) {
      console.warn('Reels fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // Listen to profile switch or new content published
  useEffect(() => {
    const handleAuth = () => {
      const nextUser = getCurrentUser();
      setCurrentUser(nextUser);
      loadReels(nextUser.id);
    };
    const handleUpdate = () => {
      loadReels(getCurrentUser().id);
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, [loadReels]);

  const currentReel: ReelItem | undefined = reels[currentIndex] || reels[0];
  const currentLikeState = currentReel ? likes[currentReel.id] || { count: currentReel.likes, liked: false } : { count: 0, liked: false };
  const isBookmarked = currentReel ? !!bookmarks[currentReel.id] : false;
  const isFollowing = currentReel ? !!followed[currentReel.creator.username] : false;

  const handleNextReel = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setDirection(1);
      triggerPulse();
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, reels.length, triggerPulse]);

  const handlePrevReel = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      triggerPulse();
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex, triggerPulse]);

  // Touch Swipe Handlers (Swipe Up -> Next, Swipe Down -> Prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 45) {
      handleNextReel();
    } else if (diff < -45) {
      handlePrevReel();
    }
  };

  // Wheel Scroll Handler (Debounced to 500ms)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current > 500) {
      if (e.deltaY > 30) {
        lastScrollTime.current = now;
        handleNextReel();
      } else if (e.deltaY < -30) {
        lastScrollTime.current = now;
        handlePrevReel();
      }
    }
  };

  // Keyboard navigation (ArrowDown / ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextReel, handlePrevReel]);

  // Guarantee Video Plays smoothly on reel change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [currentIndex]);

  // Increment view on reel view
  useEffect(() => {
    if (currentReel?.id) {
      incrementPostViewsApi(currentReel.id).catch(() => {});
    }
  }, [currentIndex, currentReel?.id]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleLike = async () => {
    const user = getCurrentUser();
    const current = likes[currentReel.id] || { count: currentReel.likes, liked: false };
    const newLiked = !current.liked;
    const newCount = newLiked ? current.count + 1 : Math.max(0, current.count - 1);

    setLikes((prev) => ({
      ...prev,
      [currentReel.id]: {
        liked: newLiked,
        count: newCount,
      },
    }));

    try {
      const res = await togglePostLikeApi(currentReel.id, user.id);
      if (res && typeof res.like_count === 'number') {
        setLikes((prev) => ({
          ...prev,
          [currentReel.id]: {
            liked: res.liked,
            count: res.like_count,
          },
        }));
      }
    } catch (err) {
      console.warn('Backend like error:', err);
    }
  };

  const toggleBookmark = async () => {
    const user = getCurrentUser();
    const newSaved = !isBookmarked;

    setBookmarks((prev) => ({
      ...prev,
      [currentReel.id]: newSaved,
    }));

    setNotice(newSaved ? 'Reel saved to bookmarks!' : 'Reel removed from bookmarks');
    setTimeout(() => setNotice(null), 2000);

    try {
      await togglePostSaveApi(currentReel.id, user.id);
    } catch (err) {
      console.warn('Backend save error:', err);
    }
  };

  const toggleFollow = async () => {
    const user = getCurrentUser();
    const newFollow = !isFollowing;

    setFollowed((prev) => ({
      ...prev,
      [currentReel.creator.username]: newFollow,
    }));

    setNotice(newFollow ? `Following @${currentReel.creator.username}` : `Unfollowed @${currentReel.creator.username}`);
    setTimeout(() => setNotice(null), 2000);

    try {
      await toggleFollowApi(user.id, currentReel.creator.id || currentReel.creator.username);
    } catch {}
  };

  const handleShare = async () => {
    if (!currentReel) return;
    // Increment share count immediately on every click
    setReels((prev) =>
      prev.map((r, i) => (i === currentIndex ? { ...r, shares: (r.shares || 0) + 1 } : r))
    );

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: currentReel.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setNotice('Reel link copied!');
      setTimeout(() => setNotice(null), 2500);
    }

    try {
      const res = await incrementPostShareApi(currentReel.id);
      if (res && typeof res.shares === 'number') {
        setReels((prev) =>
          prev.map((r, i) => (i === currentIndex ? { ...r, shares: res.shares } : r))
        );
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="reel-feed-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#000' }}>
        <div style={{ color: '#00a8ed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,168,237,0.2)', borderTopColor: '#00a8ed', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, letterSpacing: '0.04em', color: '#94a3b8' }}>Loading Reels from Database...</span>
        </div>
      </div>
    );
  }

  if (!currentReel) {
    return (
      <div className="reel-feed-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#000' }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>No reels in database yet.</p>
      </div>
    );
  }

  return (
    <div
      className="reel-feed-container"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="reel-toast-notice"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="reel-stage">
        {/* The 9:16 Reel Video Card Wrapper */}
        <div className="reel-card-wrapper">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentReel.id}
              custom={direction}
              initial={{ y: direction > 0 ? 80 : -80, opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? -80 : 80, opacity: 0.8 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              className="reel-card"
              onClick={togglePlayPause}
            >
              <video
                ref={videoRef}
                src={currentReel.video_url}
                poster={currentReel.poster_url}
                loop
                playsInline
                autoPlay
                muted={isMuted}
                className="reel-video-element"
                onLoadedData={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                  }
                }}
              />

              {/* Gradient Overlays */}
              <div className="reel-overlay-top" />
              <div className="reel-overlay-bottom" />

              {/* Mute/Unmute Audio Button */}
              <button
                type="button"
                className="reel-audio-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Center Play/Pause Indicator if paused */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="reel-play-indicator"
                  >
                    <Play size={36} fill="#fff" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Creator Info & Caption (Bottom Left Overlay) */}
              <div className="reel-creator-info" onClick={(e) => e.stopPropagation()}>
                {/* 70% Field, 20% Hobby, 10% Ad Badge */}
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  {(currentReel.post_type === 'ad' || currentReel.is_ad) ? (
                    <>
                      <span className="post-type-tag tag-ad" style={{ fontSize: '10px' }}>
                        📢 Sponsored · {currentReel.sponsor_name || 'Brand Partner'} (10% Feed)
                      </span>
                      {currentReel.ad_cta_label && (
                        <a
                          href={currentReel.ad_cta_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="post-ad-cta-button"
                          style={{ padding: '3px 10px', fontSize: '11px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {currentReel.ad_cta_label} ↗
                        </a>
                      )}
                    </>
                  ) : currentReel.post_type === 'hobby' ? (
                    <span className="post-type-tag tag-hobby" style={{ fontSize: '10px' }}>
                      🎨 Hobby: {currentReel.hobby_tag || 'Creative Passion'} (20% Feed)
                    </span>
                  ) : (
                    <span className="post-type-tag tag-field" style={{ fontSize: '10px' }}>
                      💼 {currentReel.field_tag === currentUser.role || currentReel.creator.role === currentUser.role
                        ? `Your Field: ${currentUser.role} (70% Feed)`
                        : `${currentReel.field_tag || currentReel.creator.role || 'Creator'} Field (Explore)`}
                    </span>
                  )}
                </div>

                <div className="reel-author-row">
                  <div className="reel-author-avatar">
                    {currentReel.creator.avatar ? (
                      <img src={currentReel.creator.avatar} alt={currentReel.creator.name} />
                    ) : (
                      <span>{currentReel.creator.initial}</span>
                    )}
                  </div>
                  <span className="reel-author-name">{currentReel.creator.name}</span>
                  <button
                    type="button"
                    className={`reel-follow-pill ${isFollowing ? 'following' : ''}`}
                    onClick={toggleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={12} strokeWidth={2.5} /> Following
                      </>
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>

                <p className="reel-caption-text">{currentReel.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Floating Interactive Action Bar */}
          <aside className="reel-actions-rail" aria-label="Reel Actions">
            {/* Like Button */}
            <button
              type="button"
              className={`reel-action-item ${currentLikeState.liked ? 'is-liked' : ''}`}
              onClick={toggleLike}
              aria-label="Like this reel"
            >
              <div className="reel-icon-bubble">
                <Heart
                  size={24}
                  fill={currentLikeState.liked ? '#ff3b44' : 'none'}
                  color={currentLikeState.liked ? '#ff3b44' : '#fff'}
                />
              </div>
              <span className="reel-action-count">{currentLikeState.count}</span>
            </button>

            {/* Comment Button */}
            <button
              type="button"
              className="reel-action-item"
              onClick={() => setShowComments(true)}
              aria-label="Comments"
            >
              <div className="reel-icon-bubble">
                <MessageCircle size={24} />
              </div>
              <span className="reel-action-count">{currentReel.comments}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              className="reel-action-item"
              onClick={handleShare}
              aria-label="Share reel"
            >
              <div className="reel-icon-bubble">
                <Share2 size={24} />
              </div>
              <span className="reel-action-count">{currentReel.shares}</span>
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              className={`reel-action-item ${isBookmarked ? 'is-saved' : ''}`}
              onClick={toggleBookmark}
              aria-label="Save reel"
            >
              <div className="reel-icon-bubble">
                <Bookmark
                  size={24}
                  fill={isBookmarked ? '#00a8ed' : 'none'}
                  color={isBookmarked ? '#00a8ed' : '#fff'}
                />
              </div>
            </button>

            {/* More Options Button */}
            <button
              type="button"
              className="reel-action-item"
              onClick={() => {
                setNotice('Options: Copy link, Report, Mute');
                setTimeout(() => setNotice(null), 2500);
              }}
              aria-label="More options"
            >
              <div className="reel-icon-bubble">
                <MoreHorizontal size={20} />
              </div>
            </button>
          </aside>
        </div>

        {/* Far-Right Circular Vertical Navigation Buttons (Up / Down) */}
        <aside className="reel-vertical-nav" aria-label="Reel Navigation">
          <button
            type="button"
            className="reel-nav-circle-btn"
            disabled={currentIndex === 0}
            onClick={handlePrevReel}
            aria-label="Previous reel"
          >
            <ChevronUp size={20} />
          </button>
          <button
            type="button"
            className="reel-nav-circle-btn"
            disabled={currentIndex === reels.length - 1}
            onClick={handleNextReel}
            aria-label="Next reel"
          >
            <ChevronDown size={20} />
          </button>
        </aside>
      </div>

      {/* Comments Drawer Modal */}
      <CommentsModal
        postId={currentReel.id}
        postTitle={currentReel.title}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={(newCount) => {
          setReels((prev) =>
            prev.map((r) => (r.id === currentReel.id ? { ...r, comments: newCount } : r))
          );
        }}
      />
    </div>
  );
}
