alter view public.solutions_public set (security_invoker = true);

-- Restrict base table SELECT so the encrypted password column is not publicly readable.
-- Other operations (insert/update/delete) keep their existing permissive policies (unauthenticated admin by design).
revoke select on public.solutions from anon, authenticated;
grant select on public.solutions to service_role;