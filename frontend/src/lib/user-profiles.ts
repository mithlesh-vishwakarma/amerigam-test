import type { UserProfile, CommunityProfile, Post } from './types';
import type { ReelItem } from './demo-posts';

export const AUTH_CHANGED_EVENT = 'amerigam:auth-changed';
const ACTIVE_USER_KEY = 'amerigam_active_user_id_v1';

// 4 User Profiles
export const USER_PROFILES: UserProfile[] = [
  {
    id: 'user-dev',
    role: 'Developer',
    display_name: 'Alex Rivera',
    username: 'alex.dev',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    bio: 'Full-Stack Architect & WebGL Engine Developer. Building high-performance UI systems, reactive state pipelines & decentralized protocols.',
    rank: '#3',
    points: '4,820 AP',
    rating: '4.9',
    skills: ['TypeScript', 'React', 'WebGL', 'Vite', 'GraphQL', 'Rust'],
    joinedCommunityIds: ['comm-dev', 'comm-cinema', 'comm-product'],
    themeColor: '#00a8ed',
  },
  {
    id: 'user-editor',
    role: 'Editor',
    display_name: 'Aarav Kapoor',
    username: 'aarav.edits',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    bio: 'Lead Colorist & Senior Film Editor. DaVinci Resolve certified. Exploring analog print emulation, HDR grading and cinematic rhythm cuts.',
    rank: '#1',
    points: '8,940 AP',
    rating: '5.0',
    skills: ['DaVinci Resolve', 'Color Grading', 'Premiere Pro', 'Sound Design', 'Film Print'],
    joinedCommunityIds: ['comm-cinema', 'comm-writers'],
    themeColor: '#f43f5e',
  },
  {
    id: 'user-writer',
    role: 'Content Writer',
    display_name: 'Elena Rostova',
    username: 'elena.writes',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    bio: 'Cultural Essayist, Tech Storyteller & Narrative Director. Deep dives on creative philosophy, cinema essays and digital craftsmanship.',
    rank: '#5',
    points: '6,310 AP',
    rating: '4.9',
    skills: ['Narrative Essays', 'Long-form Journalism', 'Creative Direction', 'Copywriting', 'SEO & Strategy'],
    joinedCommunityIds: ['comm-writers', 'comm-product', 'comm-dev'],
    themeColor: '#10b981',
  },
  {
    id: 'user-analyst',
    role: 'Business Analyst',
    display_name: 'Khyatish Sarapaddiya',
    username: 'khyatish.biz',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    bio: 'Strategic Product & Market Analyst. Quantitative modeling, creator economy metrics, retention funnels & monetization pipelines.',
    rank: '#2',
    points: '7,150 AP',
    rating: '4.8',
    skills: ['Market Analytics', 'Cohort Modeling', 'SQL & BI', 'Retention Funnels', 'Product Economics'],
    joinedCommunityIds: ['comm-product', 'comm-dev'],
    themeColor: '#f59e0b',
  },
];

// 4 Community Profiles
export const COMMUNITY_PROFILES: CommunityProfile[] = [
  {
    id: 'comm-dev',
    name: 'Developers & System Architects',
    handle: '@devs.guild',
    category: 'Engineering & Code',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    members: '38.2k members',
    memberCountNum: 38200,
    description: 'Collaborative hub for full-stack developers, frontend innovators, AI engineers, and open-source contributors sharing code architectures.',
    tags: ['React', 'Next.js', 'Vite', 'TypeScript', 'WebGL', 'Algorithms'],
    featuredPostTitle: 'Zero-runtime CSS vs Vanilla styling in modern reactive web apps',
  },
  {
    id: 'comm-cinema',
    name: 'Cinema & Video Editors Guild',
    handle: '@cinema.crafters',
    category: 'Film & Post-Production',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    members: '24.6k members',
    memberCountNum: 24600,
    description: 'The premier community for colorists, post-production supervisors, motion designers, and sound artists crafting moving images.',
    tags: ['DaVinci Resolve', 'Color Grading', 'Sound Mix', 'Premiere Pro', '4K Cinema'],
    featuredPostTitle: 'Cinematic 2.39:1 film crop with custom Kodak 2383 LUT breakdown',
  },
  {
    id: 'comm-writers',
    name: 'Writers, Storytellers & Essayists',
    handle: '@writers.hub',
    category: 'Literature & Editorial',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    members: '19.4k members',
    memberCountNum: 19400,
    description: 'Dedicated space for creative non-fiction, thought pieces, industry journalism, narrative analysis, and long-form storytelling.',
    tags: ['Storytelling', 'Essays', 'Blogging', 'Critique', 'Publishing'],
    featuredPostTitle: 'Why the craft of human storytelling matters in the age of generative text',
  },
  {
    id: 'comm-product',
    name: 'Product & Business Analytics Hub',
    handle: '@analysts.space',
    category: 'Analytics & Strategy',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=140&q=80',
    banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    members: '15.8k members',
    memberCountNum: 15800,
    description: 'Metrics, retention curves, creator economy unit economics, and data-driven scaling for modern digital products.',
    tags: ['Cohort Analysis', 'LTV & CAC', 'Market Research', 'Data Science', 'Growth'],
    featuredPostTitle: 'Creator economy monetization models: Subscription vs Ad split benchmarks 2026',
  },
];

