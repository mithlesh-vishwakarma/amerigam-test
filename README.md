# Amerigam — React (Vite) + Node.js (Express)

A clean, full-stack separation of the Amerigam platform featuring an immersive vertical Reel video player, interactive floating navigation pill, 3-column independent scrolling desktop layout, and RESTful API backend.

## Project Structure

```
amerigam-test/
├── frontend/                  # React 19 + Vite 8 Client
│   ├── public/                # Static assets (Amerigam logo, 4 local reel MP4s)
│   ├── src/
│   │   ├── components/        # AppShell, ReelFeed, FloatingPillNav, PostCard, etc.
│   │   ├── pages/             # HomePage, FeedPage, SearchPage, CompetitionsPage, etc.
│   │   ├── lib/               # Types, demo posts, and Supabase client
│   │   ├── styles/            # globals.css, home-ui.css
│   │   ├── App.tsx            # React Router 7 setup
│   │   └── main.tsx           # Vite entry point
│   ├── index.html
│   ├── vite.config.ts         # Proxy: /api -> http://localhost:5000
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                   # Node.js + Express REST API
│   ├── src/
│   │   └── index.ts           # Express server (/api/posts, /api/posts/:id/like)
│   ├── tsconfig.json
│   └── package.json
│
├── supabase/                  # PostgreSQL migrations and schema
└── package.json               # Monorepo root workspace scripts
```

## Running the Application

### Option A: Run Both Frontend & Backend Concurrently
From the root directory:
```powershell
npm run dev
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

### Option B: Run Individually
```powershell
# Run backend only (port 5000)
npm run dev:backend

# Run frontend only (port 3000)
npm run dev:frontend
```
