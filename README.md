# Amerigam — Social network & Creator Platform

<div align="center">

![Amerigam Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&h=400&q=80)

**A modern, full-stack creator platform combining vertical 9:16 video reels, interactive social feeds, communities, 24-hour stories, and a RESTful API with Supabase PostgreSQL.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-blue)](#)

[Features](#-key-features) • [Architecture](#-project-architecture) • [Quickstart](#-quickstart--installation) • [Environment Variables](#-environment-configuration) • [API Documentation](#-api-endpoints-reference) • [Database Setup](#-database--supabase-setup) • [Deployment](#-deployment)

</div>

---

## 🌟 Key Features

### 🎬 Frontend Experience (React 19 + Vite 8)
- **Vertical Reel Video Engine**: Fullscreen 9:16 vertical video feed with intersection-observer auto-play/pause on scroll, loop playback, volume toggle, animated double-tap hearts, and real-time like/save counters.
- **Floating Pill Navigation**: Glassmorphic, floating pill nav positioned for rapid switching between **Reels**, **Feed**, and **Explore** with fluid micro-animations.
- **3-Column Desktop Layout**: Left navigation panel with authenticated user pill, center independent scrollable feed, and dynamic right sidebar featuring trending communities, active competitions, and suggested creators.
- **Multi-Format Feed**: Filter seamlessly between **All**, **Reels**, **Posts**, and **Blogs**.
- **24-Hour Stories Carousel**: Dynamic story trays with animated gradient rings, timed progress bars, custom filters, and following-based story filtering.
- **Content Creation Studio**: Create and publish rich media with drag-and-drop upload for images and MP4 videos, custom captioning, tag selection, AI-content disclosure badge, audio attribution, and community target selection.
- **Omni-Search & Discovery**: Instant search across Posts, Communities, and Creator Profiles filtered by professional roles (*Developer*, *Editor*, *Content Writer*, *Business Analyst*).
- **Interactive Comments Drawer**: Bottom-sheet / modal comment view with real-time comment authoring, timestamps, and avatar integration.

### ⚡ Backend Architecture (Node.js + Express 5)
- **High-Performance REST API**: Modular endpoints handling profiles, posts, communities, stories, comments, likes, bookmarks, views, and follows.
- **Byte-Range Media Streaming**: Static media pipeline with HTTP 206 partial content support for seamless, buffer-free MP4 video playback.
- **Interactive Swagger-Style API Docs**: Self-hosted, dark-themed interactive documentation viewer directly accessible at `/api/docs` and `/docs`.
- **Live Supabase PostgreSQL Integration**: Fully typed database queries with automatic fallback handling and optimistic data structures.
- **Comprehensive Database Seeder**: One-command mock database seeder populating profiles, communities, reels, blog articles, and stories.

---

## 🏗 Project Architecture

```
amerigam-test/
├── frontend/                      # React 19 Client (Vite 8)
│   ├── public/                    # Static assets (logos, local demo reel videos)
│   ├── src/
│   │   ├── components/            # UI components (AppShell, ReelFeed, FloatingPillNav, etc.)
│   │   ├── pages/                 # Route views (HomePage, FeedPage, SearchPage, CreatePage, etc.)
│   │   ├── lib/                   # API client, Supabase client, and TypeScript definitions
│   │   ├── styles/                # Design system tokens and styles (globals.css, home-ui.css)
│   │   ├── App.tsx                # Client-side router configuration (React Router 7)
│   │   └── main.tsx               # Client entry point
│   ├── .env.example               # Frontend environment template
│   ├── vite.config.ts             # Dev proxy config (/api -> http://localhost:5000)
│   └── package.json
│
├── backend/                       # Express 5 REST API
│   ├── src/
│   │   ├── index.ts               # Server entry point, middleware, routes, and error handling
│   │   ├── db.ts                  # Supabase database queries and TypeScript interfaces
│   │   ├── docs.ts                # Built-in interactive HTML API documentation viewer
│   │   ├── seed.ts                # Database seeder script
│   │   └── upload.ts              # Multer configuration for image & video uploads
│   ├── uploads/                   # Local file storage for uploaded media
│   ├── .env.example               # Backend environment template
│   └── package.json
│
├── supabase/                      # Database migrations
│   └── migrations/
│       └── 20261016_amerigam.sql  # Complete schema, tables, triggers, and indexes
│
├── vercel.json                    # Frontend deployment config for Vercel
└── package.json                   # Root monorepo workspace configuration
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.x or v20+ recommended
- **npm**: v9+ (monorepo workspaces enabled)
- **Supabase Account**: Free project on [supabase.com](https://supabase.com) (or local Supabase CLI)

### 1. Clone & Install Dependencies
From the repository root:
```bash
git clone https://github.com/mithlesh-vishwakarma/amerigam-test.git
cd amerigam-test

# Install all dependencies across workspaces (frontend + backend + root)
npm install
```

### 2. Configure Environment Variables

#### Backend Configuration
Create `backend/.env` (or copy from `backend/.env.example`):
```bash
cp backend/.env.example backend/.env
```
Populate the values:
```env
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Frontend Configuration
Create `frontend/.env` (or copy from `frontend/.env.example`):
```bash
cp frontend/.env.example frontend/.env
```
Populate the values:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🗄 Database & Supabase Setup

### 1. Run Migration Schema
Open your **Supabase Dashboard** -> **SQL Editor**, and execute the script found in:
[`supabase/migrations/20261016_amerigam.sql`](file:///d:/Projects/amerigam/amerigam-test/supabase/migrations/20261016_amerigam.sql)

This script will set up all required database tables, relational foreign keys, performance indexes, and counter increment triggers:
- `profiles`: Creator and user accounts, roles, skills, and ratings.
- `communities`: Gaming and developer community hubs with member counts and banner art.
- `posts`: Standard posts, vertical video reels, and long-form blogs.
- `stories`: 24-hour ephemeral stories with filters and captions.
- `post_comments`: Multi-tier discussion comments.
- `follows`: Social following graph.
- `community_members`: Community memberships.
- `post_likes` & `post_saves`: User reaction and bookmark tables.

### 2. Seed Initial Mock Data
Once your schema is applied and backend environment keys are configured, run the seeder:
```bash
# Seed mock users, communities, reels, blogs, and stories
npm run seed
```

---

## 💻 Running the Application

### Option A: Run Full Stack Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Interactive API Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### Option B: Run Services Individually
```bash
# Start backend API server only (port 5000 with hot-reload via tsx)
npm run dev:backend

# Start frontend development server only (port 3000 via Vite)
npm run dev:frontend
```

---

## ⚙️ Environment Configuration

| Variable | Scope | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | HTTP port for Express REST API | `5000` |
| `SUPABASE_URL` | Backend | URL of the Supabase PostgreSQL project | — |
| `SUPABASE_ANON_KEY` | Backend | Public anonymous API key for Supabase client | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Elevated service role key (for administrative actions) | — |
| `VITE_BACKEND_URL` | Frontend | Target backend server URL | `http://localhost:5000` |
| `VITE_API_BASE_URL` | Frontend | Base REST endpoint URL for frontend API client | `http://localhost:5000/api` |
| `VITE_SUPABASE_URL` | Frontend | Client-side Supabase URL | — |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Client-side public Supabase anon key | — |

---

## 📡 API Endpoints Reference

All endpoints are prefixed with `/api` (or visit `/api/docs` in your browser for the full interactive schema tester).

### System & Documentation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API Health summary |
| `GET` | `/api/health` | Health check with timestamp and status |
| `GET` | `/api/docs` | Interactive Swagger-style HTML API documentation |

### Media Upload
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Multipart form upload (`file`). Supports images and MP4 videos up to 100MB |
| `GET` | `/uploads/:filename` | Stream uploaded media with HTTP 206 byte-range streaming support |

### Creator Profiles
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profiles` | List all registered creators |
| `GET` | `/api/profiles/:id` | Fetch creator profile details and follower counts |
| `PUT` | `/api/profiles/:id` | Update profile bio, skills, or avatar |
| `GET` | `/api/profiles/:id/following` | Get list of followed profile IDs |
| `POST` | `/api/profiles/:id/follow` | Toggle follow status (`{ follower_id }`) |

### Communities
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/communities` | List communities (supports `?category=`, `?q=`, `?viewer_id=`) |
| `GET` | `/api/communities/:id` | Get community details and posts |
| `POST` | `/api/communities` | Create a new community |
| `PUT` | `/api/communities/:id` | Update community details |
| `DELETE` | `/api/communities/:id` | Delete a community |
| `POST` | `/api/communities/:id/join` | Toggle community membership (`{ profile_id }`) |

### Posts & Reels
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/posts` | List posts with filters (`?kind=reel\|post\|blog`, `?community_id=`, `?q=`, `?feed_type=`) |
| `GET` | `/api/posts/:id` | Get single post details and comments |
| `POST` | `/api/posts` | Create new post, reel, or blog article |
| `PUT` | `/api/posts/:id` | Update post content |
| `DELETE` | `/api/posts/:id` | Delete post |
| `POST` | `/api/posts/:id/like` | Toggle post like status (`{ profile_id }`) |
| `POST` | `/api/posts/:id/save` | Toggle post bookmark/save status (`{ profile_id }`) |
| `POST` | `/api/posts/:id/view` | Increment view counter |
| `POST` | `/api/posts/:id/share` | Increment share counter |

### Comments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/posts/:id/comments` | Retrieve all comments for a post |
| `POST` | `/api/posts/:id/comments` | Post a new comment (`{ author_id, content }`) |

### Stories (24h Ephemeral)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stories` | Get active stories (optional `?viewer_id=` to filter by follows) |
| `POST` | `/api/stories` | Publish a story (`{ author_id, media_url, caption, filter }`) |
| `DELETE` | `/api/stories/:id` | Delete an active story |

### Global Search
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search?q=:query` | Unified search across Posts, Communities, and Creator Profiles |

---

## 🛠 Available Scripts

From the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts both backend (port 5000) and frontend (port 3000) concurrently |
| `npm run dev:frontend` | Runs Vite dev server for the frontend |
| `npm run dev:backend` | Runs TSX watch server for the backend |
| `npm run seed` | Seeds Supabase database with mock profiles, posts, and communities |
| `npm run build` | Builds the frontend production bundle via Vite |
| `npm run install:all` | Installs root and workspace dependencies |

---

## 🌐 Deployment

### Frontend (Vercel)
The project includes a pre-configured [`vercel.json`](file:///d:/Projects/amerigam/amerigam-test/vercel.json) configured for single-page client routing:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Configure the environment variables:
   - `VITE_BACKEND_URL`: URL of your deployed backend (e.g., `https://amerigam-backend.onrender.com`).
   - `VITE_API_BASE_URL`: `https://amerigam-backend.onrender.com/api`
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
4. Deploy!

### Backend (Render / Railway / VPS)
1. Deploy the `backend/` directory as a Node.js web service.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Supply environment variables in your hosting provider's dashboard (`PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## 📄 License
Private & Proprietary. All rights reserved.