// Role-tailored posts to ensure each user gets a personalized feed
export const ROLE_SPECIFIC_POSTS: Record<UserProfile['role'], Post[]> = {
  Developer: [
    {
      id: 'post-dev-1',
      author_id: 'user-dev',
      title: 'Architecting 60FPS UI Animations with WebGL and React',
      description: 'Breakdown of zero-overhead canvas layers rendering real-time particles with Framer Motion integration. Full GitHub source included in repository.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'],
      views: 18400,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      profiles: {
        id: 'user-dev',
        username: 'alex.dev',
        display_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        role: 'Developer',
      },
      like_count: 730,
      comment_count: 82,
      liked: false,
    },
    {
      id: 'post-dev-2',
      author_id: 'user-dev',
      title: 'Vite Plugin Architecture & Bundler Optimization Deep-Dive',
      description: 'Why switching our build toolchain reduced cold start times by 78% across 400+ module imports.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
      views: 12200,
      created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
      profiles: {
        id: 'user-dev',
        username: 'alex.dev',
        display_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        role: 'Developer',
      },
      like_count: 512,
      comment_count: 39,
      liked: false,
    },
  ],
  Editor: [
    {
      id: 'post-editor-1',
      author_id: 'user-editor',
      title: 'The Colour Grading Process: Kodak 2383 Film Emulation',
      description: 'Cinematic node tree breakdown in DaVinci Resolve. Balancing sub-black roll-off, halation layers, and split-toning in shadow regions.',
      kind: 'post',
      media_urls: ['/media/reel-1.mp4', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'],
      views: 31400,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      profiles: {
        id: 'user-editor',
        username: 'aarav.edits',
        display_name: 'Aarav Kapoor',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        role: 'Editor',
      },
      like_count: 1480,
      comment_count: 135,
      liked: false,
    },
    {
      id: 'post-editor-2',
      author_id: 'user-editor',
      title: 'Sound Design & Foley Workflow on Indie Commercial Sets',
      description: 'Layering low-frequency ambient rumble with directional audio cues to create immediate visceral tension in 30-second trailers.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'],
      views: 19800,
      created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
      profiles: {
        id: 'user-editor',
        username: 'aarav.edits',
        display_name: 'Aarav Kapoor',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        role: 'Editor',
      },
      like_count: 940,
      comment_count: 67,
      liked: false,
    },
  ],
  'Content Writer': [
    {
      id: 'post-writer-1',
      author_id: 'user-writer',
      title: 'The Architecture of Modern Essays: Crafting Unforgettable Openings',
      description: 'An exhaustive essay on hook design, rhythmic cadence, sentence modulation, and emotional resonance in digital essays.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
      views: 22400,
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      profiles: {
        id: 'user-writer',
        username: 'elena.writes',
        display_name: 'Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        role: 'Content Writer',
      },
      like_count: 1120,
      comment_count: 94,
      liked: false,
    },
    {
      id: 'post-writer-2',
      author_id: 'user-writer',
      title: 'Blogging vs Micro-Content: Why Audience Attention is Polarizing',
      description: 'Observations across 50,000 readers: Why audiences either want 30-second reels or 2,500-word deep dives, with almost nothing surviving in between.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'],
      views: 16700,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      profiles: {
        id: 'user-writer',
        username: 'elena.writes',
        display_name: 'Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        role: 'Content Writer',
      },
      like_count: 830,
      comment_count: 72,
      liked: false,
    },
  ],
  'Business Analyst': [
    {
      id: 'post-analyst-1',
      author_id: 'user-analyst',
      title: 'Creator Economy 2026: Cohort Retention & Monetization Playbook',
      description: 'Analyzing LTV to CAC ratios, churn velocity, and tipping mechanics across top 100 creator collectives on Amerigam.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
      views: 26800,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      profiles: {
        id: 'user-analyst',
        username: 'khyatish.biz',
        display_name: 'Khyatish Sarapaddiya',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
        role: 'Business Analyst',
      },
      like_count: 1350,
      comment_count: 110,
      liked: false,
    },
    {
      id: 'post-analyst-2',
      author_id: 'user-analyst',
      title: 'Community Network Effects: A Quantitative Modeling Approach',
      description: 'How organic peer recommendations lower customer acquisition costs by 4.2x in specialized vertical communities.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'],
      views: 14100,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      profiles: {
        id: 'user-analyst',
        username: 'khyatish.biz',
        display_name: 'Khyatish Sarapaddiya',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
        role: 'Business Analyst',
      },
      like_count: 670,
      comment_count: 45,
      liked: false,
    },
  ],
};

