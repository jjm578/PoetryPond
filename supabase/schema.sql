-- PoetryPond Database Schema
-- Run this in your Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists poems (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  text text not null check (char_length(text) <= 2000),
  author_name text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists poem_appreciations (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references poems(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  unique(poem_id, session_id)
);

-- Index for random poem queries
create index if not exists poems_created_at_idx on poems(created_at);

-- Index for appreciations lookup
create index if not exists appreciations_poem_id_idx on poem_appreciations(poem_id);
create index if not exists appreciations_session_poem_idx on poem_appreciations(session_id, poem_id);

-- Enable Row Level Security
alter table poems enable row level security;
alter table poem_appreciations enable row level security;

-- Policies: anyone can read poems
create policy "poems_select" on poems for select using (true);

-- Anyone can insert poems (anon key allowed)
create policy "poems_insert" on poems for insert with check (true);

-- Anyone can read appreciations
create policy "appreciations_select" on poem_appreciations for select using (true);

-- Anyone can insert appreciations
create policy "appreciations_insert" on poem_appreciations for insert with check (true);
