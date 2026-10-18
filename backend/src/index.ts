import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getProfiles,
  getProfileById,
  updateProfile,
  getFollowingIds,
  toggleFollow,
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  toggleJoinCommunity,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostSave,
  incrementPostViews,
  incrementPostShares,
  getPostComments,
  addPostComment,
  getStories,
  createStory,
  deleteStory,
  PostRecord,
  StoryRecord,
  CommunityRecord,
} from './db';
import { upload } from './upload';
import { getApiDocsHtml } from './docs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static media uploads with byte range support for smooth video streaming
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use(
  '/uploads',
  express.static(uploadsDir, {
    acceptRanges: true,
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    },
  })
);

// Fallback for media uploaded to remote Render production instance
app.use('/uploads/:filename', (req, res) => {
  const remoteUrl = `https://amerigam-test.onrender.com/uploads/${req.params.filename}`;
  return res.redirect(302, remoteUrl);
});

// ============================================================================
// SYSTEM & DOCS
// ============================================================================
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AMERIGAM API is running',
    status: 'healthy',
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AMERIGAM API is running',
    docs: '/api/docs',
    status: 'healthy',
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'amerigam-backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getApiDocsHtml());
});

app.get('/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getApiDocsHtml());
});

// ============================================================================
// MEDIA UPLOAD
// ============================================================================
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Failed to upload file' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Expected form field "file"' });
    }

    // Construct absolute and relative URLs
    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    res.status(201).json({
      url: relativeUrl,
      full_url: fullUrl,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  });
});

