import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, MoreVertical, Sparkles, Globe, Users, ArrowRight, Check, Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import type { ReelItem } from '@/lib/types';
import {
  AUTH_CHANGED_EVENT,
  getCurrentUser,
  getJoinedCommunitiesForUser,
  UserProfile,
} from '@/lib/user-profiles';
import { FeedFilters } from './feed-filters';
import { HomeStories } from './home-stories';
import { CommentsModal } from './comments-modal';
import { fetchPosts, togglePostLikeApi, togglePostSaveApi, incrementPostViewsApi, incrementPostShareApi, resolveMediaUrl } from '@/lib/api';
import type { Post } from '@/lib/types';

export function Feed({ variant = 'home' }: { variant?: 'home' | 'feed' }) {
  const [following, setFollowing] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [filter, setFilter] = useState('For You');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(getCurrentUser());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState<string>('all');
  const [primaryLiked, setPrimaryLiked] = useState(false);
  const [primaryLikesCount, setPrimaryLikesCount] = useState(0);
  const [primarySharesCount, setPrimarySharesCount] = useState(0);
  const [primarySaved, setPrimarySaved] = useState(false);
  const [primaryCommentsCount, setPrimaryCommentsCount] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Load posts purely from live backend database
  const loadPosts = async () => {
    try {
      const feedType = filter === 'Communities' ? 'communities' : filter === 'Network' ? 'network' : 'for_you';
      const backendPosts = await fetchPosts({
        feed_type: feedType,
        viewer_id: currentUserProfile.id,
      });
      if (backendPosts) {
        setPosts(backendPosts);
      }
    } catch (err) {
      console.warn('Backend posts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filter, currentUserProfile.id]);

  useEffect(() => {
    const handleAuth = () => setCurrentUserProfile(getCurrentUser());
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
  }, []);

  const userCommunities = getJoinedCommunitiesForUser(currentUserProfile);

  // Dynamically filtered posts based on active tab ('For You' | 'Communities' | 'Network')
  const displayedPosts = useMemo(() => {
    if (filter === 'Communities') {
      if (selectedCommunityFilter === 'all') return posts;
      return posts.filter((p) => p.community_id === selectedCommunityFilter);
    }
    if (filter === 'Network') {
      return posts.filter((p) => p.author_id !== currentUserProfile.id);
    }
    return posts;
  }, [filter, posts, selectedCommunityFilter, currentUserProfile.id]);

  // Primary featured post (Live Database)
  const primaryPost: Post | undefined = displayedPosts[0];

  useEffect(() => {
    if (primaryPost) {
      setPrimaryLiked(Boolean(primaryPost.liked));
      setPrimaryLikesCount(primaryPost.like_count ?? 0);
      setPrimarySharesCount(primaryPost.shares ?? 0);
      setPrimarySaved(Boolean(primaryPost.saved));
      setPrimaryCommentsCount(primaryPost.comment_count ?? 0);
    }
  }, [primaryPost?.id, primaryPost?.liked, primaryPost?.like_count, primaryPost?.shares, primaryPost?.saved, primaryPost?.comment_count]);

  // Derive Reels strictly from database posts
  const reels: ReelItem[] = useMemo(() => {
    return posts
      .filter((p) => p.kind === 'reel')
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        video_url:
          p.media_urls?.find(
            (m) =>
              m.endsWith('.mp4') ||
              m.endsWith('.webm') ||
              m.includes('reel') ||
              m.includes('video')
          ) ||
          p.media_urls?.[0] ||
          '/media/reel-1.mp4',
        poster_url:
          p.poster_url ||
          p.media_urls?.[0] ||
          'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        creator: {
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
        shares: 24,
        views: p.views ?? 0,
        duration: p.duration || '0:30',
      }));
  }, [posts]);

  if (loading) {
    return (
      <div className="home-dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#00a8ed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,168,237,0.2)', borderTopColor: '#00a8ed', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, letterSpacing: '0.04em', color: '#94a3b8' }}>Loading feed from database...</span>
        </div>
      </div>
    );
  }

  if (!primaryPost) {
    return (
      <div className="home-dashboard-layout">
        <FeedFilters onChange={setFilter} />
        <HomeStories />
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <h3 style={{ color: '#e2e8f0' }}>No posts found in this feed.</h3>
          <p style={{ fontSize: '13px', marginTop: 8 }}>Create the first post from the Create page!</p>
        </div>
      </div>
    );
  }

  const sidePosts = displayedPosts.slice(1);

  return (
    <div className="home-dashboard-layout">
      {/* 1. Filter Tabs (For You / Communities / Network) with live active filter binding */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <FeedFilters onChange={setFilter} />

        <div className="role-feed-banner-pill">
          <span
            className="role-feed-dot"
            style={{ background: currentUserProfile.themeColor }}
          />
          <span className="role-feed-pill-text">
            <strong>{currentUserProfile.role}</strong> Feed · @{currentUserProfile.username}
          </span>
          <Link to="/login" className="role-switch-link">
            Switch
          </Link>
        </div>
      </div>

      {/* Sub-header for Communities filter */}
      {filter === 'Communities' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setSelectedCommunityFilter('all')}
            style={{
              background: selectedCommunityFilter === 'all' ? '#0077e6' : '#191b22',
              border: '1px solid #2b2d39',
              color: selectedCommunityFilter === 'all' ? '#fff' : '#a0a2ad',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Joined ({userCommunities.length})
          </button>
          {userCommunities.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCommunityFilter(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: selectedCommunityFilter === c.id ? '#0077e6' : '#191b22',
                border: '1px solid #2b2d39',
                color: selectedCommunityFilter === c.id ? '#fff' : '#a0a2ad',
                borderRadius: 16,
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <img src={c.avatar} alt={c.name} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sub-header for Network filter */}
      {filter === 'Network' && (
        <div style={{ background: 'rgba(0, 168, 237, 0.08)', border: '1px solid rgba(0, 168, 237, 0.25)', borderRadius: 12, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="#00a8ed" />
            <span style={{ fontSize: '12px', color: '#cbe4fb' }}>
              Showing posts from your creator network & collaborative peer circle
            </span>
          </div>
          <Link to="/network" style={{ color: '#38bdf8', fontSize: '11.5px', fontWeight: 600, textDecoration: 'none' }}>
            Find Creators →
          </Link>
        </div>
      )}

      {/* 2. Stories Carousel */}
      <HomeStories />

      {/* 3. Featured Reels Track */}
      <section className="home-reels-section" aria-label="Featured reels stream">
        <div className="reels-horizontal-track">
          {reels.map((reel) => (
            <Link
              to="/feed"
              key={reel.id}
              className="home-reel-card"
              style={{ backgroundImage: `url(${reel.poster_url})` }}
            >
              {reel.badgeTop && (
                <div className="reel-badge-top-left">
                  <img
                    src={reel.creator?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                    alt={reel.creator?.name || 'Creator'}
                    className="reel-badge-avatar"
                  />
                  <span className="reel-badge-handle">@{reel.creator?.username || 'creator'}</span>
                </div>
              )}

              <div className="home-card-scrim" />

              <div className="home-card-content">
                <h4 className="home-card-title">{reel.title}</h4>
                <p className="home-card-handle">@{reel.creator?.username || 'creator'}</p>
                <div className="home-card-views">
                  <Play size={10} fill="currentColor" strokeWidth={0} />
                  <span>
                    {((reel.views || 0) / 1000).toFixed(1)}K · {reel.duration}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Lower Section: Split Layout (Horizontal Post Carousel on Left, Stacked Media Cards on Right) */}
      <section className="home-lower-grid" aria-label="Recent creator posts">
        {/* Left Column: Author Post with Horizontal Scrollable Media */}
        <div className="home-main-post-card">
          {/* Post Header */}
          <header className="post-header-row">
            <div className="post-author-box">
              <div className="post-author-gradient-avatar">
                <img
                  src={primaryPost.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
                  alt={primaryPost.profiles?.display_name || 'Creator'}
                />
              </div>
              <div className="post-author-text">
                <div className="author-handle-row">
                  <span className="author-handle">@{primaryPost.profiles?.username || 'creator'}</span>
                </div>
                <small className="author-role">{primaryPost.profiles?.role || 'Creator'}</small>
              </div>
            </div>

            <div className="post-header-actions">
              <button
                type="button"
                className={`post-follow-pill ${following ? 'is-following' : ''}`}
                onClick={() => setFollowing(!following)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button type="button" className="post-dots-btn" aria-label="More options">
                <MoreVertical size={18} />
              </button>
            </div>
          </header>

          {/* Post Caption with ...more toggle */}
          <div className="post-caption-box">
            <h3 style={{ fontSize: '15px', color: '#fff', margin: '0 0 6px 0', fontWeight: 600 }}>
              {primaryPost.title}
            </h3>
            <p className="post-caption-p">
              {primaryPost.description}{' '}
              {!showFullCaption ? (
                <button
                  type="button"
                  className="caption-more-link"
                  onClick={() => setShowFullCaption(true)}
                >
                  ...more
                </button>
              ) : (
                <span className="caption-extended">
                  Explore full techniques and assets live on Amerigam.
                </span>
              )}
            </p>
          </div>

          {/* Horizontal Scrollable Posts Media Carousel */}
          <div className="post-horizontal-carousel">
            {primaryPost.media_urls.map((mediaUrl, idx) => (
              <div
                key={`${primaryPost.id}-slide-${idx}`}
                className="post-slide-card"
                style={{ backgroundImage: `url(${mediaUrl})` }}
              >
                <div className="home-card-scrim" />
                <div className="home-card-content">
                  <h4 className="home-card-title">{primaryPost.title}</h4>
                  <p className="home-card-handle">@{primaryPost.profiles?.username || 'creator'}</p>
                  <div className="home-card-views">
                    <Play size={10} fill="currentColor" strokeWidth={0} />
                    <span>
                      {((primaryPost.views || 18400) / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notice Toast */}
          {notice && (
            <div style={{ padding: '6px 14px', fontSize: '12px', color: '#38bdf8', background: 'rgba(0,168,237,0.1)', borderRadius: 8, margin: '8px 16px 0' }}>
              {notice}
            </div>
          )}

          {/* Post Engagement Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              marginTop: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                type="button"
                onClick={async () => {
                  const newLiked = !primaryLiked;
                  const newCount = newLiked ? primaryLikesCount + 1 : Math.max(0, primaryLikesCount - 1);
                  setPrimaryLiked(newLiked);
                  setPrimaryLikesCount(newCount);
                  try {
                    const res = await togglePostLikeApi(primaryPost.id, currentUserProfile.id);
                    if (res && typeof res.like_count === 'number') {
                      setPrimaryLikesCount(res.like_count);
                      setPrimaryLiked(res.liked);
                    }
                  } catch { }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: primaryLiked ? '#ff3b44' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <Heart size={18} fill={primaryLiked ? '#ff3b44' : 'none'} />
                <span>{primaryLikesCount > 1000 ? `${(primaryLikesCount / 1000).toFixed(1)}k` : primaryLikesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCommentsPostId(primaryPost.id);
                  setShowCommentsModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '13px',
                }}
              >
                <MessageCircle size={18} />
                <span>{primaryCommentsCount > 1000 ? `${(primaryCommentsCount / 1000).toFixed(1)}k` : primaryCommentsCount}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setPrimarySharesCount((prev) => prev + 1);
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: primaryPost.title, url: window.location.origin + `/posts/${primaryPost.id}` }).catch(() => { });
                  } else {
                    navigator.clipboard?.writeText(window.location.origin + `/posts/${primaryPost.id}`);
                    setNotice('Post link copied!');
                    setTimeout(() => setNotice(''), 2000);
                  }
                  try {
                    const res = await incrementPostShareApi(primaryPost.id);
                    if (res && typeof res.shares === 'number') {
                      setPrimarySharesCount(res.shares);
                    }
                  } catch { }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 500,
                  fontSize: '13px',
                }}
                title="Share this post"
              >
                <Share2 size={18} />
                <span>{primarySharesCount > 0 ? (primarySharesCount > 1000 ? `${(primarySharesCount / 1000).toFixed(1)}k` : primarySharesCount) : ''}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Play size={10} fill="currentColor" /> {((primaryPost.views || 0) / 1000).toFixed(1)}K Views
              </span>
              <button
                type="button"
                onClick={async () => {
                  const newSaved = !primarySaved;
                  setPrimarySaved(newSaved);
                  setNotice(newSaved ? 'Post saved to bookmarks!' : 'Removed from bookmarks');
                  setTimeout(() => setNotice(''), 2000);
                  try {
                    await togglePostSaveApi(primaryPost.id, currentUserProfile.id);
                  } catch { }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: primarySaved ? '#00a8ed' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Bookmark size={18} fill={primarySaved ? '#00a8ed' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stacked Cards as shown in reference */}
        <div className="home-side-stack">
          {sidePosts.length > 0 ? (
            sidePosts.map((card) => (
              <Link
                to={`/posts/${card.id}`}
                key={card.id}
                className="side-stack-card"
                style={{
                  backgroundImage: card.media_urls?.[0] ? `url(${card.media_urls[0]})` : undefined,
                  backgroundColor: '#1b1d24',
                  textDecoration: 'none',
                }}
              >
                <div className="home-card-scrim" />
                <div className="home-card-content">
                  <h4 className="home-card-title">{card.title}</h4>
                  <p className="home-card-handle">@{card.profiles?.username || 'creator'}</p>
                  <div className="home-card-views">
                    <Play size={10} fill="currentColor" strokeWidth={0} />
                    <span>
                      {((card.views || 0) / 1000).toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: '24px 16px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
              No other posts in this stream.
            </div>
          )}
        </div>
      </section>

      {/* Interactive Comments Modal */}
      <CommentsModal
        postId={commentsPostId || primaryPost.id}
        postTitle={primaryPost.title}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        onCommentAdded={(newCount) => setPrimaryCommentsCount(newCount)}
      />
    </div>
  );
}
export default Feed;
