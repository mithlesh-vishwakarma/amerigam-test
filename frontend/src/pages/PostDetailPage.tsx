import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { PostCard } from '@/components/post-card';
import { demoPosts } from '@/lib/demo-posts';
import type { Post } from '@/lib/types';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!id) return;
    const demo = demoPosts.find((p) => p.id === id);
    if (demo) setPost(demo);

    fetch('/api/posts/' + id)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.post) setPost(data.post);
      })
      .catch(() => {});
  }, [id]);

  if (!post) {
    return (
      <AppShell>
        <section className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Post not found</h2>
          <p style={{ opacity: 0.6 }}>It may have been moved or demo data is loading.</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="detail-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <PostCard post={post} expanded />
        <div className="comments" style={{ marginTop: '1.5rem', background: '#141419', padding: '1rem', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Comments ({post.comment_count || 0})</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Add a comment..."
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: '#1d1d24',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            />
            <button
              type="button"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: '#00a8ed',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
export default PostDetailPage;
