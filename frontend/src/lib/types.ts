export type ContentKind = 'post' | 'reel' | 'blog' | 'story';
export type Profile = { id: string; username: string; display_name: string; avatar_url: string | null; role: string | null };
export type Post = {
  id: string;
  author_id: string;
  community_id?: string;
  title: string;
  description: string;
  kind: ContentKind;
  media_urls: string[];
  poster_url?: string;
  duration?: string;
  music?: string;
  views: number;
  created_at: string;
  profiles: Profile;
  like_count?: number;
  comment_count?: number;
  shares?: number;
  liked?: boolean;
  saved?: boolean;
  location?: string;
  collaborators?: string[];
  is_ai_labeled?: boolean;
  hide_stats?: boolean;
  post_type?: 'field' | 'hobby' | 'ad';
  field_tag?: string;
  hobby_tag?: string;
  is_ad?: boolean;
  sponsor_name?: string;
  ad_cta_label?: string;
  ad_cta_url?: string;
};

export type StoryItem = {
  id: string;
  author: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    role?: string;
  };
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  text_overlay?: string;
  filter?: string;
  created_at: string;
  time: string;
};

export type UserProfile = {
  id: string;
  role: 'Developer' | 'Editor' | 'Content Writer' | 'Business Analyst';
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  rank: string;
  points: string;
  rating: string;
  skills: string[];
  hobbies?: string[];
  joinedCommunityIds: string[];
  themeColor: string;
};

export type CommunityProfile = {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatar: string;
  banner: string;
  members: string;
  memberCountNum: number;
  description: string;
  tags: string[];
  featuredPostTitle: string;
};

export type ReelItem = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  creator: {
    id?: string;
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
  post_type?: 'field' | 'hobby' | 'ad';
  field_tag?: string;
  hobby_tag?: string;
  is_ad?: boolean;
  sponsor_name?: string;
  ad_cta_label?: string;
  ad_cta_url?: string;
};
