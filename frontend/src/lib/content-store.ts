import { demoPosts, demoReels, ReelItem } from './demo-posts';
import type { Post, StoryItem } from './types';
import { getCurrentUser, ROLE_SPECIFIC_POSTS } from './user-profiles';

const POSTS_KEY = 'amerigam_posts_store_v1';
const REELS_KEY = 'amerigam_reels_store_v1';
const STORIES_KEY = 'amerigam_stories_store_v1';
export const CONTENT_UPDATED_EVENT = 'amerigam:content-updated';

// Dynamically resolved current logged-in user
export const currentUser = new Proxy({} as any, {
  get: (_, prop) => {
    const u = getCurrentUser();
    return u ? (u as any)[prop] : undefined;
  },
});

// Initial stories
const initialStories: StoryItem[] = [
  {
    id: 'story-aarav',
    author: {
      name: 'Aarav Edits',
      username: 'aarav.edits',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    media_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Grading the new indie documentary sequence ✨',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    time: '45m ago',
  },
  {
    id: 'story-neel',
    author: {
      name: 'Neel Films',
      username: 'neel.films',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    media_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'On location in the desert. Anamorphic test run.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    time: '2h ago',
  },
  {
    id: 'story-isha',
    author: {
      name: 'Isha Creates',
      username: 'isha.creates',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
    media_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Watercolor pigments for our upcoming exhibition palette.',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    time: '4h ago',
  },
  {
    id: 'story-alex',
    author: {
      name: 'Alex Rivera',
      username: 'alex.rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
    media_type: 'image',
    caption: 'Midnight neon vibes.',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    time: '6h ago',
  },
];

class ContentStore {
  private notify() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
    }
  }

  // --- POSTS ---
  getPosts(): Post[] {
    const user = getCurrentUser();
    const rolePosts = ROLE_SPECIFIC_POSTS[user.role] || [];
    let userCreated: Post[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(POSTS_KEY);
        if (stored) {
          userCreated = JSON.parse(stored);
        }
      } catch {}
    }
    const combined = [...rolePosts, ...userCreated, ...demoPosts];
    const seen = new Set<string>();
    return combined.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }

  addPost(data: {
    title: string;
    description: string;
    kind: 'post' | 'blog';
    media_urls: string[];
    location?: string;
    collaborators?: string[];
    is_ai_labeled?: boolean;
    hide_stats?: boolean;
  }): Post {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: currentUser.id,
      title: data.title,
      description: data.description,
      kind: data.kind,
      media_urls: data.media_urls.length ? data.media_urls : ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'],
      views: 1,
      created_at: new Date().toISOString(),
      profiles: {
        id: currentUser.id,
        username: currentUser.username,
        display_name: currentUser.display_name,
        avatar_url: currentUser.avatar_url,
        role: currentUser.role,
      },
      like_count: 0,
      comment_count: 0,
      liked: false,
      location: data.location,
      collaborators: data.collaborators,
      is_ai_labeled: data.is_ai_labeled,
      hide_stats: data.hide_stats,
    };

    const current = this.getPosts();
    const updated = [newPost, ...current];
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    } catch {}

    // Also attempt backend POST
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        kind: data.kind,
        media_urls: newPost.media_urls,
      }),
    }).catch(() => {});

    this.notify();
    return newPost;
  }

  // --- REELS ---
  getReels(): ReelItem[] {
    if (typeof window === 'undefined') return demoReels;
    try {
      const stored = localStorage.getItem(REELS_KEY);
      if (!stored) {
        localStorage.setItem(REELS_KEY, JSON.stringify(demoReels));
        return demoReels;
      }
      return JSON.parse(stored);
    } catch {
      return demoReels;
    }
  }

  addReel(data: {
    title: string;
    description: string;
    video_url: string;
    poster_url?: string;
    location?: string;
    collaborators?: string[];
    is_ai_labeled?: boolean;
    hide_stats?: boolean;
  }): ReelItem {
    const newReel: ReelItem = {
      id: `reel-${Date.now()}`,
      title: data.title,
      description: data.description,
      video_url: data.video_url || '/media/reel-1.mp4',
      poster_url: data.poster_url || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      creator: {
        name: currentUser.display_name,
        username: currentUser.username,
        avatar: currentUser.avatar_url,
        initial: currentUser.display_name.charAt(0),
        role: currentUser.role,
      },
      likes: 0,
      comments: 0,
      shares: 0,
      views: 1,
      duration: '0:30',
      music: `Original Sound · @${currentUser.username}`,
      badgeTop: true,
    };

    const current = this.getReels();
    const updated = [newReel, ...current];
    try {
      localStorage.setItem(REELS_KEY, JSON.stringify(updated));
    } catch {}

    // Also persist as a post in the backend
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        kind: 'reel',
        media_urls: [newReel.video_url, newReel.poster_url],
      }),
    }).catch(() => {});

    this.notify();
    return newReel;
  }

  // --- STORIES (DOES NOT POST TO FEED) ---
  getStories(): StoryItem[] {
    if (typeof window === 'undefined') return initialStories;
    try {
      const stored = localStorage.getItem(STORIES_KEY);
      if (!stored) {
        localStorage.setItem(STORIES_KEY, JSON.stringify(initialStories));
        return initialStories;
      }
      return JSON.parse(stored);
    } catch {
      return initialStories;
    }
  }

  getUserStory(): StoryItem | null {
    const stories = this.getStories();
    return stories.find((s) => s.author.username === currentUser.username) || null;
  }

  hasUserActiveStory(): boolean {
    return !!this.getUserStory();
  }

  addStory(data: {
    media_url: string;
    media_type?: 'image' | 'video';
    caption?: string;
    text_overlay?: string;
    filter?: string;
  }): StoryItem {
    const newStory: StoryItem = {
      id: `story-user-${Date.now()}`,
      author: {
        name: currentUser.display_name,
        username: currentUser.username,
        avatar: currentUser.avatar_url,
      },
      media_url: data.media_url,
      media_type: data.media_type || (data.media_url.endsWith('.mp4') ? 'video' : 'image'),
      caption: data.caption || '',
      text_overlay: data.text_overlay || '',
      filter: data.filter || 'none',
      created_at: new Date().toISOString(),
      time: 'Just now',
    };

    // Filter out previous user story if any, place new story at the very beginning of stories
    const current = this.getStories().filter((s) => s.author.username !== currentUser.username);
    const updated = [newStory, ...current];
    try {
      localStorage.setItem(STORIES_KEY, JSON.stringify(updated));
    } catch {}

    // NOTICE: We specifically DO NOT add to posts or reels, keeping it strictly in stories!
    this.notify();
    return newStory;
  }
}

export const contentStore = new ContentStore();
