## Option A (Hardened) — Default credentials + "Upcoming" flag

### 1. Database changes (`solutions` table)

Add four columns:

- `default_username` text, nullable
- `default_password_encrypted` text, nullable — encrypted at rest using `pgcrypto` + a server-only secret (`CREDS_ENCRYPTION_KEY`)
- `credentials_note` text, nullable — free-text hint (e.g. "SSO via Okta", "Ask IT for access")
- `status` text, default `'live'`, check in (`'live'`, `'upcoming'`)

Tighten RLS on `solutions`:

- Public SELECT continues to work, but the `default_password_encrypted` column is **excluded** from the public-readable view. We expose a view `public.solutions_public` that omits the encrypted password, and restrict the base table SELECT to service role only.
- This prevents anyone from sniffing encrypted blobs from the public API.

Add a new secret `CREDS_ENCRYPTION_KEY` (random 32-byte value).

### 2. Edge functions

- `reveal-credentials` — accepts `{ solution_id, email, session_id }`, validates email against the same allowlist (`@mobiusservices.com`), decrypts the password using `CREDS_ENCRYPTION_KEY`, logs a `reveal_credentials` row in `activity_logs`, and returns `{ username, password, note }`. Rate-limited (max ~10 reveals per email per hour) to prevent scraping.
- `admin-mutate-solution` — used by the admin panel to insert/update solutions; encrypts the password server-side before writing. Replaces the current direct `supabase.from("solutions").insert()` calls in `AdminSolutions.tsx` so the plaintext password never touches the public API.

### 3. UI changes

**SolutionCard**
- New `"Upcoming"` badge (amber gradient) shown when `status === 'upcoming'`. Card becomes non-clickable (no email gate, no redirect) and shows "Coming soon" instead of the open-link arrow.
- For `live` solutions with credentials, after the email gate succeeds the card opens the target URL **and** a small "Credentials" toast appears with a "Show credentials" button → opens a dialog.

**Credentials dialog**
- Calls `reveal-credentials` edge function.
- Displays `username` and `password` in monospace fields with a copy-to-clipboard button each.
- Shows the optional `credentials_note` below.
- Password is masked by default with a show/hide toggle.
- Auto-clears from memory when the dialog closes.

**Admin → Solutions form**
- New fields: Status (Live / Upcoming), Default username, Default password, Credentials note.
- Password field is write-only (never pre-filled when editing — shows "Leave blank to keep existing").
- Save calls `admin-mutate-solution` instead of writing directly.

**Admin → Logs**
- New action type `reveal_credentials` shown in the logs table and CSV export.

### 4. "New" vs "Upcoming" badge logic

| Status   | Created < 30 days ago | Badge shown        | Clickable |
|----------|-----------------------|--------------------|-----------|
| live     | yes                   | New (purple)       | yes       |
| live     | no                    | none               | yes       |
| upcoming | any                   | Upcoming (amber)   | no        |

### Technical notes

- Encryption uses `pgcrypto`'s `pgp_sym_encrypt` / `pgp_sym_decrypt` inside the edge functions (key never sent to the browser).
- The `solutions_public` view is what the existing `useSolutions` hook will query — column shape stays compatible (id, title, description, icon_url, thumbnail_url, target_url, solution_type, created_at, status, has_credentials boolean, credentials_note).
- `has_credentials` is a computed boolean (`default_password_encrypted IS NOT NULL`) so the UI knows whether to show the "Credentials" button without exposing anything sensitive.
- Existing data is unaffected — all new columns are nullable and `status` defaults to `'live'`.

### Files touched

- New migration (columns, view, RLS tightening, pgcrypto)
- New secret: `CREDS_ENCRYPTION_KEY`
- New: `supabase/functions/reveal-credentials/index.ts`
- New: `supabase/functions/admin-mutate-solution/index.ts`
- New: `src/components/CredentialsDialog.tsx`
- Edited: `src/components/SolutionCard.tsx` (Upcoming badge, credentials trigger)
- Edited: `src/components/admin/AdminSolutions.tsx` (new fields, calls edge function)
- Edited: `src/hooks/useContent.ts` (query the view, add `status` + `has_credentials` + `credentials_note`)
- Edited: `src/lib/tracking.ts` (add `reveal_credentials` action type)
- Edited: `src/components/admin/AdminLogs.tsx` (display new action)
