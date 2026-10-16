'use client';
import { useEffect, useState } from 'react';
import { demoPosts } from '@/lib/demo-posts';
import type { Post } from '@/lib/types';
import { MediaCard, PostCard } from './post-card';
export function Feed({ variant = 'home' }: { variant?: 'home' | 'feed' }) { const [posts, setPosts] = useState<Post[]>(demoPosts); const [error, setError] = useState(''); useEffect(() => { fetch('/api/posts').then(r => r.ok ? r.json() : Promise.reject()).then(d => d.items?.length && setPosts(d.items)).catch(() => setError('Connect Supabase to load your live posts. Demo content is shown below.')); }, []); if (variant === 'feed') return <><p className="hint">{error}</p><section className="feed-list">{posts.map(post => <PostCard post={post} expanded key={post.id}/>)}</section></>; return <><p className="hint">{error}</p><section className="home-grid">{posts.slice(2, 5).map(post => <MediaCard post={post} key={post.id}/>)}<PostCard post={posts[0]} key={posts[0].id}/>{posts[1] && <MediaCard post={posts[1]}/>}</section></>; }
