import type { Post } from './types';

export interface ReelItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  creator: {
    name: string;
    username: string;
    avatar?: string;
    initial: string;
    role: string;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  music?: string;
}

export const demoReels: ReelItem[] = [
  {
    id: 'reel-neil-arora',
    title: 'Reading Routine',
    description: 'Starting a new book today. Any good reading recommendations?',
    video_url: '/media/reel-1.mp4',
    poster_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Neil Arora',
      username: 'neilarora',
      initial: 'N',
      role: 'Creator · Books & Film',
    },
    likes: 142,
    comments: 33,
    shares: 0,
    views: 12400,
    music: 'Original Sound · Neil Arora',
  },
  {
    id: 'reel-leather-jacket',
    title: 'Studio Fashion Editorial',
    description: 'Behind the scenes at today’s studio lighting session. What do you think of this contrast and grade?',
    video_url: '/media/reel-2.mp4',
    poster_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Elena Rostova',
      username: 'elenarostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      initial: 'E',
      role: 'Fashion Stylist',
    },
    likes: 489,
    comments: 84,
    shares: 19,
    views: 31200,
    music: 'Midnight City · Electronic Beats',
  },
  {
    id: 'reel-skater-motion',
    title: 'Ocean Horizon & Motion',
    description: 'Capturing the deep blue swell at dawn. 4K high-frame rate cinema study.',
    video_url: '/media/reel-3.mp4',
    poster_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Alex Rivera',
      username: 'alexrivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      initial: 'A',
      role: 'Action & Sport Videographer',
    },
    likes: 1250,
    comments: 112,
    shares: 45,
    views: 89400,
    music: 'Summer Breeze · Lo-Fi Beats',
  },
  {
    id: 'reel-neon-night',
    title: 'Cyberpunk Tokyo Ambience',
    description: 'Rainy neon reflections in Shinjuku. Pure cinematic vibes tonight.',
    video_url: '/media/reel-4.mp4',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Vivaan Gupta',
      username: 'vivaan',
      initial: 'V',
      role: 'Visual Artist',
    },
    likes: 932,
    comments: 67,
    shares: 28,
    views: 45100,
    music: 'Neon Dreams · Synthwave',
  },
];

export const demoPosts: Post[] = [
  {
    id: 'demo-neil-reel',
    author_id: 'demo-neil',
    title: 'Starting a new book today',
    description: 'Starting a new book today. Any good reading recommendations? Drop your favorites below!\n\n#reading #books #creativespace #morningroutine',
    kind: 'reel',
    media_urls: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
      '/media/reel-1.mp4',
    ],
    views: 12400,
    created_at: '2026-10-16T12:00:00.000Z',
    profiles: {
      id: 'demo-neil',
      username: 'neilarora',
      display_name: 'Neil Arora',
      avatar_url: null,
      role: 'Creator · Books & Film',
    },
    like_count: 142,
    comment_count: 33,
  },
  {
    id: 'demo-cathedral',
    author_id: 'demo',
    title: 'Golden hour colour study',
    description: 'As the soft golden light of the late afternoon sun began to filter through the tall whispering pine trees, painting long dancing shadows across the quiet mossy forest floor, a small red fox quietly emerged from the thick brush, paused to listen to the distant rush of the river, and then darted swiftly into the ferns.\n\nHow to Build a Long Sentence: A good long sentence is just short, clear thoughts joined together with care.',
    kind: 'post',
    media_urls: [
      'https://images.unsplash.com/photo-1548625361-58a9b86aa83b?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85',
    ],
    views: 104000,
    created_at: '2026-10-16T08:00:00.000Z',
    profiles: {
      id: 'demo',
      username: 'khyatishsarapaddiya871',
      display_name: 'Khyatish sarapaddiya',
      avatar_url: null,
      role: 'Co-founder · Amerigam',
    },
    like_count: 55000,
    comment_count: 20300,
  },
  {
    id: 'demo-fashion-reel',
    author_id: 'demo-elena',
    title: 'Studio Lighting & Leather Edit',
    description: 'Behind the scenes at today’s studio lighting session. What do you think of this contrast and grade?\n\n#fashion #cinematography #lighting #reels',
    kind: 'reel',
    media_urls: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      '/media/reel-2.mp4',
    ],
    views: 31200,
    created_at: '2026-10-15T14:30:00.000Z',
    profiles: {
      id: 'demo-elena',
      username: 'elenarostova',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      role: 'Fashion Stylist',
    },
    like_count: 489,
    comment_count: 84,
  },
  {
    id: 'demo-city',
    author_id: 'demo',
    title: 'A rainy-night edit',
    description: 'Creativity has no limit if you keep looking for the light in the shadows of the city.\n\nCaptured in downtown Tokyo during monsoon season.',
    kind: 'post',
    media_urls: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1100&q=80',
    ],
    views: 12700,
    created_at: '2026-10-15T08:00:00.000Z',
    profiles: {
      id: 'demo',
      username: 'vivaan',
      display_name: 'Vivaan Gupta',
      avatar_url: null,
      role: 'Visual Artist',
    },
    like_count: 9000,
    comment_count: 1800,
  },
  {
    id: 'demo-camera',
    author_id: 'demo',
    title: 'The colour grading process',
    description: 'A behind-the-scenes look at the 35mm film emulation LUTs we developed this week. Balancing skin tones against cool cyan ambient shadows.',
    kind: 'post',
    media_urls: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1100&q=80',
    ],
    views: 24800,
    created_at: '2026-10-14T08:00:00.000Z',
    profiles: {
      id: 'demo',
      username: 'creator',
      display_name: 'Aarav Mehta',
      avatar_url: null,
      role: 'Colorist & DP',
    },
    like_count: 3200,
    comment_count: 420,
  },
];
