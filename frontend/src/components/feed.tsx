import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, MoreVertical } from 'lucide-react';
import { demoReels, demoHomeMainPost, demoHomeSideStack } from '@/lib/demo-posts';
import { FeedFilters } from './feed-filters';
import { HomeStories } from './home-stories';
import { ReelFeed } from './reel-feed';

export function Feed({ variant = 'home' }: { variant?: 'home' | 'feed' }) {
  const [following, setFollowing] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [filter, setFilter] = useState('For You');

  // If on /feed, render full-screen immersive Reel player
  if (variant === 'feed') {
    return <ReelFeed />;
  }

  return (
    <div className="home-dashboard-layout">
      {/* 1. Small Filter Tabs (For You / Communities / Network) */}
      <FeedFilters onChange={setFilter} />

      {/* 2. Stories Carousel (Add Story, Find Friends, Following Creators) */}
      <HomeStories />

      {/* 3. Multiple Reels in Horizontal Scrollable Track */}
      <section className="home-reels-section" aria-label="Featured reels stream">
        <div className="reels-horizontal-track">
          {demoReels.map((reel) => (
            <Link
              to="/feed"
              key={reel.id}
              className="home-reel-card"
              style={{ backgroundImage: `url(${reel.poster_url})` }}
            >
              {/* Top-Left badge (like @neel.films in screenshot) */}
              {reel.badgeTop && (
                <div className="reel-badge-top-left">
                  <img
                    src={reel.creator.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                    alt={reel.creator.name}
                    className="reel-badge-avatar"
                  />
                  <span className="reel-badge-handle">@{reel.creator.username}</span>
                </div>
              )}

              {/* Gradient Scrim */}
              <div className="home-card-scrim" />

              {/* Bottom Metadata */}
              <div className="home-card-content">
                <h4 className="home-card-title">{reel.title}</h4>
                <p className="home-card-handle">@{reel.creator.username}</p>
                <div className="home-card-views">
                  <Play size={10} fill="currentColor" strokeWidth={0} />
                  <span>
                    {(reel.views / 1000).toFixed(1)}K · {reel.duration || '0:30'}
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
                <img src={demoHomeMainPost.author.avatar} alt={demoHomeMainPost.author.name} />
              </div>
              <div className="post-author-text">
                <div className="author-handle-row">
                  <span className="author-handle">@{demoHomeMainPost.author.username}</span>
                </div>
                <small className="author-role">{demoHomeMainPost.author.role}</small>
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
            <p className="post-caption-p">
              {demoHomeMainPost.caption}{' '}
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
                  you are only limited by your tools. Explore our color preset package now live on Amerigam.
                </span>
              )}
            </p>
          </div>

          {/* Horizontal Scrollable Posts Media Carousel */}
          <div className="post-horizontal-carousel">
            {demoHomeMainPost.slides.map((slide) => (
              <div
                key={slide.id}
                className="post-slide-card"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="home-card-scrim" />
                <div className="home-card-content">
                  <h4 className="home-card-title">{slide.title}</h4>
                  <p className="home-card-handle">{slide.authorHandle}</p>
                  <div className="home-card-views">
                    <Play size={10} fill="currentColor" strokeWidth={0} />
                    <span>
                      {slide.views} · {slide.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Stacked Cards as shown in reference */}
        <div className="home-side-stack">
          {demoHomeSideStack.map((card) => (
            <div
              key={card.id}
              className="side-stack-card"
              style={{ backgroundImage: `url(${card.image})` }}
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
