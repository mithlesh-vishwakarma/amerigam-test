create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  role text default 'Creator',
  created_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, username, display_name) values (new.id, coalesce(split_part(new.email, '@', 1), new.id::text), coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create table public.posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100), description text not null default '',
  kind text not null check (kind in ('post','reel','blog')), media_urls text[] not null default '{}', views integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.likes (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(post_id,user_id));
create table public.comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, author_id uuid not null references public.profiles(id) on delete cascade, body text not null check(char_length(body) between 1 and 500), created_at timestamptz not null default now());
alter table public.profiles enable row level security; alter table public.posts enable row level security; alter table public.likes enable row level security; alter table public.comments enable row level security;
create policy "public profiles" on public.profiles for select using (true); create policy "public posts" on public.posts for select using (true); create policy "public likes" on public.likes for select using (true); create policy "public comments" on public.comments for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid()=id); create policy "users create posts" on public.posts for insert with check (auth.uid()=author_id); create policy "users update posts" on public.posts for update using(auth.uid()=author_id); create policy "users delete posts" on public.posts for delete using(auth.uid()=author_id); create policy "users like" on public.likes for insert with check(auth.uid()=user_id); create policy "users unlike" on public.likes for delete using(auth.uid()=user_id); create policy "users comment" on public.comments for insert with check(auth.uid()=author_id); create policy "users delete own comments" on public.comments for delete using(auth.uid()=author_id);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('post-media','post-media',true,8388608,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']);
create policy "authenticated upload media" on storage.objects for insert to authenticated with check (bucket_id='post-media' and (storage.foldername(name))[1]=auth.uid()::text); create policy "public read media" on storage.objects for select using (bucket_id='post-media');
