-- Halifax Private Banking — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.
-- Project: https://your-project-id.supabase.co

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Sub Accounts ─────────────────────────────────────────────────────────────
create table if not exists public.sub_accounts (
  id                 text primary key,
  balance            numeric(15, 2) not null default 0,
  user_data          jsonb not null,
  card_settings      jsonb not null default '{"frozen":false,"contactless":true,"onlinePayments":true}'::jsonb,
  pin                text not null default '000000',
  pin_set            boolean not null default false,
  password           text not null default '',
  is_blocked         boolean not null default false,
  transaction_status text not null default 'normal'
                       check (transaction_status in ('normal', 'pending', 'failed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── Transactions ─────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id              text primary key,
  sub_account_id  text not null references public.sub_accounts(id) on delete cascade,
  type            text not null check (type in ('credit', 'debit')),
  amount          numeric(15, 2) not null,
  description     text not null default '',
  recipient       text not null default '',
  category        text not null default 'other',
  status          text not null check (status in ('completed', 'pending', 'failed')),
  reference       text not null default '',
  created_at      timestamptz not null default now()
);

-- ─── Audit Log ────────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id          text primary key,
  action      text not null,
  detail      text not null default '',
  created_at  timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_transactions_sub_account on public.transactions(sub_account_id);
create index if not exists idx_transactions_created_at  on public.transactions(created_at desc);
create index if not exists idx_audit_log_created_at     on public.audit_log(created_at desc);
create index if not exists idx_sub_accounts_is_blocked  on public.sub_accounts(is_blocked);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.sub_accounts  enable row level security;
alter table public.transactions  enable row level security;
alter table public.audit_log     enable row level security;

-- Allow all operations for anon key (demo app — tighten for production)
create policy "Allow all for anon" on public.sub_accounts  for all to anon using (true) with check (true);
create policy "Allow all for anon" on public.transactions  for all to anon using (true) with check (true);
create policy "Allow all for anon" on public.audit_log     for all to anon using (true) with check (true);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_updated_at before update on public.sub_accounts
  for each row execute procedure public.handle_updated_at();

-- ─── Migration: add new columns to existing tables ───────────────────────────
-- Safe to run even if columns already exist (idempotent via IF NOT EXISTS).
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='sub_accounts' and column_name='password') then
    alter table public.sub_accounts add column password text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='sub_accounts' and column_name='is_blocked') then
    alter table public.sub_accounts add column is_blocked boolean not null default false;
  end if;

  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='sub_accounts' and column_name='transaction_status') then
    alter table public.sub_accounts add column transaction_status text not null default 'normal'
      check (transaction_status in ('normal', 'pending', 'failed'));
  end if;
end $$;

-- ─── Migration: internal transfer columns on transactions ──────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='transactions' and column_name='is_internal_transfer') then
    alter table public.transactions add column is_internal_transfer boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='transactions' and column_name='internal_recipient_id') then
    alter table public.transactions add column internal_recipient_id text default null;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='transactions' and column_name='internal_sender_id') then
    alter table public.transactions add column internal_sender_id text default null;
  end if;
end $$;

-- ─── App Config (key/value store for admin state) ─────────────────────────────
create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;
create policy "Allow all for anon" on public.app_config for all to anon using (true) with check (true);

-- Seed the admin balance row so it always exists
insert into public.app_config (key, value)
values ('admin_balance', '2000000'::jsonb)
on conflict (key) do nothing;

-- ─── Enable Realtime on key tables ───────────────────────────────────────────
-- Run this in your Supabase SQL editor to enable realtime updates
alter publication supabase_realtime add table public.sub_accounts;
alter publication supabase_realtime add table public.transactions;
