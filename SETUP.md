# Halifax Private Banking — Supabase Setup

The repository already includes the Supabase client integration in `lib/supabase.ts`, persistence helpers in `lib/storage.ts`, and the database schema in `supabase/migrations/001_initial_schema.sql`.

## 1. Create a Supabase project

1. Create a project at https://supabase.com.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the complete contents of `supabase/migrations/001_initial_schema.sql`.
4. Open **Settings → API** and copy the Project URL and the anon/public key.

## 2. Configure local environment variables

Create a local environment file. The file is intentionally ignored by Git:

```bash
cp .env.example .env.local
```

Replace the placeholders in `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email
NEXT_PUBLIC_ADMIN_PASSWORD=use-a-new-long-random-password
NEXT_PUBLIC_ADMIN_PIN=use-a-new-six-digit-pin
```

Never commit `.env.local`, the Supabase service-role key, or real production credentials.

## 3. Run and verify locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Open `/admin/login`, sign in, create or update a test account, then verify that the record appears in Supabase under **Table Editor**.

If Supabase is unavailable, the app currently falls back to localStorage. That fallback is useful for development but should not be treated as a production data store.

## 4. Configure Vercel

1. Import this GitHub repository into Vercel.
2. Keep the framework as **Next.js**.
3. Add the same environment variables in **Project Settings → Environment Variables** for the environments you use.
4. Deploy and check the Vercel build logs.

Only the Supabase URL and anon/public key belong in a browser app. Do not add `SUPABASE_SERVICE_ROLE_KEY` to a client-exposed variable or commit it to the repository.

## Security warning

The current admin login is a demo implementation: credentials use `NEXT_PUBLIC_*` variables, the check runs in the browser, and the session is stored in localStorage. The migration also allows the anon role broad access so the demo can operate directly from the client. Before using real financial or personal data, replace this with Supabase Auth, server-side authorization, and restrictive Row Level Security policies. Do not use the current schema/policies for a production banking system without a security review.
