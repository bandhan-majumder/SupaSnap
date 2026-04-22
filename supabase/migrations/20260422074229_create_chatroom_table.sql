-- ─────────────────────────────────────────
-- CHAT ROOMS (1:1 only)
-- ─────────────────────────────────────────
create table public.chat_rooms (
  id          uuid primary key default gen_random_uuid(),
  status      text not null default 'active'
                check (status in ('active', 'blocked', 'archived')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- PARTICIPANTS (exactly 2 per room enforced via app + unique constraint)
-- ─────────────────────────────────────────
create table public.chat_room_participants (
  room_id     uuid not null references public.chat_rooms(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz default now(),
  primary key (room_id, profile_id)
);

-- Index for fast participant lookups
create index on public.chat_room_participants (profile_id);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- Reuses update_updated_at_column() from profiles migration
-- ─────────────────────────────────────────
create trigger update_chat_rooms_updated_at
before update on public.chat_rooms
for each row execute procedure public.update_updated_at_column();

-- ─────────────────────────────────────────
-- RLS — chat_rooms
-- ─────────────────────────────────────────
alter table public.chat_rooms enable row level security;

-- Only participants can see their rooms
create policy "Participants can view their chat rooms."
on public.chat_rooms for select
using (
  exists (
    select 1 from public.chat_room_participants
    where room_id = id
      and profile_id = auth.uid()
  )
);

-- Any authenticated user can create a room
create policy "Authenticated users can create chat rooms."
on public.chat_rooms for insert
with check (auth.uid() is not null);

-- Participants can update room (e.g. change status)
create policy "Participants can update their chat rooms."
on public.chat_rooms for update
using (
  exists (
    select 1 from public.chat_room_participants
    where room_id = id
      and profile_id = auth.uid()
  )
);

-- ─────────────────────────────────────────
-- RLS — chat_room_participants
-- ─────────────────────────────────────────
alter table public.chat_room_participants enable row level security;

-- Only members of a room can see who else is in it
create policy "Participants can view room members."
on public.chat_room_participants for select
using (
  exists (
    select 1 from public.chat_room_participants as crp
    where crp.room_id = room_id
      and crp.profile_id = auth.uid()
  )
);

-- Users can only add themselves (server-side inserts the other participant via service role)
create policy "Users can join rooms."
on public.chat_room_participants for insert
with check (profile_id = auth.uid());