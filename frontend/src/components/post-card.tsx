import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ban,
  Bookmark,
  Code2,
  Flag,
  Heart,
  ListPlus,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
  UserMinus,
  Volume2,
  VolumeX,
  Clapperboard,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/user-profiles';
import { togglePostLikeApi, togglePostSaveApi, incrementPostViewsApi } from '@/lib/api';
import { CommentsModal } from './comments-modal';
import type { Post } from '@/lib/types';

export function MediaCard({ post }: { post: Post }) {
  const image = post.media_urls?.[0];
  return (
    <Link to={`/posts/${post.id}`} className="media-card">
      {image ? <img src={image} alt={post.title} /> : <div className="blog-cover" />}
      <div className="media-shade">
        <b>{post.title}</b>
        <small>@{post.profiles?.username || 'creator'}</small>
        <small>
          <Play size={10} fill="currentColor" /> {((post.views || 0) / 1000).toFixed(1)}K
        </small>
      </div>
    </Link>
  );
}

export function PostCard({ post, expanded = false }: { post: Post; expanded?: boolean }) {
  const [liked, setLiked] = useState(!!post.liked);
  const [count, setCount] = useState(post.like_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comment_count || 0);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [slide, setSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [bookmarked, setBookmarked] = useState(!!post.saved);
  const [followed, setFollowed] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync state with incoming database props
  useEffect(() => {
    setLiked(!!post.liked);
    setCount(post.like_count || 0);
    setCommentsCount(post.comment_count || 0);
    setBookmarked(!!post.saved);
  }, [post.id, post.liked, post.like_count, post.comment_count, post.saved]);

  // Register view on view
  useEffect(() => {
    if (post.id) {
      incrementPostViewsApi(post.id).catch(() => {});
    }
  }, [post.id]);

  const like = async () => {
    const user = getCurrentUser();
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);
    setLiked(newLiked);
    setCount(newCount);
    try {
      await togglePostLikeApi(post.id, user.id);
    } catch {}
  };

  const toggleSave = async () => {
    const user = getCurrentUser();
    const newSaved = !bookmarked;
    setBookmarked(newSaved);
    setNotice(newSaved ? 'Post saved to bookmarks!' : 'Post removed from bookmarks');
    setTimeout(() => setNotice(''), 2000);
    try {
      await togglePostSaveApi(post.id, user.id);
    } catch {}
  };

  const toggleVideo = () => {
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

  const actions = [
    ['Not interested in this post', Ban],
    ['Unfollow @' + (post.profiles?.username || 'creator'), UserMinus],
    ['Add/remove from Lists', ListPlus],
    ['Mute @' + (post.profiles?.username || 'creator'), VolumeX],
    ['Block @' + (post.profiles?.username || 'creator'), Ban],
    ['View post activity', Play],
    ['Embed post', Code2],
    ['Report post', Flag],
  ] as const;

  const media = post.media_urls.length ? post.media_urls : [];
  const isReel = post.kind === 'reel';
  const videoUrl = media.find((m) => m.endsWith('.mp4'));
  const imageUrl = media.find((m) => !m.endsWith('.mp4')) || media[0];

  return (
    <article className={`post-card ${isReel ? 'reel-post-type' : ''} ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <header className="post-header">
        <div className="post-author-group">
          <img
            className="avatar"
            src={post.profiles?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${post.profiles?.username || 'creator'}`}
            alt=""
          />
          <div className="post-author-meta">
            <b>{post.profiles?.display_name || '@' + post.profiles?.username || 'creator'}</b>
            <small>{post.profiles?.role || 'Creator'}</small>
          </div>
        </div>

        <div className="post-header-actions">
          {isReel && (
            <span className="post-badge-reel">
              <Clapperboard size={12} /> Reel
            </span>
          )}
          <button
            type="button"
            className={`follow ${followed ? 'following' : ''}`}
            onClick={() => setFollowed(!followed)}
          >
            {followed ? 'Following' : 'Follow'}
          </button>
          <button
            type="button"
            className="more"
            aria-label="Post options"
            onClick={() => setMenu(!menu)}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {menu && (
          <div className="post-menu">
            {actions.map(([label, Icon]) => (
              <button
                key={label}
                className={label.startsWith('Block') ? 'danger' : ''}
                onClick={() => {
                  setNotice(label + ' selected');
                  setMenu(false);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Media Display - Mixed Types (Reels with Video Player, Carousels, Images) */}
      {isReel && videoUrl ? (
        <div className="home-inline-reel" onClick={toggleVideo}>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl}
            loop
            playsInline
            muted={isMuted}
            className="home-reel-video"
          />
          <div className="home-reel-overlay">
            <button
              type="button"
              className="home-reel-mute"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {!isPlaying && (
              <div className="home-reel-play-btn">
                <Play size={24} fill="#fff" />
              </div>
            )}
            <div className="home-reel-bottom-hint">
              <Link to="/feed" className="watch-in-feed-link">
                Watch in Feed Reels ›
              </Link>
            </div>
          </div>
        </div>
      ) : media[0] ? (
        <div className="media-carousel">
          <Link to={`/posts/${post.id}`}>
            <img className="post-media" src={media[slide]} alt={post.title} />
          </Link>
          {media.length > 1 && (
            <>
              <span className="media-count">
                {slide + 1}/{media.length}
              </span>
              <button
                type="button"
                className="next-media"
                onClick={(e) => {
                  e.preventDefault();
                  setSlide((slide + 1) % media.length);
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      ) : null}

      {/* Post Text Description */}
      <div className="post-copy">
        <p>
          {expanded
            ? post.description
            : post.description.length > 200
            ? `${post.description.slice(0, 200)}...`
            : post.description}
        </p>
      </div>

      {notice && <p className="post-notice">{notice}</p>}

      {/* Footer Actions */}
      <footer>
        <small className="views-count">
          {Math.round(post.views / 1000)}K Views
        </small>
        <div className="post-engagement-bar">
          <button
            type="button"
            onClick={like}
            className={liked ? 'liked' : ''}
            aria-label="Like"
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{count > 0 ? (count > 1000 ? `${(count / 1000).toFixed(1)}k` : count) : ''}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.origin + `/posts/${post.id}`);
              setNotice('Post link copied!');
              setTimeout(() => setNotice(''), 2000);
            }}
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowComments(true)}
            aria-label="Comments"
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={18} />
            <span>{commentsCount > 0 ? (commentsCount > 1000 ? `${(commentsCount / 1000).toFixed(1)}k` : commentsCount) : ''}</span>
          </button>
          <button
            type="button"
            className={bookmarked ? 'bookmarked' : ''}
            onClick={toggleSave}
            aria-label="Save"
          >
            <Bookmark size={18} fill={bookmarked ? '#00a8ed' : 'none'} color={bookmarked ? '#00a8ed' : 'currentColor'} />
          </button>
        </div>
      </footer>

      {/* Interactive Comments Modal */}
      <CommentsModal
        postId={post.id}
        postTitle={post.title}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={(newCount) => setCommentsCount(newCount)}
      />
    </article>
  );
}
