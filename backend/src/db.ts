import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://urliixbjasydzyaklrzm.supabase.co';
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = rawKey && rawKey.trim() !== '' ? rawKey : 'placeholder-supabase-key';

if (!rawKey || rawKey.trim() === '') {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY not configured in backend/.env');
  console.warn('👉 Please create a .env file in backend/ with your Supabase credentials (see backend/.env.example)');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log('⚡ Connected to Supabase endpoint at:', SUPABASE_URL);

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
  hobbies?: string[];
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
  post_type?: 'field' | 'hobby' | 'ad';
  field_tag?: string;
  hobby_tag?: string;
  is_ad?: boolean;
  sponsor_name?: string;
  ad_cta_label?: string;
  ad_cta_url?: string;
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
  post_type?: 'field' | 'hobby' | 'ad';
}

export const DEFAULT_USER_HOBBIES: Record<string, string[]> = {
  Developer: ['Gaming', 'Photography', 'Sci-Fi Cinema', 'Mechanical Keyboards'],
  Editor: ['Cinema & Film', 'Music Production', 'Drone Videography', 'Photography'],
  'Content Writer': ['Literature & Books', 'Travel & Culture', 'Art & Sketching', 'Philosophy'],
  'Business Analyst': ['Fitness & Marathons', 'Chess & Strategy', 'Podcasts & Audiobooks', 'Tech Gadgets'],
};

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
  return (data || []).map((p) => ({
    ...p,
    hobbies: p.hobbies && p.hobbies.length > 0 ? p.hobbies : (DEFAULT_USER_HOBBIES[p.role] || ['Photography', 'Gaming']),
  }));
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
  if (!data) return null;
  return {
    ...data,
    hobbies: data.hobbies && data.hobbies.length > 0 ? data.hobbies : (DEFAULT_USER_HOBBIES[data.role] || ['Photography', 'Gaming']),
  };
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
// CURATED HOBBY AND SPONSORED AD POST CATALOG
// Ensures 70% Field, 20% Hobby, 10% Ads feed ratio is ALWAYS rich & active
// ============================================================================
export const CURATED_HOBBY_AND_AD_POSTS: any[] = [
  // --- FIELD REELS & POSTS (70% Target for All 4 Roles) ---
  {
    id: 'reel-writer-narrative',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'Narrative Pacing Breakdown: Hooking Readers in First 5 Seconds',
    description: 'Sentence rhythm, punctuation cadence, and tension dynamics in modern long-form essays. Why opening with a counter-intuitive premise doubles your completion rate.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Original Narrative Breakdown · @elena.writes',
    location: 'Paris, France',
    views: 31200,
    like_count: 2450,
    comment_count: 189,
    shares: 310,
    post_type: 'field',
    field_tag: 'Content Writer',
    is_ad: false,
    collaborators: ['meta:type:field', 'meta:field:Content Writer'],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
  {
    id: 'reel-writer-rituals',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'Writing Rituals: From Raw Scribbles to Polished Digital Prose',
    description: 'A look into my distraction-free mechanical keyboard setup, tactile drafting notebooks, and daily 1,000-word creative architecture.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Focus Lo-Fi Beats · @elena.writes',
    location: 'New York, NY',
    views: 26800,
    like_count: 1980,
    comment_count: 142,
    shares: 220,
    post_type: 'field',
    field_tag: 'Content Writer',
    is_ad: false,
    collaborators: ['meta:type:field', 'meta:field:Content Writer'],
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
  {
    id: 'post-writer-syntax',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'The Architecture of Modern Essays: Crafting Thought Pieces That Resonate',
    description: 'Why voice, structural syntax, and human vulnerability matter more than ever in an era saturated with generic automated copy. Deep dive into the craft of non-fiction.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Paris, France',
    views: 38200,
    like_count: 2790,
    comment_count: 210,
    shares: 340,
    post_type: 'field',
    field_tag: 'Content Writer',
    is_ad: false,
    collaborators: ['meta:type:field', 'meta:field:Content Writer'],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
  {
    id: 'reel-analyst-retention',
    author_id: 'user-analyst',
    community_id: 'comm-product',
    title: 'Creator Economy 2026: Why 70/20/10 Drives 3.4x Higher Retention',
    description: 'Quantitative cohort breakdown of transparent algorithms vs infinite black boxes. Unit economics of creator monetization pipelines.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Analytics Metric Breakdown · @khyatish.biz',
    location: 'New York, NY',
    views: 29500,
    like_count: 2150,
    comment_count: 165,
    shares: 280,
    post_type: 'field',
    field_tag: 'Business Analyst',
    is_ad: false,
    collaborators: ['meta:type:field', 'meta:field:Business Analyst'],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    profiles: {
      id: 'user-analyst',
      username: 'khyatish.biz',
      display_name: 'Khyatish Sarapaddiya',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'Business Analyst',
    },
  },
  {
    id: 'reel-dev-raymarching',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'GPU Raymarching in 60 Seconds: Signed Distance Field Magic',
    description: 'Building reactive 60FPS fluid simulations with custom GLSL fragment shaders and zero-runtime CSS in WebGL canvas.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Synthwave Code Jam · @alex.dev',
    location: 'Tokyo, Japan',
    views: 34100,
    like_count: 2890,
    comment_count: 215,
    shares: 390,
    post_type: 'field',
    field_tag: 'Developer',
    is_ad: false,
    collaborators: ['meta:type:field', 'meta:field:Developer'],
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    profiles: {
      id: 'user-dev',
      username: 'alex.dev',
      display_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
    },
  },

  // --- HOBBY POSTS (20% Target) ---
  {
    id: 'hobby-dev-gaming',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'Cyberpunk 2077 Full Raytracing & Custom Shader Breakdown',
    description: 'Spent the weekend benchmarking custom DLSS 3.7 and ReShade film LUT presets. The lighting realism in Night City rain is breathtaking.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Tokyo, Japan',
    views: 14200,
    like_count: 890,
    comment_count: 64,
    shares: 42,
    post_type: 'hobby',
    field_tag: 'Developer',
    hobby_tag: 'Gaming',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Gaming'],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    profiles: {
      id: 'user-dev',
      username: 'alex.dev',
      display_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
    },
  },
  {
    id: 'hobby-dev-photo',
    author_id: 'user-dev',
    community_id: 'comm-cinema',
    title: '35mm Street Photography in Kyoto Rain: Portra 400 Grain',
    description: 'Early morning walk through Gion. Captured natural neon light reflections on wet cobblestone alleys. Minimal editing, pure analog warmth.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Kyoto, Japan',
    views: 21800,
    like_count: 1340,
    comment_count: 98,
    shares: 76,
    post_type: 'hobby',
    field_tag: 'Developer',
    hobby_tag: 'Photography',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Photography'],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    profiles: {
      id: 'user-dev',
      username: 'alex.dev',
      display_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
    },
  },
  {
    id: 'hobby-editor-cinema',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'The Visual Poetry of Dune Part Two: Roger Deakins Silhouette Study',
    description: 'Deep dive into monochromatic warm color palettes, negative space framing, and sub-bass ambient audio immersion in 70mm IMAX.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '6 min read',
    music: '',
    location: 'Mumbai, India',
    views: 28900,
    like_count: 1720,
    comment_count: 145,
    shares: 110,
    post_type: 'hobby',
    field_tag: 'Editor',
    hobby_tag: 'Cinema & Film',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Cinema & Film'],
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    profiles: {
      id: 'user-editor',
      username: 'aarav.edits',
      display_name: 'Aarav Kapoor',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      role: 'Editor',
    },
  },
  {
    id: 'hobby-editor-music',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'Analog Modular Synthesizer Jam: Patching Ambient Textures',
    description: 'Late night patch exploration with Eurorack oscillators, bucket-brigade delay, and tape saturation for generative lo-fi melodies.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Modular Ambient Jam · @aarav.edits',
    location: 'London, UK',
    views: 19400,
    like_count: 980,
    comment_count: 82,
    shares: 55,
    post_type: 'hobby',
    field_tag: 'Editor',
    hobby_tag: 'Music Production',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Music Production'],
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    profiles: {
      id: 'user-editor',
      username: 'aarav.edits',
      display_name: 'Aarav Kapoor',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      role: 'Editor',
    },
  },
  {
    id: 'hobby-writer-books',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: '5 Visionary Sci-Fi Novels That Predicted Autonomous Creator Tools',
    description: 'Re-reading Neuromancer and Solaris with a modern lens. How classic authors foresaw the synthesis of human emotion and generative systems.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '8 min read',
    music: '',
    location: 'Paris, France',
    views: 24600,
    like_count: 1410,
    comment_count: 112,
    shares: 84,
    post_type: 'hobby',
    field_tag: 'Content Writer',
    hobby_tag: 'Literature & Books',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Literature & Books'],
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
  {
    id: 'hobby-writer-travel',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'Alpine Escapes: Trekking Dolomites Ridgelines at Dawn',
    description: 'Waking up above cloud level at 2,400m. The sheer silence of jagged limestone peaks at sunrise is unmatched for mental rejuvenation.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Dolomites, Italy',
    views: 18700,
    like_count: 1190,
    comment_count: 73,
    shares: 61,
    post_type: 'hobby',
    field_tag: 'Content Writer',
    hobby_tag: 'Travel & Culture',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Travel & Culture'],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
  {
    id: 'hobby-analyst-fitness',
    author_id: 'user-analyst',
    community_id: 'comm-product',
    title: 'Sub-3:30 Marathon Training: Weekly Mileage & Creative Recovery',
    description: 'How zone 2 endurance running resets mental clarity, prevents burnout, and sharpens analytical focus for long strategy sessions.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Berlin, Germany',
    views: 16800,
    like_count: 930,
    comment_count: 58,
    shares: 44,
    post_type: 'hobby',
    field_tag: 'Business Analyst',
    hobby_tag: 'Fitness & Marathons',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Fitness & Marathons'],
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    profiles: {
      id: 'user-analyst',
      username: 'khyatish.biz',
      display_name: 'Khyatish Sarapaddiya',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'Business Analyst',
    },
  },
  {
    id: 'hobby-analyst-chess',
    author_id: 'user-analyst',
    community_id: 'comm-product',
    title: 'Grandmaster Decision Trees: Applying Chess Principles to Product Strategy',
    description: 'Positional sacrifice, tempo control, and king safety: why calculating three moves ahead in chess mirrors high-stakes product scaling.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '7 min read',
    music: '',
    location: 'New York, NY',
    views: 22100,
    like_count: 1280,
    comment_count: 94,
    shares: 68,
    post_type: 'hobby',
    field_tag: 'Business Analyst',
    hobby_tag: 'Chess & Strategy',
    is_ad: false,
    collaborators: ['meta:type:hobby', 'meta:hobby:Chess & Strategy'],
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    profiles: {
      id: 'user-analyst',
      username: 'khyatish.biz',
      display_name: 'Khyatish Sarapaddiya',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'Business Analyst',
    },
  },

  // --- SPONSORED ADS (10% Target) ---
  {
    id: 'ad-copilot',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'GitHub Copilot Enterprise: Agentic Coding for High-Velocity Teams',
    description: 'Accelerate software delivery with context-aware AI completions, automated test drafting, and PR summaries directly in your IDE. Start your 30-day team trial today.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'San Francisco, CA',
    views: 52400,
    like_count: 2450,
    comment_count: 180,
    shares: 310,
    post_type: 'ad',
    field_tag: 'Developer',
    is_ad: true,
    sponsor_name: 'GitHub',
    ad_cta_label: 'Start Free Trial',
    ad_cta_url: 'https://github.com/features/copilot',
    collaborators: ['meta:type:ad', 'meta:ad:true', 'meta:sponsor:GitHub', 'meta:cta_label:Start Free Trial', 'meta:cta_url:https://github.com/features/copilot'],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      id: 'user-dev',
      username: 'github.official',
      display_name: 'GitHub',
      avatar_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
    },
  },
  {
    id: 'ad-resolve-studio',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'DaVinci Resolve Studio 19: Hollywood Preferred Post-Production Suite',
    description: 'Experience ultra-fast 32-bit float color grading, Fairlight spatial audio, Fusion VFX, and cutting-edge Neural Engine AI tools in a single unified workspace.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    music: 'Official Showcase · Blackmagic',
    location: 'Hollywood, CA',
    views: 68100,
    like_count: 3890,
    comment_count: 265,
    shares: 420,
    post_type: 'ad',
    field_tag: 'Editor',
    is_ad: true,
    sponsor_name: 'Blackmagic Design',
    ad_cta_label: 'Explore Studio 19',
    ad_cta_url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    collaborators: ['meta:type:ad', 'meta:ad:true', 'meta:sponsor:Blackmagic Design', 'meta:cta_label:Explore Studio 19', 'meta:cta_url:https://www.blackmagicdesign.com/products/davinciresolve'],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    profiles: {
      id: 'user-editor',
      username: 'blackmagic.cinema',
      display_name: 'Blackmagic Design',
      avatar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=160&q=80',
      role: 'Editor',
    },
  },
  {
    id: 'ad-figma-pro',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'Figma Professional: Design, Prototype & Ship at Light Speed',
    description: 'Collaborative canvas, real-time feedback loops, design system tokens, and Dev Mode code inspect. Built for high-performing product engineering teams.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '5 min read',
    music: '',
    location: 'San Francisco, CA',
    views: 47900,
    like_count: 2190,
    comment_count: 142,
    shares: 280,
    post_type: 'ad',
    field_tag: 'Developer',
    is_ad: true,
    sponsor_name: 'Figma',
    ad_cta_label: 'Try Figma Pro Free',
    ad_cta_url: 'https://www.figma.com',
    collaborators: ['meta:type:ad', 'meta:ad:true', 'meta:sponsor:Figma', 'meta:cta_label:Try Figma Pro Free', 'meta:cta_url:https://www.figma.com'],
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    profiles: {
      id: 'user-dev',
      username: 'figma.design',
      display_name: 'Figma',
      avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
    },
  },
  {
    id: 'ad-sony-fx3',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'Sony Alpha Cinema Line FX3: Unrivaled 4K 120p Full-Frame Power',
    description: 'Capture breathtaking 15+ stops of dynamic range, active internal cooling for endless takes, and dual base ISO for cinematic shadows. Upgrade your studio.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '',
    music: '',
    location: 'Tokyo, Japan',
    views: 39500,
    like_count: 1980,
    comment_count: 125,
    shares: 195,
    post_type: 'ad',
    field_tag: 'Editor',
    is_ad: true,
    sponsor_name: 'Sony Alpha',
    ad_cta_label: 'View Gear Specs',
    ad_cta_url: 'https://electronics.sony.com',
    collaborators: ['meta:type:ad', 'meta:ad:true', 'meta:sponsor:Sony Alpha', 'meta:cta_label:View Gear Specs', 'meta:cta_url:https://electronics.sony.com'],
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    profiles: {
      id: 'user-editor',
      username: 'sonyalpha',
      display_name: 'Sony Alpha',
      avatar_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=160&q=80',
      role: 'Editor',
    },
  },
  {
    id: 'ad-notion-ai',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'Notion AI: The All-in-One Connected Workspace for Modern Creators',
    description: 'Draft essays, organize research docs, track editorial sprints, and query knowledge bases with an integrated AI copilot. Join millions of thinkers.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'],
    poster_url: null,
    duration: '6 min read',
    music: '',
    location: 'New York, NY',
    views: 43200,
    like_count: 2040,
    comment_count: 138,
    shares: 215,
    post_type: 'ad',
    field_tag: 'Content Writer',
    is_ad: true,
    sponsor_name: 'Notion',
    ad_cta_label: 'Get Started Free',
    ad_cta_url: 'https://www.notion.so',
    collaborators: ['meta:type:ad', 'meta:ad:true', 'meta:sponsor:Notion', 'meta:cta_label:Get Started Free', 'meta:cta_url:https://www.notion.so'],
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    profiles: {
      id: 'user-writer',
      username: 'notionhq',
      display_name: 'Notion',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
    },
  },
];

/**
 * Normalizes and extracts classification metadata (field, hobby, ad) from post properties and tags
 */
export function enrichPostClassification(post: any): any {
  let postType = post.post_type;
  let fieldTag = post.field_tag || '';
  let hobbyTag = post.hobby_tag || '';
  let isAd = post.is_ad ?? false;
  let sponsorName = post.sponsor_name || '';
  let adCtaLabel = post.ad_cta_label || '';
  let adCtaUrl = post.ad_cta_url || '';

  // Extract metadata embedded in collaborators tags e.g. "meta:type:hobby", "meta:hobby:Gaming", etc.
  if (Array.isArray(post.collaborators)) {
    for (const item of post.collaborators) {
      if (typeof item === 'string') {
        if (item.startsWith('meta:type:')) postType = item.replace('meta:type:', '');
        else if (item.startsWith('meta:field:')) fieldTag = item.replace('meta:field:', '');
        else if (item.startsWith('meta:hobby:')) hobbyTag = item.replace('meta:hobby:', '');
        else if (item === 'meta:ad:true') isAd = true;
        else if (item.startsWith('meta:sponsor:')) sponsorName = item.replace('meta:sponsor:', '');
        else if (item.startsWith('meta:cta_label:')) adCtaLabel = item.replace('meta:cta_label:', '');
        else if (item.startsWith('meta:cta_url:')) adCtaUrl = item.replace('meta:cta_url:', '');
      }
    }
  }

  // Infer if not explicitly tagged
  if (!postType) {
    if (isAd || post.title?.toLowerCase().includes('sponsor') || post.title?.toLowerCase().includes('ad:')) {
      postType = 'ad';
      isAd = true;
    } else if (
      hobbyTag ||
      /\b(gaming|cyberpunk|photo|photography|film camera|leica|synth|music|foley|marathon|fitness|reading|novel|travel|kyoto|sketch|art|chess)\b/i.test(post.title + ' ' + post.description)
    ) {
      postType = 'hobby';
      if (!hobbyTag) {
        if (/gaming|cyberpunk/i.test(post.title)) hobbyTag = 'Gaming';
        else if (/photo|leica|camera/i.test(post.title)) hobbyTag = 'Photography';
        else if (/synth|music|lo-fi/i.test(post.title)) hobbyTag = 'Music Production';
        else if (/marathon|fitness|mobility/i.test(post.title)) hobbyTag = 'Fitness & Marathons';
        else if (/reading|novel|book/i.test(post.title)) hobbyTag = 'Literature & Books';
        else if (/travel|kyoto|alpine/i.test(post.title)) hobbyTag = 'Travel & Culture';
        else if (/chess/i.test(post.title)) hobbyTag = 'Chess & Strategy';
        else hobbyTag = 'Creative Passion';
      }
    } else {
      postType = 'field';
      fieldTag = fieldTag || post.profiles?.role || 'Developer';
    }
  }

  if (postType === 'ad') {
    isAd = true;
    if (!sponsorName) sponsorName = 'Featured Partner';
    if (!adCtaLabel) adCtaLabel = 'Learn More';
    if (!adCtaUrl) adCtaUrl = 'https://amerigam.com';
  }

  return {
    ...post,
    post_type: postType,
    field_tag: fieldTag,
    hobby_tag: hobbyTag,
    is_ad: isAd,
    sponsor_name: sponsorName,
    ad_cta_label: adCtaLabel,
    ad_cta_url: adCtaUrl,
  };
}

/**
 * CORE FEED ALGORITHM:
 * Interleaves posts to deliver exactly:
 * - 70% from the user's active Field / Profession (e.g. Developer, Editor, etc.)
 * - 20% from the user's Hobbies / Passions (e.g. Gaming, Photography, Cinema, etc.)
 * - 10% Sponsored Ads / Brand Partners
 *
 * Sequence in repeating blocks of 10 items:
 * [Field_1, Field_2, Hobby_1, Field_3, Field_4, Field_5, Ad_1, Field_6, Hobby_2, Field_7]
 * Slots 0,1,3,4,5,7,9 = 7 items = 70% Field
 * Slots 2,8           = 2 items = 20% Hobby
 * Slot 6              = 1 item  = 10% Ad
 */
export function applyFeedDistributionRatio(
  candidatePosts: any[],
  viewerRole: string,
  viewerHobbies: string[],
  options?: { limit?: number; offset?: number }
): any[] {
  const fieldPool: any[] = [];
  const otherRolePool: any[] = [];
  const hobbyPool: any[] = [];
  const adPool: any[] = [];

  const lowerHobbies = (viewerHobbies || []).map((h) => h.toLowerCase());

  for (const post of candidatePosts) {
    if (post.is_ad || post.post_type === 'ad') {
      adPool.push(post);
    } else if (post.post_type === 'hobby') {
      hobbyPool.push(post);
    } else if (post.post_type === 'field' || post.profiles?.role) {
      if (post.field_tag === viewerRole || post.profiles?.role === viewerRole) {
        fieldPool.push(post);
      } else {
        otherRolePool.push(post);
      }
    } else {
      otherRolePool.push(post);
    }
  }

  // Sort hobbyPool so posts matching viewer's specific hobbies appear first
  hobbyPool.sort((a, b) => {
    const aMatch = lowerHobbies.some((h) => (a.hobby_tag || '').toLowerCase().includes(h) || a.title.toLowerCase().includes(h)) ? 1 : 0;
    const bMatch = lowerHobbies.some((h) => (b.hobby_tag || '').toLowerCase().includes(h) || b.title.toLowerCase().includes(h)) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Candidate pool for the 70% Field portion:
  // Starts with viewer's direct field posts; if more are needed, backfills from peer professional fields
  const allFieldCandidates = [...fieldPool, ...otherRolePool];

  const interleaved: any[] = [];
  const targetCount = Math.max(candidatePosts.length, (options?.limit || 50) + (options?.offset || 0), 30);

  let fieldIdx = 0;
  let hobbyIdx = 0;
  let adIdx = 0;

  for (let i = 0; i < targetCount; i++) {
    const slotInTen = i % 10;
    let chosen: any = null;

    if (slotInTen === 2 || slotInTen === 8) {
      // 20% Hobby slot
      if (hobbyPool.length > 0) {
        chosen = hobbyPool[hobbyIdx % hobbyPool.length];
        hobbyIdx++;
      }
    } else if (slotInTen === 6) {
      // 10% Ad slot
      if (adPool.length > 0) {
        chosen = adPool[adIdx % adPool.length];
        adIdx++;
      }
    }

    // Default or 70% Field slot (slots 0, 1, 3, 4, 5, 7, 9)
    if (!chosen) {
      if (allFieldCandidates.length > 0) {
        chosen = allFieldCandidates[fieldIdx % allFieldCandidates.length];
        fieldIdx++;
      } else if (hobbyPool.length > 0) {
        chosen = hobbyPool[hobbyIdx++ % hobbyPool.length];
      } else if (adPool.length > 0) {
        chosen = adPool[adIdx++ % adPool.length];
      }
    }

    if (chosen) {
      interleaved.push(chosen);
    }
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  return interleaved.slice(offset, offset + limit);
}

// ============================================================================
// POSTS, REELS & BLOGS (LIVE SUPABASE DATABASE WITH 70/20/10 FEED BALANCING)
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

  // For for_you feed or general home stream, fetch broader set to balance ratios
  const isForYouOrGeneralFeed = !filters?.feed_type || filters.feed_type === 'for_you';

  if (!isForYouOrGeneralFeed) {
    if (filters?.offset !== undefined && filters.offset > 0) {
      const limit = filters?.limit || 50;
      query = query.range(filters.offset, filters.offset + limit - 1);
    } else if (filters?.limit) {
      query = query.limit(filters.limit);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getPosts error:', error.message);
    throw new Error(error.message);
  }

  const dbPosts = data || [];

  // Merge DB posts with curated hobby and ad posts (deduplicating by ID)
  const existingIds = new Set(dbPosts.map((p) => p.id));
  const mergedCandidatePosts = [...dbPosts];
  for (const item of CURATED_HOBBY_AND_AD_POSTS) {
    if (!existingIds.has(item.id)) {
      if (!filters?.kind || item.kind === filters.kind) {
        mergedCandidatePosts.push(item);
      }
    }
  }

  // Enrich each post with classification properties
  let enrichedPosts = mergedCandidatePosts.map(enrichPostClassification);

  // If specific post_type was explicitly requested (e.g. ?post_type=hobby, ?post_type=ad, ?post_type=field)
  if (filters?.post_type) {
    enrichedPosts = enrichedPosts.filter((p) => p.post_type === filters.post_type);
  } else if (isForYouOrGeneralFeed) {
    // === 70% Field, 20% Hobby, 10% Ads Algorithm ===
    const viewerProfile = filters?.viewer_id ? await getProfileById(filters.viewer_id) : null;
    const viewerRole = viewerProfile?.role || 'Developer';
    const viewerHobbies = viewerProfile?.hobbies || DEFAULT_USER_HOBBIES[viewerRole] || [];

    enrichedPosts = applyFeedDistributionRatio(
      enrichedPosts,
      viewerRole,
      viewerHobbies,
      { limit: filters?.limit || 50, offset: filters?.offset || 0 }
    );
  }

  // Attach liked and saved flags for viewer
  if (filters?.viewer_id && enrichedPosts.length > 0) {
    const postIds = enrichedPosts.map((p) => p.id);
    const [likesRes, savesRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('profile_id', filters.viewer_id).in('post_id', postIds),
      supabase.from('post_saves').select('post_id').eq('profile_id', filters.viewer_id).in('post_id', postIds),
    ]);

    const likedSet = new Set((likesRes.data || []).map((l) => l.post_id));
    const savedSet = new Set((savesRes.data || []).map((s) => s.post_id));

    enrichedPosts = enrichedPosts.map((p) => ({
      ...p,
      shares: p.shares ?? localPostShares.get(p.id) ?? 0,
      liked: likedSet.has(p.id),
      saved: savedSet.has(p.id),
    }));
  } else {
    enrichedPosts = enrichedPosts.map((p) => ({
      ...p,
      shares: p.shares ?? localPostShares.get(p.id) ?? 0,
    }));
  }

  return enrichedPosts;
}

export async function getPostById(id: string, viewerId?: string): Promise<any | null> {
  const curated = CURATED_HOBBY_AND_AD_POSTS.find((p) => p.id === id);
  if (curated) {
    return enrichPostClassification({
      ...curated,
      shares: curated.shares ?? localPostShares.get(id) ?? 0,
      liked: false,
      saved: false,
    });
  }

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
    ...enrichPostClassification(post),
    shares: post.shares ?? localPostShares.get(id) ?? 0,
    liked,
    saved,
  };
}

export async function createPost(post: PostRecord): Promise<any> {
  const metaTags: string[] = [];
  if (post.post_type) metaTags.push(`meta:type:${post.post_type}`);
  if (post.field_tag) metaTags.push(`meta:field:${post.field_tag}`);
  if (post.hobby_tag) metaTags.push(`meta:hobby:${post.hobby_tag}`);
  if (post.is_ad) metaTags.push(`meta:ad:true`);
  if (post.sponsor_name) metaTags.push(`meta:sponsor:${post.sponsor_name}`);
  if (post.ad_cta_label) metaTags.push(`meta:cta_label:${post.ad_cta_label}`);
  if (post.ad_cta_url) metaTags.push(`meta:cta_url:${post.ad_cta_url}`);

  const enrichedCollaborators = [
    ...(post.collaborators || []).filter((c) => !c.startsWith('meta:')),
    ...metaTags,
  ];

  const payload: any = {
    ...post,
    collaborators: enrichedCollaborators,
  };

  // Attempt standard insert
  let res = await supabase
    .from('posts')
    .insert(payload)
    .select(`
      *,
      profiles:author_id (*),
      communities:community_id (*)
    `)
    .single();

  // If table does not have the new columns yet, sanitize and retry with standard columns
  if (res.error && res.error.message.includes('column')) {
    const sanitized: any = { ...payload };
    delete sanitized.post_type;
    delete sanitized.field_tag;
    delete sanitized.hobby_tag;
    delete sanitized.is_ad;
    delete sanitized.sponsor_name;
    delete sanitized.ad_cta_label;
    delete sanitized.ad_cta_url;

    res = await supabase
      .from('posts')
      .insert(sanitized)
      .select(`
        *,
        profiles:author_id (*),
        communities:community_id (*)
      `)
      .single();
  }

  if (res.error) {
    console.error('Supabase createPost error:', res.error.message);
    throw new Error(res.error.message);
  }
  return enrichPostClassification(res.data);
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

