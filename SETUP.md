# Halifax Private Banking — Secure Setup Guide

## 1. Create a Supabase project

1. Create a new Supabase project at https://supabase.com
2. Open **Authentication** and enable email/password authentication
3. Open **SQL Editor** and run the migration files in this order:
   - `supabase/migrations/001_initial_schema.sql` for legacy/demo compatibility
   - `supabase/migrations/002_production_schema.sql` for the production-ready database layout
4. Open **Settings → API** and copy the **Project URL** and **anon/public key**

## 2. Configure local environment variables

```bash
cp .env.example .env.local
```

Then fill in the values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_ADMIN_PASSWORD=use-a-long-random-password
NEXT_PUBLIC_ADMIN_PIN=123456
```

Important:
- `NEXT_PUBLIC_DEMO_MODE` should only be `true` for local demo testing.
- Never commit `.env.local` or production credentials to GitHub.
- A production app should use Supabase Auth with secure RLS and service-side checks instead of browser-side credential checks.

## 3. Run locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## 4. Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add the same environment variables to Vercel project settings
4. Deploy

## Security note

The app previously used hardcoded admin credentials and client-side credential checks. Those practices are no longer suitable for a real system. This repository has been updated to require explicit environment configuration and to support a production-safe Supabase schema. Use Supabase Auth + RLS for final production deployment.
