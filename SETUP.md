# Halifax Private Banking — Setup Guide

## 1. Clone & Install
```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

## 2. Supabase Setup
1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**

## 3. Environment Variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@halifaxbanking.co.uk
NEXT_PUBLIC_ADMIN_PASSWORD=HalifaxSecure2026!
NEXT_PUBLIC_ADMIN_PIN=246810
```

## 4. Run Locally
```bash
npm run dev
```

## 5. Deploy to Vercel
1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables from `.env.local` in Vercel project settings
4. Deploy — Vercel auto-detects Next.js

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Postgres database + real-time)
- **Tailwind CSS** with glassmorphism design system
- **Radix UI** components
- **TypeScript** throughout
