create table public.chat_rooms (
  id         uuid        primary key default gen_random_uuid(),
  status     text        not null default 'active'
               check (status in ('active', 'blocked', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.chat_room_participants (
  room_id    uuid        not null references public.chat_rooms(id) on delete cascade,
  profile_id uuid        not null references public.profiles(id)   on delete cascade,
  joined_at  timestamptz default now(),
  primary key (room_id, profile_id)
);

create index on public.chat_room_participants (profile_id);

create trigger update_chat_rooms_updated_at
  before update on public.chat_rooms
  for each row execute procedure public.update_updated_at_column();

create or replace function public.is_room_participant(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_room_participants
    where room_id    = p_room_id
      and profile_id = auth.uid()
  );
$$;

alter table public.chat_rooms enable row level security;

create policy "Participants can view their chat rooms."
  on public.chat_rooms for select
  using (public.is_room_participant(id));

create policy "Authenticated users can create chat rooms."
  on public.chat_rooms for insert
  with check (auth.uid() is not null);

create policy "Participants can update their chat rooms."
  on public.chat_rooms for update
  using (public.is_room_participant(id));

alter table public.chat_room_participants enable row level security;

create policy "Participants can view room members."
  on public.chat_room_participants for select
  using (public.is_room_participant(room_id));

create policy "Authenticated users can add participants."
  on public.chat_room_participants for insert
  with check (auth.uid() is not null);