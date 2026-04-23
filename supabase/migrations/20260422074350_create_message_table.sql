-- ─────────────────────────────────────────
-- TYPE must come before the table
-- ─────────────────────────────────────────
create type public.message_content_type as enum ('string', 'url');

create table public.messages (
  id         uuid                     primary key default gen_random_uuid(),
  room_id    uuid                     not null references public.chat_rooms(id)  on delete cascade,
  sender_id  uuid                     not null references public.profiles(id)    on delete cascade,
  type       public.message_content_type          default 'string',   -- ← schema-qualified
  content    text                     not null,
  seen_at    timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz              default now(),
  updated_at timestamptz              default now()
);

create index on public.messages (room_id, created_at desc);
create index on public.messages (expires_at) where expires_at is not null;

create trigger update_messages_updated_at
  before update on public.messages
  for each row execute procedure public.update_updated_at_column();

alter table public.messages enable row level security;

-- ─────────────────────────────────────────
-- RLS — messages (uses is_room_participant to avoid recursion)
-- ─────────────────────────────────────────
create policy "Room participants can view messages."
  on public.messages for select
  using (
    public.is_room_participant(room_id)
    and (expires_at is null or expires_at > now())
    and deleted_at is null
  );

create policy "Participants can send messages."
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_room_participant(room_id)
  );

create policy "Sender can update their message."
  on public.messages for update
  using (sender_id = auth.uid());

create policy "Recipient can mark message as seen."
  on public.messages for update
  using (public.is_room_participant(room_id));