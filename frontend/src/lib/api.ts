import type { UserProfile, StoryItem, Post } from './types';

// Render Backend / Vercel API Base
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? 'https://amerigam-test.onrender.com' : '');

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (BACKEND_URL ? `${BACKEND_URL}/api` : '/api');

export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return BACKEND_URL ? `${BACKEND_URL}${url}` : url;
  }
  return url;
}

/**
 * Upload an image or video file to backend
 */
export async function uploadMediaFile(file: File): Promise<{
  url: string;
  full_url: string;
  filename: string;
  mimetype: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch profiles from backend
 */
export async function fetchProfiles(): Promise<UserProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/profiles`);
    if (!res.ok) throw new Error('Failed to fetch profiles');
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Backend fetchProfiles error:', err);
    return [];
  }
}

/**
 * Fetch single profile with following count
 */
export async function fetchProfileById(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/profiles/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Toggle follow status between two users
 */
export async function toggleFollowApi(followerId: string, followingId: string): Promise<{ following: boolean }> {
  const res = await fetch(`${API_BASE}/profiles/${followingId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ follower_id: followerId }),
  });
  if (!res.ok) throw new Error('Failed to toggle follow');
  return res.json();
}

/**
 * Fetch stories with strict follower filtering
 * Non-followed creators will NEVER be returned if viewerId is specified!
 */
export async function fetchStories(viewerId?: string): Promise<StoryItem[]> {
  try {
    const url = viewerId ? `${API_BASE}/stories?viewer_id=${encodeURIComponent(viewerId)}` : `${API_BASE}/stories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch stories');
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Backend fetchStories error:', err);
    return [];
  }
}

/**
 * Create a new story in database
 */
export async function createStoryApi(story: {
  author_id: string;
  media_url: string;
  media_type?: 'image' | 'video';
  caption?: string;
  text_overlay?: string;
  filter?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(story),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create story');
  }
  return res.json();
}

/**
 * Delete a story from database
 */
export async function deleteStoryApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/stories/${id}`, { method: 'DELETE' });
  return res.ok;
}

/**
 * Fetch communities with optional category, search query, and viewer joined status
 */
export async function fetchCommunities(options: {
  category?: string;
  q?: string;
  viewer_id?: string;
} = {}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (options.category && options.category !== 'All') params.set('category', options.category);
    if (options.q) params.set('q', options.q);
    if (options.viewer_id) params.set('viewer_id', options.viewer_id);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/communities?${qs}` : `${API_BASE}/communities`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch communities');
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Backend fetchCommunities error:', err);
    return [];
  }
}

/**
 * Toggle join community
 */
export async function toggleJoinCommunityApi(communityId: string, profileId: string): Promise<{ joined: boolean }> {
  const res = await fetch(`${API_BASE}/communities/${communityId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId }),
  });
  if (!res.ok) throw new Error('Failed to toggle join community');
  return res.json();
}

/**
 * Fetch posts with rich filters (feed_type, kind, community_id, search, pagination)
 */
export interface FetchPostsOptions {
  kind?: 'post' | 'reel' | 'blog';
  community_id?: string;
  author_id?: string;
  q?: string;
  feed_type?: 'for_you' | 'communities' | 'network';
  viewer_id?: string;
  limit?: number;
  offset?: number;
  post_type?: 'field' | 'hobby' | 'ad';
}

export async function fetchPosts(options: FetchPostsOptions = {}): Promise<Post[]> {
  try {
    const params = new URLSearchParams();
    if (options.kind) params.set('kind', options.kind);
    if (options.community_id) params.set('community_id', options.community_id);
    if (options.author_id) params.set('author_id', options.author_id);
    if (options.q) params.set('q', options.q);
    if (options.feed_type) params.set('feed_type', options.feed_type);
    if (options.viewer_id) params.set('viewer_id', options.viewer_id);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.post_type) params.set('post_type', options.post_type);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/posts?${qs}` : `${API_BASE}/posts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch posts');
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Backend fetchPosts error:', err);
    return [];
  }
}

/**
 * Fetch single post with comments
 */
export async function fetchPostById(id: string, viewerId?: string): Promise<{ post: Post; comments: any[] } | null> {
  try {
    const url = viewerId ? `${API_BASE}/posts/${id}?viewer_id=${encodeURIComponent(viewerId)}` : `${API_BASE}/posts/${id}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Create a new Post / Reel / Blog in database
 */
export async function createPostApi(postData: Partial<Post>): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create post');
  }
  const data = await res.json();
  return data.post;
}

/**
 * Toggle like on a post
 */
export async function togglePostLikeApi(postId: string, profileId: string): Promise<{ liked: boolean; like_count: number }> {
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId }),
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

/**
 * Toggle bookmark / save on a post
 */
export async function togglePostSaveApi(postId: string, profileId: string): Promise<{ saved: boolean }> {
  const res = await fetch(`${API_BASE}/posts/${postId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId }),
  });
  if (!res.ok) throw new Error('Failed to toggle save');
  return res.json();
}

/**
 * Register a view on a post or reel
 */
export async function incrementPostViewsApi(postId: string): Promise<{ views: number }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/view`, { method: 'POST' });
    if (!res.ok) return { views: 0 };
    return res.json();
  } catch {
    return { views: 0 };
  }
}

/**
 * Register a share on a post or reel - triggers on every click
 */
export async function incrementPostShareApi(postId: string): Promise<{ shares: number }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/share`, { method: 'POST' });
    if (!res.ok) return { shares: 0 };
    return res.json();
  } catch {
    return { shares: 0 };
  }
}

/**
 * Fetch comments for a post
 */
export async function fetchPostCommentsApi(postId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

/**
 * Add comment to post
 */
export async function addPostCommentApi(postId: string, authorId: string, content: string): Promise<any> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_id: authorId, content }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

/**
 * Global search across posts, communities, and profiles
 */
export async function globalSearchApi(query: string, viewerId?: string): Promise<{
  query: string;
  posts: Post[];
  communities: any[];
  profiles: any[];
  counts: { posts: number; communities: number; profiles: number };
}> {
  try {
    const params = new URLSearchParams({ q: query });
    if (viewerId) params.set('viewer_id', viewerId);
    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  } catch (err) {
    console.warn('Backend search error:', err);
    return {
      query,
      posts: [],
      communities: [],
      profiles: [],
      counts: { posts: 0, communities: 0, profiles: 0 },
    };
  }
}
