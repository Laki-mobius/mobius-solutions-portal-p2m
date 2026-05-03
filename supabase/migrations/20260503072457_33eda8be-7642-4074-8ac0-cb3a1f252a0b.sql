
create policy "solutions public write insert" on public.solutions for insert with check (true);
create policy "solutions public write update" on public.solutions for update using (true) with check (true);
create policy "solutions public write delete" on public.solutions for delete using (true);

create policy "collaterals public write insert" on public.collaterals for insert with check (true);
create policy "collaterals public write update" on public.collaterals for update using (true) with check (true);
create policy "collaterals public write delete" on public.collaterals for delete using (true);
