export type ContentKind = 'post' | 'reel' | 'blog';
export type Profile = { id: string; username: string; display_name: string; avatar_url: string | null; role: string | null };
export type Post = { id: string; author_id: string; title: string; description: string; kind: ContentKind; media_urls: string[]; views: number; created_at: string; profiles: Profile; like_count?: number; comment_count?: number; liked?: boolean };