// ============================================================================
// PROFILES & FOLLOWS
// ============================================================================
app.get('/api/profiles', async (_req, res) => {
  try {
    const profiles = await getProfiles();
    res.json({ items: profiles });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch profiles' });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const following = await getFollowingIds(req.params.id);
    res.json({ profile, following_count: following.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

app.put('/api/profiles/:id', async (req, res) => {
  try {
    const updated = await updateProfile(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

app.get('/api/profiles/:id/following', async (req, res) => {
  try {
    const followingIds = await getFollowingIds(req.params.id);
    res.json({ following: followingIds });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch following' });
  }
});

app.post('/api/profiles/:id/follow', async (req, res) => {
  try {
    const { follower_id } = req.body;
    if (!follower_id) {
      return res.status(400).json({ error: 'follower_id is required' });
    }
    const result = await toggleFollow(follower_id, req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle follow' });
  }
});

// ============================================================================
// STORIES (FILTERED BY FOLLOWING RELATIONSHIP)
// ============================================================================
app.get('/api/stories', async (req, res) => {
  try {
    const viewerId = req.query.viewer_id as string | undefined;
    const stories = await getStories(viewerId);
    res.json({ items: stories });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch stories' });
  }
});

app.post('/api/stories', async (req, res) => {
  try {
    const { author_id, media_url, media_type = 'image', caption = '', text_overlay = '', filter = 'none' } = req.body;
    if (!author_id || !media_url) {
      return res.status(400).json({ error: 'author_id and media_url are required' });
    }

    const newStory: StoryRecord = {
      id: `story-${Date.now()}`,
      author_id,
      media_url,
      media_type,
      caption,
      text_overlay,
      filter,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
    };

    const created = await createStory(newStory);
    res.status(201).json({ story: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create story' });
  }
});

app.delete('/api/stories/:id', async (req, res) => {
  try {
    const success = await deleteStory(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete story' });
  }
});

// ============================================================================
// COMMUNITIES
// ============================================================================
app.get('/api/communities', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const q = (req.query.q || req.query.search || '') as string;
    const viewer_id = req.query.viewer_id as string | undefined;
    const comms = await getCommunities({ category, q, viewer_id });
    res.json({ items: comms, count: comms.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch communities' });
  }
});

app.get('/api/communities/:id', async (req, res) => {
  try {
    const community = await getCommunityById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    // Fetch posts belonging to this community
    const posts = await getPosts({ community_id: req.params.id });
    res.json({ community, posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch community' });
  }
});

app.post('/api/communities', async (req, res) => {
  try {
    const { name, handle, category, avatar, banner, description, tags = [] } = req.body;
    if (!name || !handle || !category) {
      return res.status(400).json({ error: 'name, handle, and category are required' });
    }
    const newComm: CommunityRecord = {
      id: `comm-${Date.now()}`,
      name,
      handle,
      category,
      avatar: avatar || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=140&q=80',
      banner: banner || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      members_count: '1 member',
      member_count_num: 1,
      description: description || '',
      tags,
      created_at: new Date().toISOString(),
    };
    const created = await createCommunity(newComm);
    res.status(201).json({ community: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create community' });
  }
});

app.put('/api/communities/:id', async (req, res) => {
  try {
    const updated = await updateCommunity(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Community not found' });
    }
    res.json({ community: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update community' });
  }
});

app.delete('/api/communities/:id', async (req, res) => {
  try {
    const success = await deleteCommunity(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Community not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete community' });
  }
});

app.post('/api/communities/:id/join', async (req, res) => {
  try {
    const { profile_id } = req.body;
    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }
    const result = await toggleJoinCommunity(req.params.id, profile_id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle join' });
  }
});

// ============================================================================
// POSTS, REELS & BLOGS
// ============================================================================
app.get('/api/posts', async (req, res) => {
  try {
    const {
      kind,
      community_id,
      author_id,
      q,
      search,
      feed_type,
      viewer_id,
      limit,
      offset,
      post_type,
    } = req.query;

    const posts = await getPosts({
      kind: kind as any,
      community_id: community_id as string,
      author_id: author_id as string,
      q: ((q || search || '') as string).trim(),
      feed_type: feed_type as any,
      viewer_id: viewer_id as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      post_type: post_type as any,
    });

    res.json({ items: posts, count: posts.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch posts' });
  }
});

// ============================================================================
// GLOBAL SEARCH (POSTS, COMMUNITIES, PROFILES)
// ============================================================================
app.get('/api/search', async (req, res) => {
  try {
    const q = ((req.query.q || req.query.search || '') as string).trim();
    const viewerId = req.query.viewer_id as string | undefined;

    if (!q) {
      return res.json({ posts: [], communities: [], profiles: [] });
    }

    const [posts, communities, allProfiles] = await Promise.all([
      getPosts({ q, viewer_id: viewerId, limit: 30 }),
      getCommunities({ q, viewer_id: viewerId }),
      getProfiles(),
    ]);

    const qLower = q.toLowerCase();
    const profiles = allProfiles.filter(
      (p) =>
        p.display_name.toLowerCase().includes(qLower) ||
        p.username.toLowerCase().includes(qLower) ||
        p.role.toLowerCase().includes(qLower) ||
        p.bio.toLowerCase().includes(qLower) ||
        (p.skills && p.skills.some((s) => s.toLowerCase().includes(qLower)))
    );

    res.json({
      query: q,
      posts,
      communities,
      profiles,
      counts: {
        posts: posts.length,
        communities: communities.length,
        profiles: profiles.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const viewerId = req.query.viewer_id as string | undefined;
    const post = await getPostById(req.params.id, viewerId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const comments = await getPostComments(req.params.id);
    res.json({ post, comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch post' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const {
      title,
      description,
      kind = 'post',
      media_urls = [],
      poster_url,
      duration = '0:30',
      music = '',
      location = '',
      collaborators = [],
      is_ai_labeled = false,
      hide_stats = false,
      community_id,
      author_id = 'user-dev',
      post_type = 'field',
      field_tag,
      hobby_tag,
      is_ad = false,
      sponsor_name,
      ad_cta_label,
      ad_cta_url,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newPost: PostRecord = {
      id: `post-${Date.now()}`,
      author_id,
      community_id,
      title,
      description: description || '',
      kind,
      media_urls,
      poster_url,
      duration,
      music,
      location,
      collaborators,
      is_ai_labeled,
      hide_stats,
      views: 1,
      like_count: 0,
      comment_count: 0,
      post_type,
      field_tag,
      hobby_tag,
      is_ad,
      sponsor_name,
      ad_cta_label,
      ad_cta_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await createPost(newPost);
    res.status(201).json({ post: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const updated = await updatePost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const success = await deletePost(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete post' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { profile_id = 'user-dev' } = req.body;
    const result = await togglePostLike(req.params.id, profile_id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle like' });
  }
});

app.post('/api/posts/:id/save', async (req, res) => {
  try {
    const { profile_id = 'user-dev' } = req.body;
    const result = await togglePostSave(req.params.id, profile_id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle save' });
  }
});

app.post('/api/posts/:id/view', async (req, res) => {
  try {
    const result = await incrementPostViews(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register view' });
  }
});

app.post('/api/posts/:id/share', async (req, res) => {
  try {
    const result = await incrementPostShares(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register share' });
  }
});

app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await getPostComments(req.params.id);
    res.json({ items: comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch comments' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { author_id = 'user-dev', content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    const comment = await addPostComment(req.params.id, author_id, content.trim());
    res.status(201).json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add comment' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Amerigam Backend API running on http://localhost:${PORT}`);
  console.log(`📚 Interactive API Docs available at http://localhost:${PORT}/api/docs`);
});
