import type { UserProfile, CommunityProfile } from './types';

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


// Authentication state functions

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
