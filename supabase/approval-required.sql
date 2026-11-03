-- CampusConnect production setup for project kevqtapluzqlbcpglnvr.
-- The existing events and registrations tables are preserved.

-- Event listings are public in this app. Only public event rows are readable;
-- no write policy is created for events.
grant select on table public.events to anon, authenticated;

create policy "Campus events are visible to visitors"
  on public.events
  for select
  to anon, authenticated
  using (true);

-- The existing registrations table points user_id at public.users. CampusConnect
-- Auth IDs come from auth.users, so point registrations at the authenticated
-- identity table. The current registrations table is empty (verified 2026-11-03).
alter table public.registrations
  drop constraint registrations_user_id_fkey;

alter table public.registrations
  add constraint registrations_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table public.registrations
  alter column event_id set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.registrations
  add constraint registrations_one_per_event unique (event_id, user_id);

alter table public.registrations enable row level security;
grant select, insert on table public.registrations to authenticated;

create policy "Attendees can view their own registrations"
  on public.registrations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Attendees can register themselves"
  on public.registrations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
