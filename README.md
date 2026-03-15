# PoetryPond

> *where words drift freely*

A minimal, beautifully dark website for anonymous poem submission and random discovery. No accounts. No algorithms. Just poems, floating in a shared pool.

![PoetryPond Home](https://github.com/user-attachments/assets/52349fa4-b39e-4d46-b8f4-f928984f464a)

## Features

- **Submit a Poem** — anonymous or named, up to 2000 characters, protected by Cloudflare Turnstile
- **Discover** — a random poem from the shared pool, with a "This moved me" button
- **Poems That Moved People** — poems gently elevated by appreciation signals
- **Your Poems** — poems you've submitted, stored in `localStorage` per device
- **Unique shareable URLs** — each poem gets a `/p/{slug}` permalink
- **Permanently stored** in Supabase Postgres

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (spam protection)
- [nanoid](https://github.com/ai/nanoid) (slug generation)
- Deploy on [Vercel](https://vercel.com/)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jjm578/PoetryPond.git
cd PoetryPond
npm install
```

### 2. Set up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Copy your project URL and keys

### 3. Set up Cloudflare Turnstile (optional)

1. Go to [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) and create a widget
2. Set the site key and secret key in your environment variables

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — omit to disable captcha in development
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

```sql
-- poems table
id          uuid  primary key
slug        text  unique (used in /p/{slug} URLs)
text        text  max 2000 chars
author_name text  nullable
is_anonymous boolean
created_at  timestamptz

-- poem_appreciations table
id          uuid  primary key
poem_id     uuid  → poems.id
session_id  text  (browser-generated anonymous identifier)
created_at  timestamptz
-- unique(poem_id, session_id) prevents duplicate appreciations
```

## Deploy on Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com/)
2. Add the environment variables in Vercel's project settings
3. Deploy!

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/poems` | Submit a new poem |
| `GET` | `/api/poems/random` | Get a random poem |
| `GET` | `/api/poems/:slug` | Get a poem by slug |
| `POST` | `/api/poems/:slug/appreciate` | Record "moved me" for a poem |
| `GET` | `/api/poems/moved` | Get poems with appreciations |

## License

MIT
