## Goal
Show the human-readable name of the solution/collateral that was accessed in the Admin → Logs table (and CSV export), instead of only the truncated UUID.

## Changes

### 1. `supabase/functions/admin-logs/index.ts`
- After fetching `activity_logs`, collect distinct `target_id`s grouped by `target_type` (`solution` vs `collateral`).
- Query `solutions` (id, title) and `collaterals` (id, title) using the service role client to build an id → title map.
- Attach `target_name` to each log row.
- Include `target_name` as a new column in both the JSON response and the CSV export (between `target_type` and `created_at`).

### 2. `src/components/admin/AdminLogs.tsx`
- Extend the `LogRow` type with `target_name: string | null`.
- Add a new "Target Name" column header between "Action" and "Target".
- Render `row.target_name ?? "—"` in that cell. Keep the existing short id cell for reference (or merge — see option below).

## Display option
Render the table as: When | Email | Action | Target Name | Type/ID (small, muted) | Session.
This keeps full traceability while making logs human-readable.

## Notes
- Deleted solutions/collaterals will show "—" since the title can't be resolved.
- No DB schema change needed; logs table stays as-is.
