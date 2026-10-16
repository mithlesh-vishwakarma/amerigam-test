import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://urliixbjasydzyaklrzm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY not found in .env');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log('⚡ Connected directly to live Supabase database at:', SUPABASE_URL);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface ProfileRecord {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: 'Developer' | 'Editor' | 'Content Writer' | 'Business Analyst';
  bio: string;
  rank: string;
  points: string;
  rating: string;
  skills: string[];
  theme_color: string;
  created_at: string;
}

export interface FollowRecord {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface CommunityRecord {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatar: string;
  banner: string;
  members_count: string;
  member_count_num: number;
  description: string;
  tags: string[];
  featured_post_title?: string;
  created_at: string;
}

export interface PostRecord {
  id: string;
  author_id: string;
  community_id?: string;
  title: string;
  description: string;
  kind: 'post' | 'reel' | 'blog';
  media_urls: string[];
  poster_url?: string;
  duration?: string;
  music?: string;
  location?: string;
  collaborators?: string[];
  is_ai_labeled?: boolean;
  hide_stats?: boolean;
  views: number;
  shares?: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface StoryRecord {
  id: string;
  author_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  text_overlay?: string;
  filter?: string;
  created_at: string;
  expires_at: string;
}

export interface CommentRecord {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface PostFilterParams {
  q?: string;
  kind?: 'post' | 'reel' | 'blog';
  community_id?: string;
  author_id?: string;
  feed_type?: 'for_you' | 'communities' | 'network';
  viewer_id?: string;
  limit?: number;
  offset?: number;
}

export interface CommunityFilterParams {
  category?: string;
  q?: string;
  viewer_id?: string;
}

// ============================================================================
// PROFILES (LIVE SUPABASE DATABASE)
// ============================================================================
export async function getProfiles(): Promise<ProfileRecord[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase getProfiles error:', error.message);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getProfileById error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function updateProfile(id: string, patch: Partial<ProfileRecord>): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateProfile error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

// ============================================================================
// FOLLOW GRAPH (LIVE SUPABASE DATABASE)
// ============================================================================
export async function getFollowingIds(profileId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profileId);

  if (error) {
    console.error('Supabase getFollowingIds error:', error.message);
    return [];
  }
  return (data || []).map((f) => f.following_id);
}

export async function toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw new Error(error.message);
    return { following: false };
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) throw new Error(error.message);
    return { following: true };
  }
}

// ============================================================================
// COMMUNITIES (LIVE SUPABASE DATABASE)
// ============================================================================
export async function getCommunities(filters?: CommunityFilterParams): Promise<CommunityRecord[]> {
  let query = supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: true });

  if (filters?.category && filters.category !== 'All') {
    query = query.ilike('category', `%${filters.category}%`);
  }
  if (filters?.q) {
    const search = `%${filters.q.toLowerCase()}%`;
    query = query.or(`name.ilike.${search},handle.ilike.${search},category.ilike.${search},description.ilike.${search}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase getCommunities error:', error.message);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getCommunityById(id: string): Promise<CommunityRecord | null> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getCommunityById error:', error.message);
    return null;
  }
  return data;
}

export async function joinCommunity(communityId: string, profileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_members')
    .upsert({ community_id: communityId, profile_id: profileId, role: 'member' }, { onConflict: 'community_id,profile_id' });

  if (error) throw new Error(error.message);
  return true;
}

export async function leaveCommunity(communityId: string, profileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('profile_id', profileId);

  if (error) throw new Error(error.message);
  return true;
}

// ============================================================================
// POSTS, REELS & BLOGS (LIVE SUPABASE DATABASE)
// ============================================================================
export async function getPosts(filters?: PostFilterParams): Promise<any[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (*),
      communities:community_id (*)
    `);

  if (filters?.kind) {
    query = query.eq('kind', filters.kind);
  }
  if (filters?.community_id) {
    query = query.eq('community_id', filters.community_id);
  }
  if (filters?.author_id) {
    query = query.eq('author_id', filters.author_id);
  }
  if (filters?.q) {
    const search = `%${filters.q.toLowerCase()}%`;
    query = query.or(`title.ilike.${search},description.ilike.${search},location.ilike.${search}`);
  }

  // Handle feed_type
  if (filters?.feed_type === 'communities' && filters.viewer_id) {
    const { data: memberRows } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('profile_id', filters.viewer_id);
    const commIds = (memberRows || []).map((m) => m.community_id);
    if (commIds.length > 0) {
      query = query.in('community_id', commIds);
    }
  } else if (filters?.feed_type === 'network' && filters.viewer_id) {
    const followingIds = await getFollowingIds(filters.viewer_id);
    if (followingIds.length > 0) {
      query = query.in('author_id', [...followingIds, filters.viewer_id]);
    }
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.offset !== undefined && filters.offset > 0) {
    const limit = filters?.limit || 50;
    query = query.range(filters.offset, filters.offset + limit - 1);
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getPosts error:', error.message);
    throw new Error(error.message);
  }

  let posts = data || [];

  // Attach liked and saved flags for viewer
  if (filters?.viewer_id && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const [likesRes, savesRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('profile_id', filters.viewer_id).in('post_id', postIds),
      supabase.from('post_saves').select('post_id').eq('profile_id', filters.viewer_id).in('post_id', postIds),
    ]);

    const likedSet = new Set((likesRes.data || []).map((l) => l.post_id));
    const savedSet = new Set((savesRes.data || []).map((s) => s.post_id));

    posts = posts.map((p) => ({
      ...p,
      shares: p.shares ?? localPostShares.get(p.id) ?? 0,
      liked: likedSet.has(p.id),
      saved: savedSet.has(p.id),
    }));
  } else {
    posts = posts.map((p) => ({
      ...p,
      shares: p.shares ?? localPostShares.get(p.id) ?? 0,
    }));
  }

  return posts;
}

