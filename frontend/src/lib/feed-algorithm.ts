import type { Post } from './types';

export interface FeedRatioStats {
  fieldCount: number;
  hobbyCount: number;
  adCount: number;
  total: number;
  fieldPercent: number;
  hobbyPercent: number;
  adPercent: number;
}

/**
 * Normalizes post classification into 'field' | 'hobby' | 'ad'
 */
export function classifyPost(post: Post): 'field' | 'hobby' | 'ad' {
  if (post.is_ad || post.post_type === 'ad') return 'ad';
  if (post.post_type === 'hobby') return 'hobby';
  if (post.hobby_tag) return 'hobby';

  // Check tags in collaborators if encoded
  if (Array.isArray(post.collaborators)) {
    for (const tag of post.collaborators) {
      if (tag === 'meta:ad:true' || tag.startsWith('meta:type:ad')) return 'ad';
      if (tag.startsWith('meta:type:hobby') || tag.startsWith('meta:hobby:')) return 'hobby';
    }
  }

  // Infer from content keywords
  const text = `${post.title} ${post.description}`.toLowerCase();
  if (/\b(sponsor|promoted|ad:)\b/i.test(text)) return 'ad';
  if (/\b(gaming|cyberpunk|photo|photography|film camera|leica|synth|music|foley|marathon|fitness|reading|novel|travel|kyoto|sketch|art|chess)\b/i.test(text)) {
    return 'hobby';
  }

  return 'field';
}

/**
 * Interleaves posts to maintain the 70% Field, 20% Hobby, 10% Ads distribution
 * Repeating block of 10 slots:
 * [Field, Field, Hobby, Field, Field, Field, Ad, Field, Hobby, Field]
 */
export function applyFeedDistributionRatio(
  posts: Post[],
  userField: string,
  userHobbies: string[] = []
): Post[] {
  if (!posts || posts.length === 0) return [];

  const fieldPool: Post[] = [];
  const otherRolePool: Post[] = [];
  const hobbyPool: Post[] = [];
  const adPool: Post[] = [];

  const lowerHobbies = userHobbies.map((h) => h.toLowerCase());

  posts.forEach((post) => {
    const type = post.post_type || classifyPost(post);
    if (type === 'ad' || post.is_ad) {
      adPool.push(post);
    } else if (type === 'hobby') {
      hobbyPool.push(post);
    } else {
      if (post.field_tag === userField || post.profiles?.role === userField) {
        fieldPool.push(post);
      } else {
        otherRolePool.push(post);
      }
    }
  });

  // Sort hobbyPool so posts matching user's specific hobbies appear first
  hobbyPool.sort((a, b) => {
    const aMatch = lowerHobbies.some((h) => (a.hobby_tag || '').toLowerCase().includes(h) || a.title.toLowerCase().includes(h)) ? 1 : 0;
    const bMatch = lowerHobbies.some((h) => (b.hobby_tag || '').toLowerCase().includes(h) || b.title.toLowerCase().includes(h)) ? 1 : 0;
    return bMatch - aMatch;
  });

  const allFieldCandidates = [...fieldPool, ...otherRolePool];

  const interleaved: Post[] = [];
  const count = posts.length;

  let fieldIdx = 0;
  let hobbyIdx = 0;
  let adIdx = 0;

  for (let i = 0; i < count; i++) {
    const slot = i % 10;
    let chosen: Post | null = null;

    if (slot === 2 || slot === 8) {
      // 20% Hobby slot
      if (hobbyPool.length > 0) {
        chosen = hobbyPool[hobbyIdx % hobbyPool.length];
        hobbyIdx++;
      }
    } else if (slot === 6) {
      // 10% Ad slot
      if (adPool.length > 0) {
        chosen = adPool[adIdx % adPool.length];
        adIdx++;
      }
    }

    // 70% Field slot (slots 0, 1, 3, 4, 5, 7, 9)
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

  return interleaved;
}

/**
 * Calculates percentage breakdown of a post list
 */
export function calculateFeedRatioStats(posts: Post[]): FeedRatioStats {
  let field = 0;
  let hobby = 0;
  let ad = 0;

  posts.forEach((p) => {
    const type = p.post_type || classifyPost(p);
    if (type === 'ad' || p.is_ad) ad++;
    else if (type === 'hobby') hobby++;
    else field++;
  });

  const total = posts.length || 1;
  return {
    fieldCount: field,
    hobbyCount: hobby,
    adCount: ad,
    total: posts.length,
    fieldPercent: Math.round((field / total) * 100),
    hobbyPercent: Math.round((hobby / total) * 100),
    adPercent: Math.round((ad / total) * 100),
  };
}
