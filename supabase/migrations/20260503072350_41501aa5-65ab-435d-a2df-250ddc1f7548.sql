
-- Enums
create type public.solution_type as enum ('internal','external');
create type public.collateral_type as enum ('video','deck','document');

-- Solutions
create table public.solutions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon_url text,
  thumbnail_url text,
  target_url text not null,
  solution_type public.solution_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collaterals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.collateral_type not null,
  file_url text not null,
  linked_solution_id uuid references public.solutions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  session_id text not null unique,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  session_id text not null,
  action text not null,
  target_id uuid,
  target_type text,
  created_at timestamptz not null default now()
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index collaterals_type_idx on public.collaterals (type);
create index solutions_type_idx on public.solutions (solution_type);

-- Touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger solutions_touch before update on public.solutions
  for each row execute function public.touch_updated_at();
create trigger collaterals_touch before update on public.collaterals
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.solutions enable row level security;
alter table public.collaterals enable row level security;
alter table public.user_sessions enable row level security;
alter table public.activity_logs enable row level security;

create policy "solutions public read" on public.solutions for select using (true);
create policy "collaterals public read" on public.collaterals for select using (true);

create policy "sessions public insert" on public.user_sessions for insert with check (true);
create policy "logs public insert" on public.activity_logs for insert with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('portal-files','portal-files', true)
on conflict (id) do nothing;

create policy "portal-files public read" on storage.objects for select using (bucket_id = 'portal-files');
create policy "portal-files public upload" on storage.objects for insert with check (bucket_id = 'portal-files');
create policy "portal-files public update" on storage.objects for update using (bucket_id = 'portal-files');
create policy "portal-files public delete" on storage.objects for delete using (bucket_id = 'portal-files');
