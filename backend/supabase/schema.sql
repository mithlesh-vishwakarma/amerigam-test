-- ============================================================================
-- AMERIGAM COMPLETE DATABASE SCHEMA & RELATIONS (SUPABASE POSTGRESQL)
-- Copy and paste this complete script into Supabase SQL Editor and click 'Run'.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if needed (safe re-run)
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_saves CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- The functions may remain when this is a re-run, so remove them separately.
-- Do not drop triggers explicitly: PostgreSQL errors if their table is absent.
DROP FUNCTION IF EXISTS update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comment_count() CASCADE;

-- ============================================================================
-- 2. TABLE DEFINITIONS
-- ============================================================================

-- PROFILES (Users with specific domain roles)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Developer', 'Editor', 'Content Writer', 'Business Analyst')),
  bio TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL DEFAULT '#1',
  points TEXT NOT NULL DEFAULT '0 AP',
  rating TEXT NOT NULL DEFAULT '5.0',
  skills TEXT[] NOT NULL DEFAULT '{}',
  hobbies TEXT[] NOT NULL DEFAULT '{}',
  theme_color TEXT NOT NULL DEFAULT '#00a8ed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FOLLOWS (Social Graph for Feed and Story Filtering)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- COMMUNITIES (Specialized Creator Hubs)
CREATE TABLE communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  avatar TEXT NOT NULL,
  banner TEXT NOT NULL,
  members_count TEXT NOT NULL DEFAULT '0 members',
  member_count_num INT NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured_post_title TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMMUNITY MEMBERSHIPS (Many-to-Many join table)
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_community_member UNIQUE (community_id, profile_id)
);

-- POSTS (Posts, Reels, and Blogs with Rich Metadata: 70% Field, 20% Hobby, 10% Ads)
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('post', 'reel', 'blog')),
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  poster_url TEXT,
  duration TEXT DEFAULT '0:30',
  music TEXT DEFAULT '',
  location TEXT DEFAULT '',
  collaborators TEXT[] DEFAULT '{}',
  is_ai_labeled BOOLEAN NOT NULL DEFAULT FALSE,
  hide_stats BOOLEAN NOT NULL DEFAULT FALSE,
  views INT NOT NULL DEFAULT 1,
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  post_type TEXT NOT NULL DEFAULT 'field' CHECK (post_type IN ('field', 'hobby', 'ad')),
  field_tag TEXT DEFAULT '',
  hobby_tag TEXT DEFAULT '',
  is_ad BOOLEAN NOT NULL DEFAULT FALSE,
  sponsor_name TEXT DEFAULT '',
  ad_cta_label TEXT DEFAULT '',
  ad_cta_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STORIES (24h Ephemeral Stories - strictly isolated from posts/feed)
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT DEFAULT '',
  text_overlay TEXT DEFAULT '',
  filter TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- POST LIKES (User Likes)
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_post_like UNIQUE (post_id, profile_id)
);

-- POST SAVES (Bookmarks)
CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_post_save UNIQUE (post_id, profile_id)
);

-- POST COMMENTS (Discussion threads)
CREATE TABLE post_comments (
  id TEXT PRIMARY KEY DEFAULT ('comment-' || extract(epoch from now())::text),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_kind ON posts(kind);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_community_members_profile ON community_members(profile_id);
CREATE INDEX idx_post_saves_profile ON post_saves(profile_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);

-- GIN Index for fast full-text search across titles and descriptions
CREATE INDEX idx_posts_search ON posts USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
);

-- ============================================================================
-- 4. AUTOMATIC COUNTER & TIMESTAMP TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_comment_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all content
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Public communities are viewable by everyone" ON communities FOR SELECT USING (true);
CREATE POLICY "Public community members are viewable by everyone" ON community_members FOR SELECT USING (true);
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Public likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Public saves are viewable by everyone" ON post_saves FOR SELECT USING (true);
CREATE POLICY "Public comments are viewable by everyone" ON post_comments FOR SELECT USING (true);

-- Allow full mutations for service role and client app
CREATE POLICY "Allow all modifications on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on follows" ON follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on communities" ON communities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on community_members" ON community_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on stories" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on post_likes" ON post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on post_saves" ON post_saves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all modifications on post_comments" ON post_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. STORAGE BUCKET CONFIGURATION (For Images, Reels, and Video Uploads)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Media Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Deletes" ON storage.objects;

CREATE POLICY "Public Media Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Allow Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- ============================================================================
-- 7. INITIAL SEED DATA
-- ============================================================================

