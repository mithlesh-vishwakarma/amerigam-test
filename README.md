# Amerigam — Next.js + Supabase assessment MVP

A full-stack Next.js and React implementation of the supplied Amerigam reference screens. The frontend uses React App Router pages; Node.js route handlers expose the post and engagement APIs; Supabase supplies authentication, PostgreSQL persistence, and media storage.

## Project structure

```
app/                       # React pages and Node.js API route handlers
  api/posts/               # Post creation, list, and like endpoints
  home, feed, search.../   # Connected Amerigam navigation pages
components/                # Reusable navigation, feed, media and post components
lib/supabase/              # Browser and server Supabase clients
supabase/migrations/       # Version-controlled PostgreSQL, RLS and Storage setup
public/                    # Static assets (add brand-owned assets here)
package.json               # Next.js developer commands
```

## Run

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Apply `supabase/migrations/20261016_amerigam.sql` in the Supabase SQL editor (or with the Supabase CLI), then populate `.env.local` with the project URL and anon key. Open `http://localhost:3000`.

## Implemented

- Reference-inspired Home, Feed, Explore, Competitions, Create, Messages and Notification interfaces, connected with Next links.
- Post, Reel and Blog creation screen with previews, type-specific validation, Supabase Storage upload, and Node API publishing.
- Supabase PostgreSQL tables for profiles, posts, likes and comments, with RLS policies and database-level unique likes.
- Node-runtime route handlers for live post listing, creation, and likes.

## Notes

The supplied screenshots remain the visual source of truth. Demo content displays until Supabase contains live posts, so the UI remains reviewable before credentials are configured. Messages, notifications and competitions currently have reference-quality UI and realistic empty/demo states; their database models and live APIs are intentionally not claimed as implemented.