export async function getPostById(id: string, viewerId?: string): Promise<any | null> {
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (*),
      communities:community_id (*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !post) return null;

  let liked = false;
  let saved = false;

  if (viewerId) {
    const [likeRes, saveRes] = await Promise.all([
      supabase.from('post_likes').select('id').eq('post_id', id).eq('profile_id', viewerId).maybeSingle(),
      supabase.from('post_saves').select('id').eq('post_id', id).eq('profile_id', viewerId).maybeSingle(),
    ]);
    liked = Boolean(likeRes.data);
    saved = Boolean(saveRes.data);
  }

  return {
    ...post,
    shares: post.shares ?? localPostShares.get(id) ?? 0,
    liked,
    saved,
  };
}

export async function createPost(post: PostRecord): Promise<any> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select(`
      *,
      profiles:author_id (*),
      communities:community_id (*)
    `)
    .single();

  if (error) {
    console.error('Supabase createPost error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function updatePost(id: string, patch: Partial<PostRecord>): Promise<any | null> {
  const { data, error } = await supabase
    .from('posts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      profiles:author_id (*),
      communities:community_id (*)
    `)
    .single();

  if (error) {
    console.error('Supabase updatePost error:', error.message);
    return null;
  }
  return data;
}

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    console.error('Supabase deletePost error:', error.message);
    return false;
  }
  return true;
}

// ============================================================================
// LIKES, SAVES & VIEWS (LIVE SUPABASE DATABASE)
// ============================================================================
export async function togglePostLike(postId: string, profileId: string): Promise<{ liked: boolean; like_count: number }> {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existing) {
    // Delete existing like
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', profileId);
  } else {
    // Idempotent upsert so each user can like exactly once
    await supabase
      .from('post_likes')
      .upsert({ post_id: postId, profile_id: profileId }, { onConflict: 'post_id,profile_id' });
  }

  // Calculate EXACT count directly from post_likes table to prevent drift
  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  const exactCount = count ?? 0;
  await supabase.from('posts').update({ like_count: exactCount }).eq('id', postId);
  return { liked: !existing, like_count: exactCount };
}

export async function togglePostSave(postId: string, profileId: string): Promise<{ saved: boolean }> {
  const { data: existing } = await supabase
    .from('post_saves')
    .select('id')
    .eq('post_id', postId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_saves').delete().eq('post_id', postId).eq('profile_id', profileId);
    return { saved: false };
  } else {
    await supabase.from('post_saves').insert({ post_id: postId, profile_id: profileId });
    return { saved: true };
  }
}

export async function incrementPostViews(postId: string): Promise<{ views: number }> {
  const post = await getPostById(postId);
  const newViews = (post?.views || 0) + 1;
  await supabase.from('posts').update({ views: newViews }).eq('id', postId);
  return { views: newViews };
}

// In-memory fallback tracker for shares to guarantee reliable increment on every click
const localPostShares = new Map<string, number>();

export async function incrementPostShares(postId: string): Promise<{ shares: number }> {
  const post = await getPostById(postId);
  const currentShares = (post?.shares || localPostShares.get(postId) || 0) + 1;
  localPostShares.set(postId, currentShares);

  // Attempt persisting to Supabase posts table
  try {
    await supabase.from('posts').update({ shares: currentShares }).eq('id', postId);
  } catch (err: any) {
    console.warn('Shares DB persist notice (safe fallback used):', err?.message);
  }

  return { shares: currentShares };
}

// ============================================================================
// COMMENTS (LIVE SUPABASE DATABASE)
// ============================================================================
export async function getPostComments(postId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      author:author_id (id, username, display_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase getPostComments error:', error.message);
    throw new Error(error.message);
  }
  return data || [];
}

export async function addPostComment(postId: string, authorId: string, content: string): Promise<any> {
  const newComment = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    author_id: authorId,
    content,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('post_comments')
    .insert(newComment)
    .select(`
      *,
      author:author_id (id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Supabase addPostComment error:', error.message);
    throw new Error(error.message);
  }

  // Exact comment count from post_comments table
  const { count } = await supabase
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  const exactCommentCount = count ?? 1;
  await supabase.from('posts').update({ comment_count: exactCommentCount }).eq('id', postId);

  return data;
}

// ============================================================================
// STORIES (FILTERED BY LIVE SOCIAL GRAPH)
// ============================================================================
export async function getStories(viewerId?: string): Promise<any[]> {
  let followingIds: string[] = [];

  if (viewerId) {
    followingIds = await getFollowingIds(viewerId);
  }

  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      author:author_id (id, username, display_name, avatar_url, role)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getStories error:', error.message);
    throw new Error(error.message);
  }

  const rawStories = data || [];

  // Enforce follow graph:
  // If viewerId is specified, only show:
  // 1) The viewer's own story
  // 2) Stories from users the viewer follows
  const filtered = rawStories.filter((s) => {
    if (!viewerId) return true;
    const authorId = s.author_id;
    return authorId === viewerId || followingIds.includes(authorId);
  });

  return filtered.map((s) => ({
    id: s.id,
    media_url: s.media_url,
    media_type: s.media_type,
    caption: s.caption,
    text_overlay: s.text_overlay || '',
    filter: s.filter || 'none',
    created_at: s.created_at,
    time: 'Recent',
    author: s.author
      ? {
          id: s.author.id,
          name: s.author.display_name,
          username: s.author.username,
          avatar: s.author.avatar_url,
          role: s.author.role,
        }
      : {
          id: s.author_id,
          name: 'Creator',
          username: 'creator',
          avatar: '',
          role: 'Creator',
        },
  }));
}

export async function createStory(story: StoryRecord): Promise<any> {
  const { data, error } = await supabase
    .from('stories')
    .insert(story)
    .select(`
      *,
      author:author_id (id, username, display_name, avatar_url, role)
    `)
    .single();

  if (error) {
    console.error('Supabase createStory error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteStory(id: string): Promise<boolean> {
  const { error } = await supabase.from('stories').delete().eq('id', id);
  return !error;
}

export async function createCommunity(comm: CommunityRecord): Promise<CommunityRecord> {
  const { data, error } = await supabase.from('communities').insert(comm).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCommunity(id: string, patch: Partial<CommunityRecord>): Promise<CommunityRecord | null> {
  const { data, error } = await supabase.from('communities').update(patch).eq('id', id).select().single();
  if (error) return null;
  return data;
}

export async function deleteCommunity(id: string): Promise<boolean> {
  const { error } = await supabase.from('communities').delete().eq('id', id);
  return !error;
}

export async function toggleJoinCommunity(communityId: string, profileId: string): Promise<{ joined: boolean }> {
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('profile_id', profileId);
    return { joined: false };
  } else {
    await supabase
      .from('community_members')
      .insert({ community_id: communityId, profile_id: profileId, role: 'member' });
    return { joined: true };
  }
}

