import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_KEY) &&
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_KEY.includes('your-anon-key');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

if (isSupabaseConfigured) {
  console.log('⚡ Supabase Client initialized with URL:', SUPABASE_URL);
} else {
  console.log('ℹ️ Supabase credentials not provided in .env yet. Running with high-performance in-memory persistence.');
}

// ============================================================================
// IN-MEMORY FALLBACK STORE (Pre-seeded with real data)
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

// Initial Memory Store
let memoryProfiles: ProfileRecord[] = [
  {
    id: 'user-dev',
    username: 'alex.dev',
    display_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    role: 'Developer',
    bio: 'Full-Stack Architect & WebGL Engine Developer. Building high-performance UI systems, reactive state pipelines & decentralized protocols.',
    rank: '#3',
    points: '4,820 AP',
    rating: '4.9',
    skills: ['TypeScript', 'React', 'WebGL', 'Vite', 'GraphQL', 'Rust'],
    theme_color: '#00a8ed',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'user-editor',
    username: 'aarav.edits',
    display_name: 'Aarav Kapoor',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    role: 'Editor',
    bio: 'Lead Colorist & Senior Film Editor. DaVinci Resolve certified. Exploring analog print emulation, HDR grading and cinematic rhythm cuts.',
    rank: '#1',
    points: '8,940 AP',
    rating: '5.0',
    skills: ['DaVinci Resolve', 'Color Grading', 'Premiere Pro', 'Sound Design', 'Film Print'],
    theme_color: '#f43f5e',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'user-writer',
    username: 'elena.writes',
    display_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    role: 'Content Writer',
    bio: 'Cultural Essayist, Tech Storyteller & Narrative Director. Deep dives on creative philosophy, cinema essays and digital craftsmanship.',
    rank: '#5',
    points: '6,310 AP',
    rating: '4.9',
    skills: ['Narrative Essays', 'Long-form Journalism', 'Creative Direction', 'Copywriting', 'SEO & Strategy'],
    theme_color: '#10b981',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'user-analyst',
    username: 'khyatish.biz',
    display_name: 'Khyatish Sarapaddiya',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    role: 'Business Analyst',
    bio: 'Strategic Product & Market Analyst. Quantitative modeling, creator economy metrics, retention funnels & monetization pipelines.',
    rank: '#2',
    points: '7,150 AP',
    rating: '4.8',
    skills: ['Market Analytics', 'Cohort Modeling', 'SQL & BI', 'Retention Funnels', 'Product Economics'],
    theme_color: '#f59e0b',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

let memoryFollows: FollowRecord[] = [
  { follower_id: 'user-dev', following_id: 'user-editor', created_at: new Date().toISOString() },
  { follower_id: 'user-dev', following_id: 'user-writer', created_at: new Date().toISOString() },
  { follower_id: 'user-editor', following_id: 'user-dev', created_at: new Date().toISOString() },
  { follower_id: 'user-editor', following_id: 'user-writer', created_at: new Date().toISOString() },
  { follower_id: 'user-writer', following_id: 'user-analyst', created_at: new Date().toISOString() },
  { follower_id: 'user-analyst', following_id: 'user-dev', created_at: new Date().toISOString() },
];

let memoryCommunities: CommunityRecord[] = [
  {
    id: 'comm-dev',
    name: 'Developers & System Architects',
    handle: '@devs.guild',
    category: 'Engineering & Code',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    members_count: '38.2k members',
    member_count_num: 38200,
    description: 'Collaborative hub for full-stack developers, frontend innovators, AI engineers, and open-source contributors sharing code architectures.',
    tags: ['React', 'Next.js', 'Vite', 'TypeScript', 'WebGL', 'Algorithms'],
    featured_post_title: 'Zero-runtime CSS vs Vanilla styling in modern reactive web apps',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'comm-cinema',
    name: 'Cinema & Video Editors Guild',
    handle: '@cinema.crafters',
    category: 'Film & Post-Production',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    members_count: '24.6k members',
    member_count_num: 24600,
    description: 'The premier community for colorists, post-production supervisors, motion designers, and sound artists crafting moving images.',
    tags: ['DaVinci Resolve', 'Color Grading', 'Sound Mix', 'Premiere Pro', '4K Cinema'],
    featured_post_title: 'Cinematic 2.39:1 film crop with custom Kodak 2383 LUT breakdown',
    created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
  },
  {
    id: 'comm-writers',
    name: 'Writers, Storytellers & Essayists',
    handle: '@writers.hub',
    category: 'Literature & Editorial',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    members_count: '19.4k members',
    member_count_num: 19400,
    description: 'Dedicated space for creative non-fiction, thought pieces, industry journalism, narrative analysis, and long-form storytelling.',
    tags: ['Storytelling', 'Essays', 'Blogging', 'Critique', 'Publishing'],
    featured_post_title: 'Why human storytelling matters in the age of generative text',
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
  {
    id: 'comm-product',
    name: 'Product & Business Analytics Hub',
    handle: '@analysts.space',
    category: 'Analytics & Strategy',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    members_count: '15.8k members',
    member_count_num: 15800,
    description: 'Metrics, retention curves, creator economy unit economics, and data-driven scaling for modern digital products.',
    tags: ['Cohort Analysis', 'LTV & CAC', 'Market Research', 'Data Science', 'Growth'],
    featured_post_title: 'Creator economy monetization models: Subscription vs Ad split benchmarks',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

let memoryCommunityMembers: { community_id: string; profile_id: string }[] = [
  { community_id: 'comm-dev', profile_id: 'user-dev' },
  { community_id: 'comm-cinema', profile_id: 'user-dev' },
  { community_id: 'comm-product', profile_id: 'user-dev' },
  { community_id: 'comm-cinema', profile_id: 'user-editor' },
  { community_id: 'comm-writers', profile_id: 'user-editor' },
  { community_id: 'comm-writers', profile_id: 'user-writer' },
  { community_id: 'comm-product', profile_id: 'user-writer' },
  { community_id: 'comm-dev', profile_id: 'user-writer' },
  { community_id: 'comm-product', profile_id: 'user-analyst' },
  { community_id: 'comm-dev', profile_id: 'user-analyst' },
];

let memoryPosts: PostRecord[] = [
  {
    id: 'post-dev-1',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'Architecting 60FPS UI Animations with WebGL and React',
    description: 'Breakdown of zero-overhead canvas layers rendering real-time particles with Framer Motion integration. Full GitHub source included in repository.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'],
    location: 'Tokyo, Japan',
    views: 18400,
    like_count: 730,
    comment_count: 82,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'post-dev-2',
    author_id: 'user-dev',
    community_id: 'comm-dev',
    title: 'Vite Plugin Architecture & Bundler Optimization Deep-Dive',
    description: 'Why switching our build toolchain reduced cold start times by 78% across 400+ module imports.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
    location: 'San Francisco, CA',
    views: 12200,
    like_count: 512,
    comment_count: 39,
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: 'post-editor-1',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'The Colour Grading Process: Kodak 2383 Film Emulation',
    description: 'Cinematic node tree breakdown in DaVinci Resolve. Balancing sub-black roll-off, halation layers, and split-toning in shadow regions.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4'],
    poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    duration: '0:32',
    music: 'Original Sound · @aarav.edits',
    location: 'Mumbai, India',
    views: 31400,
    like_count: 1480,
    comment_count: 135,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'post-editor-2',
    author_id: 'user-editor',
    community_id: 'comm-cinema',
    title: 'Sound Design & Foley Workflow on Indie Commercial Sets',
    description: 'Layering low-frequency ambient rumble with directional audio cues to create immediate visceral tension in 30-second trailers.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'],
    location: 'London, UK',
    views: 19800,
    like_count: 940,
    comment_count: 67,
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'post-writer-1',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'The Architecture of Modern Essays: Crafting Unforgettable Openings',
    description: 'An exhaustive essay on hook design, rhythmic cadence, sentence modulation, and emotional resonance in digital essays.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
    location: 'Paris, France',
    views: 22400,
    like_count: 1120,
    comment_count: 94,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'post-writer-2',
    author_id: 'user-writer',
    community_id: 'comm-writers',
    title: 'Blogging vs Micro-Content: Why Audience Attention is Polarizing',
    description: 'Observations across 50,000 readers: Why audiences either want 30-second reels or 2,500-word deep dives.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'],
    location: 'Berlin, Germany',
    views: 16700,
    like_count: 830,
    comment_count: 72,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'post-analyst-1',
    author_id: 'user-analyst',
    community_id: 'comm-product',
    title: 'Creator Economy 2026: Cohort Retention & Monetization Playbook',
    description: 'Analyzing LTV to CAC ratios, churn velocity, and tipping mechanics across top 100 creator collectives on Amerigam.',
    kind: 'blog',
    media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
    location: 'New York, NY',
    views: 26800,
    like_count: 1350,
    comment_count: 110,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'post-analyst-2',
    author_id: 'user-analyst',
    community_id: 'comm-product',
    title: 'Community Network Effects: A Quantitative Modeling Approach',
    description: 'How organic peer recommendations lower customer acquisition costs by 4.2x in specialized vertical communities.',
    kind: 'post',
    media_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'],
    location: 'Singapore',
    views: 14100,
    like_count: 670,
    comment_count: 45,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

let memoryStories: StoryRecord[] = [
  {
    id: 'story-aarav',
    author_id: 'user-editor',
    media_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Grading the new indie documentary sequence ✨',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 3600000).toISOString(),
  },
  {
    id: 'story-elena',
    author_id: 'user-writer',
    media_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Watercolor pigments and creative essays.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 3600000).toISOString(),
  },
  {
    id: 'story-alex',
    author_id: 'user-dev',
    media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Midnight neon vibes & WebGL testing.',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 3600000).toISOString(),
  },
  {
    id: 'story-khyatish',
    author_id: 'user-analyst',
    media_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Creator economy benchmark metrics review.',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    expires_at: new Date(Date.now() + 18 * 3600000).toISOString(),
  },
];

let memoryLikes: { post_id: string; profile_id: string }[] = [];
let memorySaves: { post_id: string; profile_id: string }[] = [
  { post_id: 'post-editor-1', profile_id: 'user-dev' },
  { post_id: 'post-writer-1', profile_id: 'user-dev' },
];
let memoryComments: CommentRecord[] = [
  {
    id: 'comment-1',
    post_id: 'post-editor-1',
    author_id: 'user-dev',
    content: 'The shadow rolloff on this Kodak emulation is sublime! Are you doing this in ACES or DWG?',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'comment-2',
    post_id: 'post-editor-1',
    author_id: 'user-writer',
    content: 'The texture feels tactile and organic. Inspiring work Aarav!',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'comment-3',
    post_id: 'post-dev-1',
    author_id: 'user-analyst',
    content: 'Can confirm WebGL canvas acceleration cut down GPU load by 40% on mobile tests.',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: 'comment-4',
    post_id: 'post-writer-1',
    author_id: 'user-editor',
    content: 'The rhythm in paragraph transitions is something editors look for in visual pacing as well. Brilliant essay!',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
];

// ============================================================================
// DATA ACCESS LAYER FUNCTIONS (With Supabase delegation & Memory Fallback)
// ============================================================================

// PROFILES
export async function getProfiles(): Promise<ProfileRecord[]> {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return memoryProfiles;
}

export async function getProfileById(id: string): Promise<ProfileRecord | null> {
  if (supabase) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) return data;
  }
  return memoryProfiles.find((p) => p.id === id) || null;
}

export async function updateProfile(id: string, updates: Partial<ProfileRecord>): Promise<ProfileRecord | null> {
  if (supabase) {
    const { data } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (data) return data;
  }
  const idx = memoryProfiles.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryProfiles[idx] = { ...memoryProfiles[idx], ...updates };
    return memoryProfiles[idx];
  }
  return null;
}

