import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { getCurrentUser } from '@/lib/user-profiles';
import { fetchPostCommentsApi, addPostCommentApi } from '@/lib/api';

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

interface CommentsModalProps {
  postId: string;
  postTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (newCount: number) => void;
}

export function CommentsModal({
  postId,
  postTitle = 'Comments',
  isOpen,
  onClose,
  onCommentAdded,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isOpen || !postId) return;
    let active = true;
    setLoading(true);

    fetchPostCommentsApi(postId)
      .then((items) => {
        if (active) {
          setComments(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await addPostCommentApi(postId, currentUser.id, trimmed);
      const newComment: CommentItem = {
        id: res.comment?.id || `comment-${Date.now()}`,
        post_id: postId,
        author_id: currentUser.id,
        content: trimmed,
        created_at: new Date().toISOString(),
        author: {
          id: currentUser.id,
          username: currentUser.username,
          display_name: currentUser.display_name,
          avatar_url: currentUser.avatar_url,
        },
      };

      const updated = [...comments, newComment];
      setComments(updated);
      setText('');
      if (onCommentAdded) {
        onCommentAdded(updated.length);
      }
    } catch (err) {
      console.warn('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="comments-modal-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '75vh',
              maxHeight: '620px',
              background: '#13141b',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageCircle size={18} color="#00a8ed" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                  Comments ({comments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: '#94a3b8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Comments List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
                  Loading conversation...
                </div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#cbd5e1' }}>No comments yet</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>Be the first to share your thoughts on this!</p>
                </div>
              ) : (
                comments.map((c) => {
                  const avatar =
                    c.author?.avatar_url ||
                    `https://api.dicebear.com/9.x/initials/svg?seed=${c.author?.username || 'user'}`;
                  const name = c.author?.display_name || c.author?.username || 'Creator';
                  const handle = c.author?.username ? `@${c.author.username}` : '';

                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <img
                        src={avatar}
                        alt={name}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{name}</span>
                          {handle && (
                            <span style={{ fontSize: '11.5px', color: '#64748b' }}>{handle}</span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#cbd5e1',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                          }}
                        >
                          {c.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <input
                type="text"
                placeholder={`Comment as @${currentUser.username}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                style={{
                  background: text.trim() ? '#00a8ed' : 'rgba(255, 255, 255, 0.08)',
                  color: text.trim() ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: text.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
