import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory demo store
let posts = [
  {
    id: 'post-1',
    author_id: 'creator-1',
    title: 'Neon architecture and urban reflections',
    description: 'Captured with Sony A7IV and 35mm f/1.4 GM. Tokyo at dusk after light rain.',
    kind: 'post',
    media_urls: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    ],
    views: 14200,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      id: 'creator-1',
      username: 'neilarora',
      display_name: 'Neil Arora',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'Cinematographer',
    },
    like_count: 842,
    comment_count: 53,
    liked: false,
  },
  {
    id: 'post-2',
    author_id: 'creator-2',
    title: 'Urban rhythm & movement in 4K',
    description: 'Quick vertical study on cinematic natural framing and color science. Shot on RED Komodo-X.',
    kind: 'reel',
    media_urls: ['/media/reel-1.mp4', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'],
    views: 38700,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    profiles: {
      id: 'creator-2',
      username: 'aaravk',
      display_name: 'Aarav Kapoor',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      role: 'Director',
    },
    like_count: 2190,
    comment_count: 144,
    liked: false,
  },
  {
    id: 'post-3',
    author_id: 'creator-3',
    title: 'Night city motion & high speed grading',
    description: 'Handheld tracking in the metropolis. Graded with custom Amerigam Film Print emulation.',
    kind: 'reel',
    media_urls: ['/media/reel-2.mp4', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'],
    views: 45200,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    profiles: {
      id: 'creator-3',
      username: 'elena_r',
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      role: 'Colorist & DP',
    },
    like_count: 3410,
    comment_count: 289,
    liked: false,
  },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/posts', (req, res) => {
  res.json({ items: posts });
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ post });
});

app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  post.liked = !post.liked;
  post.like_count = post.liked ? (post.like_count || 0) + 1 : Math.max(0, (post.like_count || 1) - 1);
  res.json({ liked: post.liked, count: post.like_count });
});

app.post('/api/posts', (req, res) => {
  const { title, description, kind = 'post', media_urls = [] } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newPost = {
    id: 'post-' + Date.now(),
    author_id: 'user-me',
    title,
    description: description || '',
    kind,
    media_urls,
    views: 1,
    created_at: new Date().toISOString(),
    profiles: {
      id: 'user-me',
      username: 'you',
      display_name: 'You',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      role: 'Creator',
    },
    like_count: 0,
    comment_count: 0,
    liked: false,
  };
  posts.unshift(newPost);
  res.status(201).json({ post: newPost });
});

app.listen(PORT, () => {
  console.log(`Amerigam Backend API running on http://localhost:${PORT}`);
});