// FOLLOWS
export async function getFollowingIds(followerId: string): Promise<string[]> {
  if (supabase) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', followerId);
    if (data) return data.map((d) => d.following_id);
  }
  return memoryFollows.filter((f) => f.follower_id === followerId).map((f) => f.following_id);
}

export async function toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
  if (followerId === followingId) {
    return { following: false };
  }
  if (supabase) {
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existing) {
      await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
      return { following: false };
    } else {
      await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
      return { following: true };
    }
  }

  const idx = memoryFollows.findIndex((f) => f.follower_id === followerId && f.following_id === followingId);
  if (idx >= 0) {
    memoryFollows.splice(idx, 1);
    return { following: false };
  } else {
    memoryFollows.push({ follower_id: followerId, following_id: followingId, created_at: new Date().toISOString() });
    return { following: true };
  }
}

export interface CommunityQueryOptions {
  category?: string;
  q?: string;
  viewer_id?: string;
}

export async function getJoinedCommunityIds(profileId: string): Promise<string[]> {
  if (supabase) {
    const { data } = await supabase.from('community_members').select('community_id').eq('profile_id', profileId);
    if (data) return data.map((d) => d.community_id);
  }
  return memoryCommunityMembers.filter((m) => m.profile_id === profileId).map((m) => m.community_id);
}

