import type { Post, StoryItem, ReelItem } from './types';
import { getCurrentUser } from './user-profiles';

export const CONTENT_UPDATED_EVENT = 'amerigam:content-updated';

// Cleanup any legacy local storage keys from browser memory
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('amerigam_posts_store_v1');
    localStorage.removeItem('amerigam_reels_store_v1');
    localStorage.removeItem('amerigam_stories_store_v1');
  } catch {}
}

export function notifyContentUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

// Dynamically resolved current logged-in user
export const currentUser = new Proxy({} as any, {
  get: (_, prop) => {
    const u = getCurrentUser();
    return u ? (u as any)[prop] : undefined;
  },
});

/**
 * Event-driven bridge. Data is stored and loaded EXCLUSIVELY from the database.
 */
class ContentStore {
  notify() {
    notifyContentUpdated();
  }

  // Fallback signature for backward compatibility during transition; returns empty array
  getPosts(): Post[] {
    return [];
  }

  getReels(): ReelItem[] {
    return [];
  }

  getStories(): StoryItem[] {
    return [];
  }

  getUserStory(): StoryItem | null {
    return null;
  }

  hasUserActiveStory(): boolean {
    return false;
  }
}

export const contentStore = new ContentStore();