-- Insert the 4 Distinct User Profiles
INSERT INTO profiles (id, username, display_name, avatar_url, role, bio, rank, points, rating, skills, theme_color)
VALUES
  (
    'user-dev',
    'alex.dev',
    'Alex Rivera',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'Developer',
    'Full-Stack Architect & WebGL Engine Developer. Building high-performance UI systems, reactive state pipelines & decentralized protocols.',
    '#3',
    '4,820 AP',
    '4.9',
    ARRAY['TypeScript', 'React', 'WebGL', 'Vite', 'GraphQL', 'Rust'],
    '#00a8ed'
  ),
  (
    'user-editor',
    'aarav.edits',
    'Aarav Kapoor',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    'Editor',
    'Lead Colorist & Senior Film Editor. DaVinci Resolve certified. Exploring analog print emulation, HDR grading and cinematic rhythm cuts.',
    '#1',
    '8,940 AP',
    '5.0',
    ARRAY['DaVinci Resolve', 'Color Grading', 'Premiere Pro', 'Sound Design', 'Film Print'],
    '#f43f5e'
  ),
  (
    'user-writer',
    'elena.writes',
    'Elena Rostova',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'Content Writer',
    'Cultural Essayist, Tech Storyteller & Narrative Director. Deep dives on creative philosophy, cinema essays and digital craftsmanship.',
    '#5',
    '6,310 AP',
    '4.9',
    ARRAY['Narrative Essays', 'Long-form Journalism', 'Creative Direction', 'Copywriting', 'SEO & Strategy'],
    '#10b981'
  ),
  (
    'user-analyst',
    'khyatish.biz',
    'Khyatish Sarapaddiya',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    'Business Analyst',
    'Strategic Product & Market Analyst. Quantitative modeling, creator economy metrics, retention funnels & monetization pipelines.',
    '#2',
    '7,150 AP',
    '4.8',
    ARRAY['Market Analytics', 'Cohort Modeling', 'SQL & BI', 'Retention Funnels', 'Product Economics'],
    '#f59e0b'
  );

-- Insert Initial Follow Graph (Social Following network)
INSERT INTO follows (follower_id, following_id)
VALUES
  ('user-dev', 'user-editor'),
  ('user-dev', 'user-writer'),
  ('user-editor', 'user-dev'),
  ('user-editor', 'user-writer'),
  ('user-writer', 'user-analyst'),
  ('user-writer', 'user-editor'),
  ('user-analyst', 'user-dev'),
  ('user-analyst', 'user-writer');

-- Insert the 4 Specialized Communities
INSERT INTO communities (id, name, handle, category, avatar, banner, members_count, member_count_num, description, tags, featured_post_title)
VALUES
  (
    'comm-dev',
    'Developers & System Architects',
    '@devs.guild',
    'Engineering & Code',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=140&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    '38.2k members',
    38200,
    'Collaborative hub for full-stack developers, frontend innovators, AI engineers, and open-source contributors sharing code architectures.',
    ARRAY['React', 'Next.js', 'Vite', 'TypeScript', 'WebGL', 'Algorithms'],
    'Zero-runtime CSS vs Vanilla styling in modern reactive web apps'
  ),
  (
    'comm-cinema',
    'Cinema & Video Editors Guild',
    '@cinema.crafters',
    'Film & Post-Production',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=140&q=80',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    '24.6k members',
    24600,
    'The premier community for colorists, post-production supervisors, motion designers, and sound artists crafting moving images.',
    ARRAY['DaVinci Resolve', 'Color Grading', 'Sound Mix', 'Premiere Pro', '4K Cinema'],
    'Cinematic 2.39:1 film crop with custom Kodak 2383 LUT breakdown'
  ),
  (
    'comm-writers',
    'Writers, Storytellers & Essayists',
    '@writers.hub',
    'Literature & Editorial',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=140&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    '19.4k members',
    19400,
    'Dedicated space for creative non-fiction, thought pieces, industry journalism, narrative analysis, and long-form storytelling.',
    ARRAY['Storytelling', 'Essays', 'Blogging', 'Critique', 'Publishing'],
    'Why human storytelling matters in the age of generative text'
  ),
  (
    'comm-product',
    'Product & Business Analytics Hub',
    '@analysts.space',
    'Analytics & Strategy',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=140&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    '15.8k members',
    15800,
    'Metrics, retention curves, creator economy unit economics, and data-driven scaling for modern digital products.',
    ARRAY['Cohort Analysis', 'LTV & CAC', 'Market Research', 'Data Science', 'Growth'],
    'Creator economy monetization models: Subscription vs Ad split benchmarks'
  );

-- Link Users to Community Memberships
INSERT INTO community_members (community_id, profile_id, role)
VALUES
  ('comm-dev', 'user-dev', 'lead'),
  ('comm-cinema', 'user-dev', 'member'),
  ('comm-product', 'user-dev', 'member'),
  ('comm-cinema', 'user-editor', 'lead'),
  ('comm-writers', 'user-editor', 'member'),
  ('comm-writers', 'user-writer', 'lead'),
  ('comm-product', 'user-writer', 'member'),
  ('comm-dev', 'user-writer', 'member'),
  ('comm-product', 'user-analyst', 'lead'),
  ('comm-dev', 'user-analyst', 'member');

