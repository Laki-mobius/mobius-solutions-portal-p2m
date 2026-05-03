
# Solutions Showcase Portal — Implementation Plan

A public portal for Mobius Knowledge Services to showcase Solutions and Collaterals. Browsing is open; every click-through is gated by an official-email popup and logged for analytics. Admin panel is unprotected with a clear warning banner.

Stack: existing project stack — React 18 + Vite + Tailwind v3 + shadcn/ui. Backend on **Lovable Cloud (Supabase)** for DB, Storage, and Edge Functions.

---

## Pages & Navigation

| Route | Purpose |
|---|---|
| `/` | Hero + tabbed Solutions (Internal / External) + featured collaterals |
| `/solutions` | Full Solutions grid with type tabs and search |
| `/collaterals` | Collaterals grid with type filter chips (All / Video / Deck / Document) |
| `/search?q=` | Unified search across solutions + collaterals |
| `/admin` | Open admin (warning banner, no auth) |

Header: Mobius placeholder mark + wordmark, nav links, "Switch email" link (visible once an email is cached).

---

## Email Gate

- Modal triggered by any Solution card click or Collateral action (View / Play / Download).
- Validates format + domain allowlist `@mobiusservices.com` (configurable in `src/lib/email-gate.ts`).
- Inline error: "Please use your official @mobiusservices.com email".
- On success: persist `email` + generated `session_id` to `localStorage`; one popup per browser session.
- Every gated click is logged even when the email is cached.
- "Switch email" header link clears stored email + session.

---

## Solutions

- Card: 16:10 thumbnail, optional icon, title, description, type badge (Internal / External, distinct gradients).
- Hover-lift, glass badges, generous whitespace.
- Click → email gate → log `view_solution` → open `target_url` in new tab.

Admin fields: title, description, solution_type, icon (upload or URL), thumbnail (upload or URL), target_url.

---

## Collaterals

- Color-coded badges per type (Video / Deck / Document).
- Filter chips with counts.
- Actions:
  - Video → Play (logs `play_video`)
  - Deck / Document → View + Download (logs `view_collateral` / `download_collateral`)
- Optional link to a parent Solution (chip on the card).

Admin fields: title, type, file (upload or URL), linked_solution_id.

---

## Admin Panel (`/admin`)

- Prominent red warning banner: "Unprotected admin — do not share this URL".
- Tabs:
  - **Solutions** — table + add/edit dialog.
  - **Collaterals** — table + add/edit dialog with solution selector.
  - **Logs** — latest 100 entries (email, action, target, timestamp) + "Export full CSV".

---

## Tracking

Every gated action inserts into `activity_logs`:
`email`, `session_id`, `action`, `target_id`, `target_type`, `created_at`.

Actions: `view_solution`, `view_collateral`, `play_video`, `download_collateral`.

---

## Design System

- Brand: placeholder Mobius mark (geometric monogram) + wordmark.
- HSL semantic tokens in `index.css`: deep indigo primary, violet accent, soft neutrals; distinct gradient tokens for Internal vs External.
- Modern aesthetic: gradient hero, glass badges, subtle hover-lift, rounded-2xl, ample whitespace.
- Mobile-first responsive; collapsible nav.
- All colors via tokens — no hard-coded Tailwind color names in components.

---

## Data Model (Supabase)

```text
solutions
  id uuid pk, title text, description text,
  icon_url text, thumbnail_url text, target_url text,
  solution_type text check in ('internal','external'),
  created_at timestamptz

collaterals
  id uuid pk, title text,
  type text check in ('video','deck','document'),
  file_url text, linked_solution_id uuid null fk solutions,
  created_at timestamptz

user_sessions
  id uuid pk, email text, session_id text unique, created_at timestamptz

activity_logs
  id uuid pk, email text, session_id text,
  action text, target_id uuid, target_type text,
  created_at timestamptz
```

RLS:
- `solutions`, `collaterals`: public SELECT.
- `user_sessions`, `activity_logs`: public INSERT only (no public SELECT — emails are PII).
- Admin reads of logs and all admin writes happen via Edge Functions using the service role (since `/admin` is intentionally unauthenticated; the warning banner makes that explicit).

Storage: public bucket `portal-files` for icons, thumbnails, collateral files. Admin uploads via Edge Function.

---

## Edge Functions

- `admin-mutate` — create/update/delete solutions & collaterals + uploads to `portal-files`.
- `admin-read` — list activity logs, export CSV.

---

## Build Order

1. Design tokens, header/footer, placeholder Mobius mark.
2. Supabase schema + RLS + storage bucket + edge functions.
3. Email gate modal, `email-gate.ts` allowlist, logging helper.
4. Home with Internal/External tabs.
5. Solutions and Collaterals listing pages with filters.
6. Global `/search`.
7. Admin panel (Solutions, Collaterals, Logs + CSV export).
8. Polish: responsive pass, empty states, loading skeletons.

---

## Defaults Applied

- Allowed domain: `@mobiusservices.com` (single constant, easy to change).
- Admin: fully open with red warning banner.
- Branding: placeholder Mobius mark + wordmark in indigo/violet.