export async function getCommunities(options: CommunityQueryOptions = {}): Promise<any[]> {
  const { category, q, viewer_id } = options;
  let list: CommunityRecord[] = [];

  if (supabase) {
    let query = supabase.from('communities').select('*').order('member_count_num', { ascending: false });
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (q) {
      query = query.or(`name.ilike.%${q}%,handle.ilike.%${q}%,description.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (!error && data) {
      list = data;
    } else {
      list = [...memoryCommunities];
    }
  } else {
    list = [...memoryCommunities];
  }

  if (category && category !== 'All') {
    list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    const qLower = q.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(qLower) ||
        c.handle.toLowerCase().includes(qLower) ||
        c.description.toLowerCase().includes(qLower) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(qLower)))
    );
  }

  let joinedIds: string[] = [];
  if (viewer_id) {
    joinedIds = await getJoinedCommunityIds(viewer_id);
  }

  return list.map((c) => ({
    ...c,
    joined: viewer_id ? joinedIds.includes(c.id) : false,
  }));
}

export async function getCommunityById(id: string): Promise<CommunityRecord | null> {
  if (supabase) {
    const { data } = await supabase.from('communities').select('*').eq('id', id).single();
    if (data) return data;
  }
  return memoryCommunities.find((c) => c.id === id) || null;
}

export async function createCommunity(comm: CommunityRecord): Promise<CommunityRecord> {
  if (supabase) {
    const { data } = await supabase.from('communities').insert(comm).select().single();
    if (data) return data;
  }
  memoryCommunities.unshift(comm);
  return comm;
}

export async function updateCommunity(id: string, updates: Partial<CommunityRecord>): Promise<CommunityRecord | null> {
  if (supabase) {
    const { data } = await supabase.from('communities').update(updates).eq('id', id).select().single();
    if (data) return data;
  }
  const idx = memoryCommunities.findIndex((c) => c.id === id);
  if (idx >= 0) {
    memoryCommunities[idx] = { ...memoryCommunities[idx], ...updates };
    return memoryCommunities[idx];
  }
  return null;
}

export async function deleteCommunity(id: string): Promise<boolean> {
  if (supabase) {
    await supabase.from('communities').delete().eq('id', id);
    return true;
  }
  const idx = memoryCommunities.findIndex((c) => c.id === id);
  if (idx >= 0) {
    memoryCommunities.splice(idx, 1);
    return true;
  }
  return false;
}

export async function toggleJoinCommunity(communityId: string, profileId: string): Promise<{ joined: boolean }> {
  if (supabase) {
    const { data: existing } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (existing) {
      await supabase.from('community_members').delete().eq('community_id', communityId).eq('profile_id', profileId);
      return { joined: false };
    } else {
      await supabase.from('community_members').insert({ community_id: communityId, profile_id: profileId });
      return { joined: true };
    }
  }

  const idx = memoryCommunityMembers.findIndex((m) => m.community_id === communityId && m.profile_id === profileId);
  if (idx >= 0) {
    memoryCommunityMembers.splice(idx, 1);
    return { joined: false };
  } else {
    memoryCommunityMembers.push({ community_id: communityId, profile_id: profileId });
    return { joined: true };
  }
}

// POSTS / REELS / BLOGS
export interface PostQueryOptions {
  kind?: 'post' | 'reel' | 'blog';
  community_id?: string;
  author_id?: string;
  q?: string;
  feed_type?: 'for_you' | 'communities' | 'network';
  viewer_id?: string;
  limit?: number;
  offset?: number;
}

export async function getPosts(options: PostQueryOptions = {}): Promise<any[]> {
  const { kind, community_id, author_id, q, feed_type, viewer_id, limit = 50, offset = 0 } = options;

  let baseList: PostRecord[] = [];

  if (supabase) {
    let query = supabase.from('posts').select(`
      *,
      profiles:author_id (id, username, display_name, avatar_url, role)
    `).order('created_at', { ascending: false });

    if (kind) query = query.eq('kind', kind);
    if (community_id) query = query.eq('community_id', community_id);
    if (author_id) query = query.eq('author_id', author_id);
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);
    if (!error && data) {
      return data;
    }
  }

  // Fallback to Memory
  baseList = [...memoryPosts];

  if (kind) {
    baseList = baseList.filter((p) => p.kind === kind);
  }
  if (community_id) {
    baseList = baseList.filter((p) => p.community_id === community_id);
  }
  if (author_id) {
    baseList = baseList.filter((p) => p.author_id === author_id);
  }
  if (q) {
    const qLower = q.toLowerCase();
    baseList = baseList.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        (p.location && p.location.toLowerCase().includes(qLower))
    );
  }

  if (feed_type === 'communities' && viewer_id) {
    // Show posts from communities joined by viewer
    const joinedCommIds = memoryCommunityMembers
      .filter((m) => m.profile_id === viewer_id)
      .map((m) => m.community_id);
    baseList = baseList.filter((p) => p.community_id && joinedCommIds.includes(p.community_id));
  } else if (feed_type === 'network' && viewer_id) {
    // Show posts from users followed by viewer
    const followingIds = memoryFollows
      .filter((f) => f.follower_id === viewer_id)
      .map((f) => f.following_id);
    baseList = baseList.filter((p) => followingIds.includes(p.author_id));
  }

  const sliced = baseList.slice(offset, offset + limit);

  // Attach profile objects
  return sliced.map((p) => {
    const profile = memoryProfiles.find((prof) => prof.id === p.author_id);
    const isLiked = viewer_id ? memoryLikes.some((l) => l.post_id === p.id && l.profile_id === viewer_id) : false;
    const isSaved = viewer_id ? memorySaves.some((s) => s.post_id === p.id && s.profile_id === viewer_id) : false;
    return {
      ...p,
      profiles: profile
        ? {
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            role: profile.role,
          }
        : {
            id: p.author_id,
            username: 'creator',
            display_name: 'Creator',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
            role: 'Creator',
          },
      liked: isLiked,
      saved: isSaved,
    };
  });
}

export async function getPostById(id: string, viewerId?: string): Promise<any | null> {
  if (supabase) {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (id, username, display_name, avatar_url, role)
      `)
      .eq('id', id)
      .single();
    if (data) return data;
  }

  const found = memoryPosts.find((p) => p.id === id);
  if (!found) return null;
  const profile = memoryProfiles.find((prof) => prof.id === found.author_id);
  const isLiked = viewerId ? memoryLikes.some((l) => l.post_id === id && l.profile_id === viewerId) : false;
  const isSaved = viewerId ? memorySaves.some((s) => s.post_id === id && s.profile_id === viewerId) : false;
  return {
    ...found,
    profiles: profile || {
      id: found.author_id,
      username: 'creator',
      display_name: 'Creator',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Creator',
    },
    liked: isLiked,
    saved: isSaved,
  };
}

export async function createPost(post: PostRecord): Promise<PostRecord> {
  if (supabase) {
    const { data, error } = await supabase.from('posts').insert(post).select().single();
    if (!error && data) return data;
  }
  memoryPosts.unshift(post);
  return post;
}

export async function updatePost(id: string, updates: Partial<PostRecord>): Promise<PostRecord | null> {
  if (supabase) {
    const { data } = await supabase.from('posts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (data) return data;
  }
  const idx = memoryPosts.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryPosts[idx] = { ...memoryPosts[idx], ...updates, updated_at: new Date().toISOString() };
    return memoryPosts[idx];
  }
  return null;
}

export async function deletePost(id: string): Promise<boolean> {
  if (supabase) {
    await supabase.from('posts').delete().eq('id', id);
    return true;
  }
  const idx = memoryPosts.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryPosts.splice(idx, 1);
    return true;
  }
  return false;
}

