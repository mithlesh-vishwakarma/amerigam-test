import React, { useEffect, useState } from 'react';
import { demoPosts } from '@/lib/demo-posts';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { HomeStories } from './home-stories';
import { FeedFilters } from './feed-filters';
import { ReelFeed } from './reel-feed';

export function Feed({ variant = 'home' }: { variant?: 'home' | 'feed' }) {
  const [posts, setPosts] = useState<Post[]>(demoPosts);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('For You');

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => d.items?.length && setPosts(d.items))
      .catch(() =>
        setError('')
      );
  }, []);

  // If variant is 'feed', render the full immersive Reel Video Feed
  if (variant === 'feed') {
    return <ReelFeed />;
  }

  // Filter posts based on tab
  const visiblePosts =
    filter === 'Communities'
      ? posts.filter((_, i) => i % 2 === 0)
      : filter === 'Network'
      ? posts.filter((_, i) => i % 2 === 1)
      : posts;

  // Single vertical line feed with mixed posts
  return (
    <div className="home-feed-layout">
      {/* Small filter tabs */}
      <FeedFilters onChange={setFilter} />

      {/* Stories Carousel */}
      <HomeStories />

      {error && <p className="hint">{error}</p>}

      {/* In One Line Vertical Feed: Mixed Posts & Reels */}
      <section className="vertical-mixed-feed" aria-label="Home feed stream">
        {visiblePosts.map((post) => (
          <PostCard post={post} key={post.id} />
        ))}
      </section>
    </div>
  );
}
