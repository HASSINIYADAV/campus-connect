-- Review before applying to project kevqtapluzqlbcpglnvr.
-- This proposal is intentionally not executed. It creates the public event-read
-- rule and an authenticated, owner-scoped registration table for the app.

grant select on table public.events to anon, authenticated;

create policy "Campus events are visible to visitors"
  on public.events
  for select
  to anon, authenticated
  using (true);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  attendee_name text not null,
  attendee_email text not null,
  college text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint event_registrations_one_per_user unique (event_id, user_id)
);

create index event_registrations_user_id_idx
  on public.event_registrations (user_id);

alter table public.event_registrations enable row level security;

grant select, insert on table public.event_registrations to authenticated;

create policy "Attendees can view their own registrations"
  on public.event_registrations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Attendees can register themselves"
  on public.event_registrations
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and lower(attendee_email) = lower((select auth.jwt() ->> 'email'))
  );
