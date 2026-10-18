import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PostCard } from '@/components/post-card';
import { getCurrentUser } from '@/lib/user-profiles';
import { fetchPostCommentsApi, addPostCommentApi, fetchPostById } from '@/lib/api';
import type { Post } from '@/lib/types';

interface CommentItem {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!id) return;
    // Fetch post and comments from backend database
    fetchPostById(id, currentUser.id)
      .then((res) => {
        if (res?.post) setPost(res.post);
        if (res?.comments) setComments(res.comments);
      })
      .catch((err) => console.error('Fetch post error:', err));

    fetchPostCommentsApi(id)
      .then((items) => {
        if (items && items.length > 0) setComments(items);
      })
      .catch(() => {});
  }, [id, currentUser.id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim() || submitting) return;

    setSubmitting(true);
    const content = commentText.trim();
    try {
      const res = await addPostCommentApi(id, currentUser.id, content);
      const newComment: CommentItem = {
        id: res?.comment?.id || `comment-${Date.now()}`,
        post_id: id,
        author_id: currentUser.id,
        content,
        created_at: new Date().toISOString(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          display_name: currentUser.display_name,
          avatar_url: currentUser.avatar_url,
        },
      };

      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      if (post) {
        setPost({ ...post, comment_count: (post.comment_count || 0) + 1 });
      }
    } catch (err) {
      console.warn('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) {
    return (
      <AppShell>
        <section className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Post not found</h2>
          <p style={{ opacity: 0.6 }}>This post could not be found in the database.</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="detail-page" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>
        <PostCard post={post} expanded />

        {/* Real Interactive Comments Section */}
        <div
          className="comments-section"
          style={{
            marginTop: '1.5rem',
            background: '#13141b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <MessageCircle size={18} color="#00a8ed" />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>
              Comments ({comments.length || post.comment_count || 0})
            </h3>
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.25rem' }}>
            {comments.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0' }}>
                No comments yet. Be the first to share your perspective!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <img
                    src={
                      c.author?.avatar_url ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${c.author?.username || 'user'}`
                    }
                    alt={c.author?.display_name || 'User'}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                        {c.author?.display_name || c.author?.username || 'Creator'}
                      </strong>
                      {c.author?.username && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>@{c.author.username}</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              placeholder={`Comment as @${currentUser.username}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#1d1d24',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                background: commentText.trim() ? '#00a8ed' : 'rgba(255,255,255,0.08)',
                border: 'none',
                color: commentText.trim() ? '#fff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: commentText.trim() ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={15} />
              Send
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
export default PostDetailPage;