export async function togglePostLike(postId: string, profileId: string): Promise<{ liked: boolean; like_count: number }> {
  if (supabase) {
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (existing) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', profileId);
      const post = await getPostById(postId);
      const newCount = Math.max(0, (post?.like_count || 1) - 1);
      await supabase.from('posts').update({ like_count: newCount }).eq('id', postId);
      return { liked: false, like_count: newCount };
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, profile_id: profileId });
      const post = await getPostById(postId);
      const newCount = (post?.like_count || 0) + 1;
      await supabase.from('posts').update({ like_count: newCount }).eq('id', postId);
      return { liked: true, like_count: newCount };
    }
  }

  const idx = memoryLikes.findIndex((l) => l.post_id === postId && l.profile_id === profileId);
  const post = memoryPosts.find((p) => p.id === postId);
  if (!post) return { liked: false, like_count: 0 };

  if (idx >= 0) {
    memoryLikes.splice(idx, 1);
    post.like_count = Math.max(0, post.like_count - 1);
    return { liked: false, like_count: post.like_count };
  } else {
    memoryLikes.push({ post_id: postId, profile_id: profileId });
    post.like_count = (post.like_count || 0) + 1;
    return { liked: true, like_count: post.like_count };
  }
}

export async function togglePostSave(postId: string, profileId: string): Promise<{ saved: boolean }> {
  if (supabase) {
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

  const idx = memorySaves.findIndex((s) => s.post_id === postId && s.profile_id === profileId);
  if (idx >= 0) {
    memorySaves.splice(idx, 1);
    return { saved: false };
  } else {
    memorySaves.push({ post_id: postId, profile_id: profileId });
    return { saved: true };
  }
}

export async function incrementPostViews(postId: string): Promise<{ views: number }> {
  if (supabase) {
    const post = await getPostById(postId);
    const newViews = (post?.views || 0) + 1;
    await supabase.from('posts').update({ views: newViews }).eq('id', postId);
    return { views: newViews };
  }

  const post = memoryPosts.find((p) => p.id === postId);
  if (post) {
    post.views = (post.views || 0) + 1;
    return { views: post.views };
  }
  return { views: 1 };
}

// COMMENTS
export async function getPostComments(postId: string): Promise<any[]> {
  if (supabase) {
    const { data } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:author_id (id, username, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) return data;
  }

  return memoryComments
    .filter((c) => c.post_id === postId)
    .map((c) => {
      const author = memoryProfiles.find((p) => p.id === c.author_id);
      return {
        ...c,
        author: author || { id: c.author_id, display_name: 'User', avatar_url: '' },
      };
    });
}

export async function addPostComment(postId: string, authorId: string, content: string): Promise<any> {
  const newComment: CommentRecord = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    author_id: authorId,
    content,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data } = await supabase.from('post_comments').insert(newComment).select().single();
    if (data) return data;
  }

  memoryComments.push(newComment);
  const post = memoryPosts.find((p) => p.id === postId);
  if (post) post.comment_count = (post.comment_count || 0) + 1;
  return newComment;
}

