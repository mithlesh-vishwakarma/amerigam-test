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
  duration?: string;
  music?: string;
  badgeTop?: boolean;
}

export const demoReels: ReelItem[] = [
  {
    id: 'reel-colour-grading',
    title: 'The colour grading process',
    description: 'Breakdown of our cinematic palette node tree in DaVinci Resolve. What look do you prefer?',
    video_url: '/media/reel-1.mp4',
    poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Aarav Kapoor',
      username: 'aarav.edits',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      initial: 'A',
      role: 'Professional Video Editor',
    },
    likes: 2480,
    comments: 184,
    shares: 92,
    views: 24800,
    duration: '0:32',
    music: 'Original Sound · @aarav.edits',
  },
  {
    id: 'reel-behind-camera',
    title: 'On set: behind the camera',
    description: 'Rigged up the cinema beast on an indie commercial set today. Steady tracking shot.',
    video_url: '/media/reel-2.mp4',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Neel Arora',
      username: 'neel.films',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      initial: 'N',
      role: 'Director of Photography',
    },
    likes: 1820,
    comments: 97,
    shares: 43,
    views: 18200,
    duration: '0:24',
    badgeTop: true,
    music: 'Film Score · Neel Arora',
  },
  {
    id: 'reel-sketching-nature',
    title: 'Sketching from nature',
    description: 'Sunday morning botanical studies and watercolor wash in the studio.',
    video_url: '/media/reel-3.mp4',
    poster_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Isha Sharma',
      username: 'isha.creates',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      initial: 'I',
      role: 'Illustrator & Fine Artist',
    },
    likes: 860,
    comments: 54,
    shares: 21,
    views: 8600,
    duration: '0:45',
    music: 'Quiet Mornings · Acoustic',
  },
  {
    id: 'reel-tokyo-night',
    title: 'A rainy-night edit',
    description: 'Neon highlights reflecting off wet city streets in Shinjuku after midnight.',
    video_url: '/media/reel-4.mp4',
    poster_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    creator: {
      name: 'Aarav Kapoor',
      username: 'aarav.edits',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      initial: 'A',
      role: 'Professional Video Editor',
    },
    likes: 1270,
    comments: 112,
    shares: 65,
    views: 12700,
    duration: '0:36',
    music: 'Midnight City · Lo-Fi Beats',
  },
];

export interface HomePostCardItem {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    role: string;
  };
  caption: string;
  slides: {
    id: string;
    title: string;
    authorHandle: string;
    views: string;
    duration: string;
    image: string;
  }[];
}

export const demoHomeMainPost: HomePostCardItem = {
  id: 'post-aarav-edits-featured',
  author: {
    name: 'Aarav Edits',
    username: 'aarav.edits',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    role: 'Professional Video Editor',
  },
  caption: 'Creativity has no limit If you thinking that',
  slides: [
    {
      id: 'slide-1',
      title: 'Golden hour colour study',
      authorHandle: '@aarav.edits',
      views: '31.4K',
      duration: '0:18',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'slide-2',
      title: 'A rainy-night edit',
      authorHandle: '@aarav.edits',
      views: '12.7K',
      duration: '0:36',
      image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'slide-3',
      title: 'Neon studio highlights',
      authorHandle: '@aarav.edits',
      views: '18.9K',
      duration: '0:22',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

export const demoHomeSideStack = [
  {
    id: 'side-brush-colour',
    title: 'Brush, colour, create',
    authorHandle: '@isha.creates',
    views: '9.3K',
    duration: '0:40',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'side-live-music',
    title: 'The energy of live music',
    authorHandle: '@dev.audio',
    views: '16.5K',
    duration: '0:30',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  },
];

export const demoPosts: Post[] = [
  {
    id: 'post-1',
    author_id: 'creator-1',
    title: 'The colour grading process',
    description: 'Creativity has no limit if you are thinking outside conventional constraints.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'],
    views: 24800,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      id: 'creator-1',
      username: 'aarav.edits',
      display_name: 'Aarav Edits',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'Professional Video Editor',
    },
    like_count: 842,
    comment_count: 53,
    liked: false,
  },
  {
    id: 'post-2',
    author_id: 'creator-2',
    title: 'On set: behind the camera',
    description: 'Behind the scenes at today’s studio lighting session with RED camera rig.',
    kind: 'reel',
    media_urls: ['/media/reel-2.mp4', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80'],
    views: 18200,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    profiles: {
      id: 'creator-2',
      username: 'neel.films',
      display_name: 'Neel Films',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      role: 'Director of Photography',
    },
    like_count: 2190,
    comment_count: 144,
    liked: false,
  },
];
