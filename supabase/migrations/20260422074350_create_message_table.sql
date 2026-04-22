CREATE TYPE message_content_type AS ENUM ('string', 'url');

CREATE TABLE public.messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    uuid        NOT NULL REFERENCES public.chat_rooms(id)  ON DELETE CASCADE,
  sender_id  uuid        NOT NULL REFERENCES public.profiles(id)    ON DELETE CASCADE,
  type       message_content_type    DEFAULT 'string',
  content    text        NOT NULL,
  seen_at    timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fast message fetching ordered by time for a given room
create index on public.messages (room_id, created_at desc);
-- Efficient expiry cleanup queries
create index on public.messages (expires_at) where expires_at is not null;

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- Reuses update_updated_at_column() from profiles migration
-- ─────────────────────────────────────────
create trigger update_messages_updated_at
before update on public.messages
for each row execute procedure public.update_updated_at_column();

-- ─────────────────────────────────────────
-- RLS — messages
-- ─────────────────────────────────────────
alter table public.messages enable row level security;

-- Only room participants can read messages (excludes expired + soft-deleted)
create policy "Room participants can view messages."
on public.messages for select
using (
  exists (
    select 1 from public.chat_room_participants
    where room_id = messages.room_id
      and profile_id = auth.uid()
  )
  and (expires_at is null or expires_at > now())
  and deleted_at is null
);

-- Only participants can send messages, and sender_id must be themselves
create policy "Participants can send messages."
on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.chat_room_participants
    where room_id = messages.room_id
      and profile_id = auth.uid()
  )
);

-- Sender can soft-delete their own message (set deleted_at)
create policy "Sender can update their message."
on public.messages for update
using (sender_id = auth.uid());

-- Recipient can mark a message as seen (set seen_at)
create policy "Recipient can mark message as seen."
on public.messages for update
using (
  exists (
    select 1 from public.chat_room_participants
    where room_id = messages.room_id
      and profile_id = auth.uid()
  )
);

-- ─────────────────────────────────────────
-- OPTIONAL: pg_cron job to purge expired messages
-- Requires pg_cron extension enabled in Supabase dashboard
-- ─────────────────────────────────────────
-- select cron.schedule(
--   'expire-messages',
--   '*/15 * * * *',
--   $$delete from public.messages where expires_at < now()$$
-- );