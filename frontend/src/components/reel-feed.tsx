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
import { demoReels, ReelItem } from '@/lib/demo-posts';
import { useTopLoader } from './top-loader';
import { FloatingPillNav } from './floating-pill-nav';

export function ReelFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({
    'reel-neil-arora': { count: 142, liked: false },
    'reel-leather-jacket': { count: 489, liked: false },
    'reel-skater-motion': { count: 1250, liked: false },
    'reel-neon-night': { count: 932, liked: false },
  });
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);
  const { triggerPulse } = useTopLoader();

  const currentReel: ReelItem = demoReels[currentIndex] || demoReels[0];
  const currentLikeState = likes[currentReel.id] || { count: currentReel.likes, liked: false };
  const isBookmarked = !!bookmarks[currentReel.id];
  const isFollowing = !!followed[currentReel.creator.username];

  const handleNextReel = useCallback(() => {
    if (currentIndex < demoReels.length - 1) {
      setDirection(1);
      triggerPulse();
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, triggerPulse]);

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

  const toggleLike = () => {
    setLikes((prev) => {
      const current = prev[currentReel.id] || { count: currentReel.likes, liked: false };
      return {
        ...prev,
        [currentReel.id]: {
          liked: !current.liked,
          count: current.liked ? current.count - 1 : current.count + 1,
        },
      };
    });
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => ({
      ...prev,
      [currentReel.id]: !prev[currentReel.id],
    }));
  };

  const toggleFollow = () => {
    setFollowed((prev) => ({
      ...prev,
      [currentReel.creator.username]: !prev[currentReel.creator.username],
    }));
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: currentReel.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setNotice('Reel link copied!');
      setTimeout(() => setNotice(null), 2500);
    }
  };

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
              onClick={() => {
                setNotice(`Comments (${currentReel.comments})`);
                setTimeout(() => setNotice(null), 2000);
              }}
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
            disabled={currentIndex === demoReels.length - 1}
            onClick={handleNextReel}
            aria-label="Next reel"
          >
            <ChevronDown size={20} />
          </button>
        </aside>
      </div>

      {/* Floating Pill Navigation Menu matching user screenshot */}
      <FloatingPillNav />
    </div>
  );
}
