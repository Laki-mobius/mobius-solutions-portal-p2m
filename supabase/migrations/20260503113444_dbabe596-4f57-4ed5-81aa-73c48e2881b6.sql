create extension if not exists pgcrypto with schema public;

alter table public.solutions
  add column if not exists default_username text,
  add column if not exists default_password_encrypted text,
  add column if not exists credentials_note text,
  add column if not exists status text not null default 'live';

alter table public.solutions
  drop constraint if exists solutions_status_check;
alter table public.solutions
  add constraint solutions_status_check check (status in ('live','upcoming'));

-- Tighten public read on solutions: drop the broad public select and replace with a view
drop policy if exists "solutions public read" on public.solutions;

create or replace view public.solutions_public as
select
  id,
  title,
  description,
  icon_url,
  thumbnail_url,
  target_url,
  solution_type,
  status,
  credentials_note,
  default_username,
  (default_password_encrypted is not null) as has_credentials,
  created_at,
  updated_at
from public.solutions;

grant select on public.solutions_public to anon, authenticated;