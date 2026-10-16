import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, MoreVertical, Sparkles, Globe, Users, ArrowRight, Check, Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { demoHomeMainPost, demoHomeSideStack, ReelItem } from '@/lib/demo-posts';
import { contentStore, CONTENT_UPDATED_EVENT } from '@/lib/content-store';
import {
  AUTH_CHANGED_EVENT,
  getCurrentUser,
  getJoinedCommunitiesForUser,
  COMMUNITY_POSTS,
  UserProfile,
} from '@/lib/user-profiles';
import { FeedFilters } from './feed-filters';
import { HomeStories } from './home-stories';
import { CommentsModal } from './comments-modal';
import { fetchPosts, togglePostLikeApi, togglePostSaveApi, incrementPostViewsApi } from '@/lib/api';
import type { Post } from '@/lib/types';

export function Feed({ variant = 'home' }: { variant?: 'home' | 'feed' }) {
  const [following, setFollowing] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [filter, setFilter] = useState('For You');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(getCurrentUser());
  const [reels, setReels] = useState<ReelItem[]>(contentStore.getReels());
  const [posts, setPosts] = useState<Post[]>(contentStore.getPosts());
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState<string>('all');
  const [primaryLiked, setPrimaryLiked] = useState(false);
  const [primaryLikesCount, setPrimaryLikesCount] = useState(730);
  const [primarySaved, setPrimarySaved] = useState(false);
  const [primaryCommentsCount, setPrimaryCommentsCount] = useState(82);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Load from backend API
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const feedType = filter === 'Communities' ? 'communities' : filter === 'Network' ? 'network' : 'for_you';
        const backendPosts = await fetchPosts({
          feed_type: feedType,
          viewer_id: currentUserProfile.id,
        });
        if (active && backendPosts && backendPosts.length > 0) {
          setPosts(backendPosts);
        }
      } catch (err) {
        console.warn('Backend posts load error:', err);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [filter, currentUserProfile.id]);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUserProfile(getCurrentUser());
      setReels(contentStore.getReels());
      setPosts(contentStore.getPosts());
    };
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    window.addEventListener(AUTH_CHANGED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleUpdate);
    };
  }, []);

  const userCommunities = getJoinedCommunitiesForUser(currentUserProfile);

  // Dynamically filtered posts based on active tab ('For You' | 'Communities' | 'Network')
  const displayedPosts = useMemo(() => {
    if (filter === 'Communities') {
      let commPosts: Post[] = [];
      userCommunities.forEach((c) => {
        if (selectedCommunityFilter === 'all' || selectedCommunityFilter === c.id) {
          const list = COMMUNITY_POSTS[c.id] || [];
          commPosts.push(...list);
        }
      });
      // Also include any user-created posts that mention or tag communities
      const userTagged = posts.filter((p) => p.location?.includes('Guild') || p.kind === 'blog');
      const merged = [...commPosts, ...userTagged];
      return merged.length > 0 ? merged : posts;
    }

    if (filter === 'Network') {
      // Posts from friends and connected peers
      return posts.filter((p) => p.author_id !== currentUserProfile.id || p.collaborators?.length);
    }

    // Default 'For You'
    return posts;
  }, [filter, posts, userCommunities, selectedCommunityFilter, currentUserProfile.id]);

  // Primary featured post
  const primaryPost: Post = displayedPosts[0] || {
    id: demoHomeMainPost.id,
    author_id: 'user-demo',
    title: 'The Colour Grading Process: Kodak 2383 Film Emulation',
    description: demoHomeMainPost.caption,
    kind: 'post',
    media_urls: demoHomeMainPost.slides.map((s) => s.image),
    views: 31400,
    created_at: new Date().toISOString(),
    profiles: {
      id: 'user-demo',
      username: demoHomeMainPost.author.username,
      display_name: demoHomeMainPost.author.name,
      avatar_url: demoHomeMainPost.author.avatar,
      role: demoHomeMainPost.author.role,
    },
  };

  // Remaining posts for side stack
  const sidePosts = displayedPosts.slice(1, 4);

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
                    {((reel.views || 0) / 1000).toFixed(1)}K · {reel.duration || '0:30'}
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
                      {((primaryPost.views || 18400) / 1000).toFixed(1)}K · 0:45
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
                    await togglePostLikeApi(primaryPost.id, currentUserProfile.id);
                  } catch {}
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
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + `/posts/${primaryPost.id}`);
                  setNotice('Post link copied!');
                  setTimeout(() => setNotice(''), 2000);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Share2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Play size={10} fill="currentColor" /> {((primaryPost.views || 18400) / 1000).toFixed(1)}K Views
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
                  } catch {}
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
                  backgroundImage: `url(${card.media_urls[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'})`,
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
                      {((card.views || 12000) / 1000).toFixed(1)}K · 0:30
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            demoHomeSideStack.map((card) => (
              <Link
                to="/feed"
                key={card.id}
                className="side-stack-card"
                style={{ backgroundImage: `url(${card.image})`, textDecoration: 'none' }}
              >
                <div className="home-card-scrim" />
                <div className="home-card-content">
                  <h4 className="home-card-title">{card.title}</h4>
                  <p className="home-card-handle">{card.authorHandle}</p>
                  <div className="home-card-views">
                    <Play size={10} fill="currentColor" strokeWidth={0} />
                    <span>
                      {card.views} · {card.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))
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
