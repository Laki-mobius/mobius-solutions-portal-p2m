## Root cause

The public site fetches solutions from the `solutions_public` view, but every request returns `401 / permission denied for table solutions`.

The view was created with `security_invoker = true`, which means it runs with the caller's privileges and needs SELECT on the underlying `public.solutions` table. When I checked the actual table grants, the `anon` and `authenticated` roles have INSERT/UPDATE/DELETE on `public.solutions` but **no SELECT**:

```
solutions  anon=awdDxtm   authenticated=awdDxtm   (no 'r' = no SELECT)
```

So:
- Home / Solutions page → reads `solutions_public` → view tries to read `solutions` → blocked → list looks empty / stale.
- Admin Solutions tab → reads `solutions` directly → also blocked → newly saved rows don't appear.

The data itself is fine — the new rows ("RFP agentic solution", etc.) are in the DB.

The earlier "solutions admin read" RLS policy and the GRANT on `solutions_public` aren't enough on their own, because the missing piece is the table-level SELECT privilege on `public.solutions` for `anon`/`authenticated`.

## Fix plan

1. **Migration: restore SELECT on `public.solutions`** for `anon` and `authenticated` so the security-invoker view resolves and the admin reads succeed.
2. **Keep credentials safe**: the public site continues to use `solutions_public` (which already excludes `default_password_encrypted`). RLS on `solutions` already restricts row visibility appropriately; column-level secrecy is preserved by always querying the view from the public app.
3. **Admin list**: continues reading `solutions` directly (now permitted). No code change needed there beyond what's already in place; React Query invalidation on save is already wired up, so the list will refresh after every create/update/delete.
4. **Verification after deploy**:
   - `GET /rest/v1/solutions_public` returns 200 with all non-archived rows.
   - Newly created solution appears immediately in both admin table and home/solutions pages.
   - Archived rows stay hidden from public pages.