// ============================================================================
// STORIES (FILTERED BY FOLLOWING GRAPH: Non-followed stories are strictly hidden!)
// ============================================================================
export async function getStories(viewerId?: string): Promise<any[]> {
  let followingIds: string[] = [];

  if (viewerId) {
    followingIds = await getFollowingIds(viewerId);
  }

  let rawStories: StoryRecord[] = [];

  if (supabase) {
    const { data } = await supabase
      .from('stories')
      .select(`
        *,
        author:author_id (id, username, display_name, avatar_url, role)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      rawStories = data;
    }
  } else {
    const now = new Date().toISOString();
    rawStories = memoryStories.filter((s) => s.expires_at > now);
  }

  // STRICT REQUIREMENT: If viewerId is specified, only show stories from:
  // 1) The viewer themselves (viewerId === author_id)
  // 2) Creators that viewerId is actively following (followingIds.includes(author_id))
  // If the viewer does NOT follow the person, do NOT show their story!
  const filtered = rawStories.filter((s) => {
    if (!viewerId) return true; // If no viewer specified, return all active
    const authorId = s.author_id;
    return authorId === viewerId || followingIds.includes(authorId);
  });

  return filtered.map((s) => {
    const author = memoryProfiles.find((p) => p.id === s.author_id);
    return {
      id: s.id,
      media_url: s.media_url,
      media_type: s.media_type,
      caption: s.caption,
      text_overlay: s.text_overlay || '',
      filter: s.filter || 'none',
      created_at: s.created_at,
      time: 'Recent',
      author: author
        ? {
            id: author.id,
            name: author.display_name,
            username: author.username,
            avatar: author.avatar_url,
            role: author.role,
          }
        : {
            id: s.author_id,
            name: 'Creator',
            username: 'creator',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            role: 'Creator',
          },
    };
  });
}

export async function createStory(story: StoryRecord): Promise<StoryRecord> {
  if (supabase) {
    const { data } = await supabase.from('stories').insert(story).select().single();
    if (data) return data;
  }
  memoryStories.unshift(story);
  return story;
}

export async function deleteStory(id: string): Promise<boolean> {
  if (supabase) {
    await supabase.from('stories').delete().eq('id', id);
    return true;
  }
  const idx = memoryStories.findIndex((s) => s.id === id);
  if (idx >= 0) {
    memoryStories.splice(idx, 1);
    return true;
  }
  return false;
}
