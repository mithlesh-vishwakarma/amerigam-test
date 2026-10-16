import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://urliixbjasydzyaklrzm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('🌱 Seeding Supabase database at:', SUPABASE_URL);

  // 1. Profiles
  const profiles = [
    {
      id: 'user-dev',
      username: 'alex.dev',
      display_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'Developer',
      bio: 'Full-Stack Architect & WebGL Engine Developer. Building high-performance UI systems, reactive state pipelines & decentralized protocols.',
      rank: '#3',
      points: '4,820 AP',
      rating: '4.9',
      skills: ['TypeScript', 'React', 'WebGL', 'Vite', 'GraphQL', 'Rust'],
      theme_color: '#00a8ed',
    },
    {
      id: 'user-editor',
      username: 'aarav.edits',
      display_name: 'Aarav Kapoor',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      role: 'Editor',
      bio: 'Lead Colorist & Senior Film Editor. DaVinci Resolve certified. Exploring analog print emulation, HDR grading and cinematic rhythm cuts.',
      rank: '#1',
      points: '8,940 AP',
      rating: '5.0',
      skills: ['DaVinci Resolve', 'Color Grading', 'Premiere Pro', 'Sound Design', 'Film Print'],
      theme_color: '#f43f5e',
    },
    {
      id: 'user-writer',
      username: 'elena.writes',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
      role: 'Content Writer',
      bio: 'Cultural Essayist, Tech Storyteller & Narrative Director. Deep dives on creative philosophy, cinema essays and digital craftsmanship.',
      rank: '#5',
      points: '6,310 AP',
      rating: '4.9',
      skills: ['Narrative Essays', 'Long-form Journalism', 'Creative Direction', 'Copywriting', 'SEO & Strategy'],
      theme_color: '#10b981',
    },
    {
      id: 'user-analyst',
      username: 'khyatish.biz',
      display_name: 'Khyatish Sarapaddiya',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'Business Analyst',
      bio: 'Strategic Product & Market Analyst. Quantitative modeling, creator economy metrics, retention funnels & monetization pipelines.',
      rank: '#2',
      points: '7,150 AP',
      rating: '4.8',
      skills: ['Market Analytics', 'Cohort Modeling', 'SQL & BI', 'Retention Funnels', 'Product Economics'],
      theme_color: '#f59e0b',
    },
  ];

  const { error: pErr } = await supabase.from('profiles').upsert(profiles);
  if (pErr) console.error('Error inserting profiles:', pErr);
  else console.log('✅ Profiles seeded');

  // 2. Follows
  const follows = [
    { follower_id: 'user-dev', following_id: 'user-editor' },
    { follower_id: 'user-dev', following_id: 'user-writer' },
    { follower_id: 'user-editor', following_id: 'user-dev' },
    { follower_id: 'user-editor', following_id: 'user-writer' },
    { follower_id: 'user-writer', following_id: 'user-analyst' },
    { follower_id: 'user-writer', following_id: 'user-editor' },
    { follower_id: 'user-analyst', following_id: 'user-dev' },
    { follower_id: 'user-analyst', following_id: 'user-writer' },
  ];
  for (const f of follows) {
    await supabase.from('follows').upsert(f, { onConflict: 'follower_id,following_id' });
  }
  console.log('✅ Follows seeded');

  // 3. Communities
  const communities = [
    {
      id: 'comm-dev',
      name: 'Developers & System Architects',
      handle: '@devs.guild',
      category: 'Engineering & Code',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=140&q=80',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      members_count: '38.2k members',
      member_count_num: 38200,
      description: 'Collaborative hub for full-stack developers, frontend innovators, AI engineers, and open-source contributors sharing code architectures.',
      tags: ['React', 'Next.js', 'Vite', 'TypeScript', 'WebGL', 'Algorithms'],
      featured_post_title: 'Zero-runtime CSS vs Vanilla styling in modern reactive web apps',
    },
    {
      id: 'comm-cinema',
      name: 'Cinema & Video Editors Guild',
      handle: '@cinema.crafters',
      category: 'Film & Post-Production',
      avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=140&q=80',
      banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      members_count: '24.6k members',
      member_count_num: 24600,
      description: 'The premier community for colorists, post-production supervisors, motion designers, and sound artists crafting moving images.',
      tags: ['DaVinci Resolve', 'Color Grading', 'Sound Mix', 'Premiere Pro', '4K Cinema'],
      featured_post_title: 'Cinematic 2.39:1 film crop with custom Kodak 2383 LUT breakdown',
    },
    {
      id: 'comm-writers',
      name: 'Writers, Storytellers & Essayists',
      handle: '@writers.hub',
      category: 'Literature & Editorial',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=140&q=80',
      banner: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      members_count: '19.4k members',
      member_count_num: 19400,
      description: 'Dedicated space for creative non-fiction, thought pieces, industry journalism, narrative analysis, and long-form storytelling.',
      tags: ['Storytelling', 'Essays', 'Blogging', 'Critique', 'Publishing'],
      featured_post_title: 'Why human storytelling matters in the age of generative text',
    },
    {
      id: 'comm-product',
      name: 'Product & Business Analytics Hub',
      handle: '@analysts.space',
      category: 'Analytics & Strategy',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=140&q=80',
      banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      members_count: '15.8k members',
      member_count_num: 15800,
      description: 'Metrics, retention curves, creator economy unit economics, and data-driven scaling for modern digital products.',
      tags: ['Cohort Analysis', 'LTV & CAC', 'Market Research', 'Data Science', 'Growth'],
      featured_post_title: 'Creator economy monetization models: Subscription vs Ad split benchmarks',
    },
  ];

  const { error: cErr } = await supabase.from('communities').upsert(communities);
  if (cErr) console.error('Error inserting communities:', cErr);
  else console.log('✅ Communities seeded');

  // 4. Community Members
  const memberships = [
    { community_id: 'comm-dev', profile_id: 'user-dev', role: 'lead' },
    { community_id: 'comm-cinema', profile_id: 'user-dev', role: 'member' },
    { community_id: 'comm-product', profile_id: 'user-dev', role: 'member' },
    { community_id: 'comm-cinema', profile_id: 'user-editor', role: 'lead' },
    { community_id: 'comm-writers', profile_id: 'user-editor', role: 'member' },
    { community_id: 'comm-writers', profile_id: 'user-writer', role: 'lead' },
    { community_id: 'comm-product', profile_id: 'user-writer', role: 'member' },
    { community_id: 'comm-dev', profile_id: 'user-writer', role: 'member' },
    { community_id: 'comm-product', profile_id: 'user-analyst', role: 'lead' },
    { community_id: 'comm-dev', profile_id: 'user-analyst', role: 'member' },
  ];
  for (const m of memberships) {
    await supabase.from('community_members').upsert(m, { onConflict: 'community_id,profile_id' });
  }
  console.log('✅ Community Memberships seeded');

  // 5. Posts, Reels, and Blogs
  const posts = [
    {
      id: 'post-dev-1',
      author_id: 'user-dev',
      community_id: 'comm-dev',
      title: 'Architecting 60FPS UI Animations with WebGL and React',
      description: 'Breakdown of zero-overhead canvas layers rendering real-time particles with Framer Motion integration. Full GitHub source included in repository.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '5 min read',
      music: '',
      location: 'Tokyo, Japan',
      views: 18400,
      like_count: 730,
      comment_count: 82,
    },
    {
      id: 'post-dev-2',
      author_id: 'user-dev',
      community_id: 'comm-dev',
      title: 'Vite Plugin Architecture & Bundler Optimization Deep-Dive',
      description: 'Why switching our build toolchain reduced cold start times by 78% across 400+ module imports.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '',
      music: '',
      location: 'San Francisco, CA',
      views: 12200,
      like_count: 512,
      comment_count: 39,
    },
    {
      id: 'post-editor-1',
      author_id: 'user-editor',
      community_id: 'comm-cinema',
      title: 'The Colour Grading Process: Kodak 2383 Film Emulation',
      description: 'Cinematic node tree breakdown in DaVinci Resolve. Balancing sub-black roll-off, halation layers, and split-toning in shadow regions.',
      kind: 'reel',
      media_urls: ['/media/reel-1.mp4'],
      poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      duration: '0:32',
      music: 'Original Sound · @aarav.edits',
      location: 'Mumbai, India',
      views: 31400,
      like_count: 1480,
      comment_count: 135,
    },
    {
      id: 'post-editor-2',
      author_id: 'user-editor',
      community_id: 'comm-cinema',
      title: 'Sound Design & Foley Workflow on Indie Sets',
      description: 'Layering low-frequency ambient rumble with directional audio cues to create immediate visceral tension in 30-second trailers.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '7 min read',
      music: '',
      location: 'London, UK',
      views: 19800,
      like_count: 940,
      comment_count: 67,
    },
    {
      id: 'post-writer-1',
      author_id: 'user-writer',
      community_id: 'comm-writers',
      title: 'The Architecture of Modern Essays: Crafting Unforgettable Openings',
      description: 'An exhaustive essay on hook design, rhythmic cadence, sentence modulation, and emotional resonance in digital essays.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '9 min read',
      music: '',
      location: 'Paris, France',
      views: 22400,
      like_count: 1120,
      comment_count: 94,
    },
    {
      id: 'post-writer-2',
      author_id: 'user-writer',
      community_id: 'comm-writers',
      title: 'Blogging vs Micro-Content: Why Audience Attention is Polarizing',
      description: 'Observations across 50,000 readers: Why audiences either want 30-second reels or 2,500-word deep dives.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '',
      music: '',
      location: 'Berlin, Germany',
      views: 16700,
      like_count: 830,
      comment_count: 72,
    },
    {
      id: 'post-analyst-1',
      author_id: 'user-analyst',
      community_id: 'comm-product',
      title: 'Creator Economy 2026: Cohort Retention & Monetization Playbook',
      description: 'Analyzing LTV to CAC ratios, churn velocity, and tipping mechanics across top 100 creator collectives on Amerigam.',
      kind: 'blog',
      media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '6 min read',
      music: '',
      location: 'New York, NY',
      views: 26800,
      like_count: 1350,
      comment_count: 110,
    },
    {
      id: 'post-analyst-2',
      author_id: 'user-analyst',
      community_id: 'comm-product',
      title: 'Community Network Effects: A Quantitative Modeling Approach',
      description: 'How organic peer recommendations lower customer acquisition costs by 4.2x in specialized vertical communities.',
      kind: 'post',
      media_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'],
      poster_url: null,
      duration: '',
      music: '',
      location: 'Singapore',
      views: 14100,
      like_count: 670,
      comment_count: 45,
    },
  ];

  const { error: poErr } = await supabase.from('posts').upsert(posts);
  if (poErr) console.error('Error inserting posts:', poErr);
  else console.log('✅ Posts, Reels & Blogs seeded');

  // 6. Stories
  const now = Date.now();
  const stories = [
    {
      id: 'story-aarav',
      author_id: 'user-editor',
      media_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1080&q=80',
      media_type: 'image',
      caption: 'Grading the new indie documentary sequence ✨',
      expires_at: new Date(now + 24 * 3600000).toISOString(),
    },
    {
      id: 'story-elena',
      author_id: 'user-writer',
      media_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1080&q=80',
      media_type: 'image',
      caption: 'Watercolor pigments and creative essays.',
      expires_at: new Date(now + 24 * 3600000).toISOString(),
    },
    {
      id: 'story-alex',
      author_id: 'user-dev',
      media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
      media_type: 'image',
      caption: 'Midnight neon vibes & WebGL testing.',
      expires_at: new Date(now + 24 * 3600000).toISOString(),
    },
    {
      id: 'story-khyatish',
      author_id: 'user-analyst',
      media_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80',
      media_type: 'image',
      caption: 'Creator economy benchmark metrics review.',
      expires_at: new Date(now + 24 * 3600000).toISOString(),
    },
  ];

  const { error: sErr } = await supabase.from('stories').upsert(stories);
  if (sErr) console.error('Error inserting stories:', sErr);
  else console.log('✅ Stories seeded');

  // 7. Comments
  const comments = [
    {
      id: 'comment-seed-1',
      post_id: 'post-editor-1',
      author_id: 'user-dev',
      content: 'The shadow rolloff on this Kodak emulation is sublime! Are you doing this in ACES or DWG?',
    },
    {
      id: 'comment-seed-2',
      post_id: 'post-editor-1',
      author_id: 'user-writer',
      content: 'The texture feels tactile and organic. Inspiring work Aarav!',
    },
    {
      id: 'comment-seed-3',
      post_id: 'post-dev-1',
      author_id: 'user-analyst',
      content: 'WebGL canvas layer integration benchmarks look really promising. What is the memory footprint on mobile?',
    },
    {
      id: 'comment-seed-4',
      post_writer_1: 'user-writer',
      post_id: 'post-writer-1',
      author_id: 'user-editor',
      content: 'The rhythmic cadence in your opening paragraph sets the bar high.',
    },
  ];

  const { error: comErr } = await supabase.from('post_comments').upsert(comments.map(({ post_writer_1, ...rest }) => rest));
  if (comErr) console.error('Error inserting comments:', comErr);
  else console.log('✅ Comments seeded');

  console.log('🎉 Seed completed successfully!');
}

seed().catch(console.error);