-- Insert Initial Posts, Reels, and Blogs
INSERT INTO posts (id, author_id, community_id, title, description, kind, media_urls, poster_url, duration, music, location, views, like_count, comment_count)
VALUES
  (
    'post-dev-1',
    'user-dev',
    'comm-dev',
    'Architecting 60FPS UI Animations with WebGL and React',
    'Breakdown of zero-overhead canvas layers rendering real-time particles with Framer Motion integration. Full GitHub source included in repository.',
    'blog',
    ARRAY['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '5 min read',
    '',
    'Tokyo, Japan',
    18400,
    730,
    82
  ),
  (
    'post-dev-2',
    'user-dev',
    'comm-dev',
    'Vite Plugin Architecture & Bundler Optimization Deep-Dive',
    'Why switching our build toolchain reduced cold start times by 78% across 400+ module imports.',
    'post',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '',
    '',
    'San Francisco, CA',
    12200,
    512,
    39
  ),
  (
    'post-editor-1',
    'user-editor',
    'comm-cinema',
    'The Colour Grading Process: Kodak 2383 Film Emulation',
    'Cinematic node tree breakdown in DaVinci Resolve. Balancing sub-black roll-off, halation layers, and split-toning in shadow regions.',
    'reel',
    ARRAY['/media/reel-1.mp4'],
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    '0:32',
    'Original Sound · @aarav.edits',
    'Mumbai, India',
    31400,
    1480,
    135
  ),
  (
    'post-editor-2',
    'user-editor',
    'comm-cinema',
    'Sound Design & Foley Workflow on Indie Sets',
    'Layering low-frequency ambient rumble with directional audio cues to create immediate visceral tension in 30-second trailers.',
    'blog',
    ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '7 min read',
    '',
    'London, UK',
    19800,
    940,
    67
  ),
  (
    'post-writer-1',
    'user-writer',
    'comm-writers',
    'The Architecture of Modern Essays: Crafting Unforgettable Openings',
    'An exhaustive essay on hook design, rhythmic cadence, sentence modulation, and emotional resonance in digital essays.',
    'blog',
    ARRAY['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '9 min read',
    '',
    'Paris, France',
    22400,
    1120,
    94
  ),
  (
    'post-writer-2',
    'user-writer',
    'comm-writers',
    'Blogging vs Micro-Content: Why Audience Attention is Polarizing',
    'Observations across 50,000 readers: Why audiences either want 30-second reels or 2,500-word deep dives.',
    'post',
    ARRAY['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '',
    '',
    'Berlin, Germany',
    16700,
    830,
    72
  ),
  (
    'post-analyst-1',
    'user-analyst',
    'comm-product',
    'Creator Economy 2026: Cohort Retention & Monetization Playbook',
    'Analyzing LTV to CAC ratios, churn velocity, and tipping mechanics across top 100 creator collectives on Amerigam.',
    'blog',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '6 min read',
    '',
    'New York, NY',
    26800,
    1350,
    110
  ),
  (
    'post-analyst-2',
    'user-analyst',
    'comm-product',
    'Community Network Effects: A Quantitative Modeling Approach',
    'How organic peer recommendations lower customer acquisition costs by 4.2x in specialized vertical communities.',
    'post',
    ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'],
    NULL,
    '',
    '',
    'Singapore',
    14100,
    670,
    45
  );

-- Insert Stories for Creators (Ephemeral 24h stories)
INSERT INTO stories (id, author_id, media_url, media_type, caption)
VALUES
  (
    'story-aarav',
    'user-editor',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1080&q=80',
    'image',
    'Grading the new indie documentary sequence ✨'
  ),
  (
    'story-elena',
    'user-writer',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1080&q=80',
    'image',
    'Watercolor pigments and creative essays.'
  ),
  (
    'story-alex',
    'user-dev',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
    'image',
    'Midnight neon vibes & WebGL testing.'
  ),
  (
    'story-khyatish',
    'user-analyst',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80',
    'image',
    'Creator economy benchmark metrics review.'
  );

-- Insert Initial Comments
INSERT INTO post_comments (id, post_id, author_id, content, created_at)
VALUES
  ('comment-seed-1', 'post-editor-1', 'user-dev', 'The shadow rolloff on this Kodak emulation is sublime! Are you doing this in ACES or DWG?', NOW() - INTERVAL '2 hours'),
  ('comment-seed-2', 'post-editor-1', 'user-writer', 'The texture feels tactile and organic. Inspiring work Aarav!', NOW() - INTERVAL '1 hour'),
  ('comment-seed-3', 'post-dev-1', 'user-analyst', 'WebGL canvas layer integration benchmarks look really promising. What is the memory footprint on mobile?', NOW() - INTERVAL '3 hours'),
  ('comment-seed-4', 'post-writer-1', 'user-editor', 'The rhythmic cadence in your opening paragraph sets the bar high.', NOW() - INTERVAL '4 hours');

-- ============================================================================
-- 8. REALTIME REPLICATION (For Live Socket Subscriptions)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_saves;