// Community specific posts
export const COMMUNITY_POSTS: Record<string, Post[]> = {
  'comm-dev': [
    {
      id: 'post-comm-dev-1',
      author_id: 'user-dev',
      title: 'Zero-runtime CSS vs Vanilla styling in modern web apps',
      description: 'Evaluating CSS variables, atomic styles, and compile-time overhead in high-throughput single page apps.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'],
      views: 14900,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      profiles: {
        id: 'user-dev',
        username: 'alex.dev',
        display_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        role: 'Developer',
      },
      like_count: 820,
      comment_count: 54,
    },
  ],
  'comm-cinema': [
    {
      id: 'post-comm-cinema-1',
      author_id: 'user-editor',
      title: 'Cinematic 2.39:1 film crop with custom Kodak 2383 LUT',
      description: 'How we dialed in skin tone protection while pushing teal hues into industrial background highlights.',
      kind: 'post',
      media_urls: ['/media/reel-2.mp4', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80'],
      views: 28400,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      profiles: {
        id: 'user-editor',
        username: 'aarav.edits',
        display_name: 'Aarav Kapoor',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        role: 'Editor',
      },
      like_count: 1890,
      comment_count: 112,
    },
  ],
  'comm-writers': [
    {
      id: 'post-comm-writers-1',
      author_id: 'user-writer',
      title: 'Why human storytelling matters in the age of generative text',
      description: 'Lived experience, sensory nuance, and idiosyncratic vulnerability: the irreplaceable elements of narrative.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
      views: 19400,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      profiles: {
        id: 'user-writer',
        username: 'elena.writes',
        display_name: 'Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        role: 'Content Writer',
      },
      like_count: 1420,
      comment_count: 108,
    },
  ],
  'comm-product': [
    {
      id: 'post-comm-product-1',
      author_id: 'user-analyst',
      title: 'Creator economy monetization models: Subscription vs Ad split benchmarks',
      description: 'Data benchmarks across 1,200 creators: Why hybrid membership tiers convert 3.1x higher than paywalled feeds.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
      views: 17200,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      profiles: {
        id: 'user-analyst',
        username: 'khyatish.biz',
        display_name: 'Khyatish Sarapaddiya',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
        role: 'Business Analyst',
      },
      like_count: 980,
      comment_count: 73,
    },
  ],
};

// Authentication state functions
export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return USER_PROFILES[0];
  try {
    const storedId = localStorage.getItem(ACTIVE_USER_KEY);
    const found = USER_PROFILES.find((p) => p.id === storedId);
    return found || USER_PROFILES[0]; // Defaults to Developer
  } catch {
    return USER_PROFILES[0];
  }
}

export function setCurrentUser(profileId: string): UserProfile {
  const profile = USER_PROFILES.find((p) => p.id === profileId) || USER_PROFILES[0];
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_USER_KEY, profile.id);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: profile }));
  }
  return profile;
}

export function getAllProfiles(): UserProfile[] {
  return USER_PROFILES;
}

export function getAllCommunities(): CommunityProfile[] {
  return COMMUNITY_PROFILES;
}

export function getCommunityById(id: string): CommunityProfile | undefined {
  return COMMUNITY_PROFILES.find((c) => c.id === id);
}

export function getJoinedCommunitiesForUser(user: UserProfile): CommunityProfile[] {
  if (!user || !Array.isArray(user.joinedCommunityIds)) return [];
  return COMMUNITY_PROFILES.filter((c) => user.joinedCommunityIds.includes(c.id));
}
