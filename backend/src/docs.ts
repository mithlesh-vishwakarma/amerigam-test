export function getApiDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amerigam Backend API Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0c10;
      --card-bg: #14161f;
      --border: #222533;
      --accent: #00a8ed;
      --accent-glow: rgba(0, 168, 237, 0.25);
      --text: #e6e7ee;
      --muted: #8b8e9f;
      --get: #10b981;
      --post: #0077e6;
      --put: #f59e0b;
      --delete: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.5;
      padding: 0;
      display: flex;
      min-height: 100vh;
    }
    aside {
      width: 280px;
      background: #0f1017;
      border-right: 1px solid var(--border);
      padding: 24px 16px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 19px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .brand-title span { color: var(--accent); }
    .brand-sub { font-size: 12px; color: var(--muted); margin-bottom: 24px; }
    .nav-group-title { font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.08em; margin: 18px 8px 8px; font-weight: 700; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      color: #c0c3d4;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      margin-bottom: 2px;
    }
    .nav-link:hover { background: #181a24; color: #fff; }
    .method-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
    }
    .method-tag.get { background: rgba(16, 185, 129, 0.15); color: var(--get); border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-tag.post { background: rgba(0, 119, 230, 0.15); color: #38bdf8; border: 1px solid rgba(0, 119, 230, 0.3); }
    .method-tag.put { background: rgba(245, 158, 11, 0.15); color: var(--put); border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-tag.delete { background: rgba(239, 68, 68, 0.15); color: var(--delete); border: 1px solid rgba(239, 68, 68, 0.3); }

    main {
      flex: 1;
      padding: 40px 48px;
      max-width: 1000px;
    }
    .hero-banner {
      background: linear-gradient(135deg, rgba(0, 168, 237, 0.1) 0%, rgba(20, 22, 31, 0.95) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 36px;
    }
    .hero-banner h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
    .hero-banner p { color: var(--muted); font-size: 14px; max-width: 650px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      margin-top: 14px;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 36px 0 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .endpoint-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      background: #171924;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
    }
    .endpoint-desc { font-size: 13px; color: var(--muted); margin: 0; }
    .try-btn {
      background: #0077e6;
      border: 0;
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .try-btn:hover { background: #0066cc; }
    .endpoint-body {
      padding: 20px;
    }
    .param-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 10px;
      margin-bottom: 16px;
    }
    .param-table th {
      text-align: left;
      padding: 8px 10px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      text-transform: uppercase;
    }
    .param-table td {
      padding: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .param-name { font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-weight: 600; font-size: 12px; }
    .param-type { font-family: 'JetBrains Mono', monospace; color: #a78bfa; font-size: 11px; }
    pre {
      background: #0b0c10;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #cbd5e1;
      margin-top: 8px;
    }
    .response-preview {
      margin-top: 14px;
      display: none;
    }
    .response-preview.active { display: block; }
    .response-header {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <aside>
    <div class="brand-title">
      <span>✦</span> Amerigam API
    </div>
    <div class="brand-sub">REST Endpoints & Documentation</div>

    <div class="nav-group-title">System</div>
    <a href="#root" class="nav-link"><span class="method-tag get">GET</span> /</a>
    <a href="#health" class="nav-link"><span class="method-tag get">GET</span> /api/health</a>
    <a href="#docs" class="nav-link"><span class="method-tag get">GET</span> /api/docs</a>

    <div class="nav-group-title">Profiles & Social</div>
    <a href="#get-profiles" class="nav-link"><span class="method-tag get">GET</span> /api/profiles</a>
    <a href="#get-profile" class="nav-link"><span class="method-tag get">GET</span> /api/profiles/:id</a>
    <a href="#follow-profile" class="nav-link"><span class="method-tag post">POST</span> .../follow</a>
    <a href="#get-following" class="nav-link"><span class="method-tag get">GET</span> .../following</a>

    <div class="nav-group-title">Stories (Isolated)</div>
    <a href="#get-stories" class="nav-link"><span class="method-tag get">GET</span> /api/stories</a>
    <a href="#post-story" class="nav-link"><span class="method-tag post">POST</span> /api/stories</a>

    <div class="nav-group-title">Posts, Reels & Blogs</div>
    <a href="#get-posts" class="nav-link"><span class="method-tag get">GET</span> /api/posts</a>
    <a href="#create-post" class="nav-link"><span class="method-tag post">POST</span> /api/posts</a>
    <a href="#get-post-id" class="nav-link"><span class="method-tag get">GET</span> /api/posts/:id</a>
    <a href="#like-post" class="nav-link"><span class="method-tag post">POST</span> .../like</a>
    <a href="#comments-post" class="nav-link"><span class="method-tag get">GET</span> .../comments</a>

    <div class="nav-group-title">Communities</div>
    <a href="#get-communities" class="nav-link"><span class="method-tag get">GET</span> /api/communities</a>
    <a href="#get-comm-id" class="nav-link"><span class="method-tag get">GET</span> /api/communities/:id</a>
    <a href="#join-community" class="nav-link"><span class="method-tag post">POST</span> .../join</a>

    <div class="nav-group-title">Media Storage</div>
    <a href="#upload-media" class="nav-link"><span class="method-tag post">POST</span> /api/upload</a>
  </aside>

  <main>
    <div class="hero-banner">
      <h1>Amerigam Backend API</h1>
      <p>High-performance CRUD API powering user profiles, role-tailored feeds, follower-filtered stories, specialized communities, and high-resolution video/image uploads.</p>
      <div class="status-badge">
        <span class="status-dot"></span>
        API Online & Ready · Port 5000
      </div>
    </div>

    <!-- SYSTEM -->
    <h2 class="section-title">System & Health API</h2>

    <div class="endpoint-card" id="root">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag get">GET</span>
          <span>/</span>
        </div>
        <p class="endpoint-desc">Root Health Ping for Render & Deployment Monitoring</p>
        <button class="try-btn" onclick="testEndpoint('/', 'res-root')">Try Endpoint</button>
      </div>
      <div class="endpoint-body">
        <p style="font-size:13px; color:#cbd5e1;">Returns immediate HTTP 200 with service health status for zero-downtime platform health probes.</p>
        <div class="response-preview" id="res-root">
          <div class="response-header">Live Server Response:</div>
          <pre><code>Loading...</code></pre>
        </div>
      </div>
    </div>

    <!-- STORIES -->
    <h2 class="section-title">Stories API (Following Graph Enforced)</h2>

    <div class="endpoint-card" id="get-stories">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag get">GET</span>
          <span>/api/stories</span>
        </div>
        <p class="endpoint-desc">Fetch 24h stories strictly filtered by viewer follow status</p>
        <button class="try-btn" onclick="testEndpoint('/api/stories?viewer_id=user-dev', 'res-stories')">Try Endpoint</button>
      </div>
      <div class="endpoint-body">
        <p style="font-size:13px; color:#cbd5e1;"><strong>Security Rule:</strong> If <code>viewer_id</code> is provided, stories from non-followed creators are strictly omitted. Only active stories from followed users and the viewer's own story are returned.</p>
        <table class="param-table">
          <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td class="param-name">viewer_id</td><td class="param-type">query string</td><td>Active viewer profile id (e.g. <code>user-dev</code>)</td></tr>
          </tbody>
        </table>
        <div class="response-preview" id="res-stories">
          <div class="response-header">Live Server Response:</div>
          <pre><code>Loading...</code></pre>
        </div>
      </div>
    </div>

    <div class="endpoint-card" id="post-story">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag post">POST</span>
          <span>/api/stories</span>
        </div>
        <p class="endpoint-desc">Publish a 24-hour ephemeral story (Strictly isolated from feed posts)</p>
      </div>
      <div class="endpoint-body">
        <p style="font-size:13px; color:#cbd5e1;">Creates an ephemeral story expiring in 24 hours. Does not pollute the public post feed.</p>
        <pre><code>// Request Body JSON
{
  "author_id": "user-dev",
  "media_url": "https://images.unsplash.com/photo-...",
  "media_type": "image", // or "video"
  "caption": "Working on WebGL pipeline",
  "filter": "vibrant"
}</code></pre>
      </div>
    </div>

    <!-- POSTS -->
    <h2 class="section-title">Posts, Reels & Blogs API</h2>

    <div class="endpoint-card" id="get-posts">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag get">GET</span>
          <span>/api/posts</span>
        </div>
        <p class="endpoint-desc">Query posts, reels, and blogs with search, kind & feed filters</p>
        <button class="try-btn" onclick="testEndpoint('/api/posts?limit=3', 'res-posts')">Try Endpoint</button>
      </div>
      <div class="endpoint-body">
        <table class="param-table">
          <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td class="param-name">kind</td><td class="param-type">query string</td><td>Filter: <code>post</code>, <code>reel</code>, or <code>blog</code></td></tr>
            <tr><td class="param-name">q</td><td class="param-type">query string</td><td>Full-text search keyword across titles, descriptions & locations</td></tr>
            <tr><td class="param-name">community_id</td><td class="param-type">query string</td><td>Filter by community hub (e.g. <code>comm-dev</code>)</td></tr>
            <tr><td class="param-name">feed_type</td><td class="param-type">query string</td><td><code>for_you</code>, <code>communities</code>, or <code>network</code></td></tr>
            <tr><td class="param-name">viewer_id</td><td class="param-type">query string</td><td>Profile ID of the viewing user for like state and personalized feed</td></tr>
          </tbody>
        </table>
        <div class="response-preview" id="res-posts">
          <div class="response-header">Live Server Response:</div>
          <pre><code>Loading...</code></pre>
        </div>
      </div>
    </div>

    <div class="endpoint-card" id="create-post">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag post">POST</span>
          <span>/api/posts</span>
        </div>
        <p class="endpoint-desc">Create a new post, video reel, or technical blog</p>
      </div>
      <div class="endpoint-body">
        <pre><code>// Request Body JSON
{
  "title": "Architecting Zero-Overhead Canvas Layers",
  "description": "WebGL particles integrated with Framer Motion.",
  "kind": "post", // "post" | "reel" | "blog"
  "media_urls": ["/uploads/demo.jpg"],
  "location": "Tokyo, Japan",
  "collaborators": ["@aarav.edits"],
  "community_id": "comm-dev",
  "author_id": "user-dev"
}</code></pre>
      </div>
    </div>

    <!-- PROFILES & FOLLOWS -->
    <h2 class="section-title">Profiles & Social Graph</h2>

    <div class="endpoint-card" id="get-profiles">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag get">GET</span>
          <span>/api/profiles</span>
        </div>
        <p class="endpoint-desc">List all 4 domain creator profiles</p>
        <button class="try-btn" onclick="testEndpoint('/api/profiles', 'res-profiles')">Try Endpoint</button>
      </div>
      <div class="endpoint-body">
        <div class="response-preview" id="res-profiles">
          <div class="response-header">Live Server Response:</div>
          <pre><code>Loading...</code></pre>
        </div>
      </div>
    </div>

    <div class="endpoint-card" id="follow-profile">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag post">POST</span>
          <span>/api/profiles/:id/follow</span>
        </div>
        <p class="endpoint-desc">Toggle follow / unfollow on a creator</p>
      </div>
      <div class="endpoint-body">
        <p style="font-size:13px; color:#cbd5e1;">Body: <code>{ "follower_id": "user-dev" }</code>. Dynamically controls story visibility and network feed inclusion.</p>
      </div>
    </div>

    <!-- COMMUNITIES -->
    <h2 class="section-title">Communities Hub</h2>

    <div class="endpoint-card" id="get-communities">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag get">GET</span>
          <span>/api/communities</span>
        </div>
        <p class="endpoint-desc">List all 4 Specialized Creator Hubs with member stats</p>
        <button class="try-btn" onclick="testEndpoint('/api/communities', 'res-comms')">Try Endpoint</button>
      </div>
      <div class="endpoint-body">
        <div class="response-preview" id="res-comms">
          <div class="response-header">Live Server Response:</div>
          <pre><code>Loading...</code></pre>
        </div>
      </div>
    </div>

    <!-- UPLOAD -->
    <h2 class="section-title">Media Storage Upload</h2>

    <div class="endpoint-card" id="upload-media">
      <div class="endpoint-header">
        <div class="endpoint-left">
          <span class="method-tag post">POST</span>
          <span>/api/upload</span>
        </div>
        <p class="endpoint-desc">Upload image or video files with static streaming</p>
      </div>
      <div class="endpoint-body">
        <p style="font-size:13px; color:#cbd5e1;">Content-Type: <code>multipart/form-data</code> with field name <code>file</code>. Supports mp4, webm, webp, png, jpeg up to 80MB. Returns static public URL ready for DB storage.</p>
      </div>
    </div>
  </main>

  <script>
    async function testEndpoint(url, targetId) {
      const container = document.getElementById(targetId);
      container.classList.add('active');
      const codeBlock = container.querySelector('code');
      codeBlock.textContent = 'Fetching from ' + url + '...';
      try {
        const res = await fetch(url);
        const data = await res.json();
        codeBlock.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        codeBlock.textContent = 'Error: ' + err.message;
      }
    }
  </script>
</body>
</html>`;
}
