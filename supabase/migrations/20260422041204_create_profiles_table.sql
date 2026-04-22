create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Username should be unique 
  username text unique,

  full_name text,
  avatar_url text,

  -- Tracks last update time
  updated_at timestamptz default now()
);

-- username uniqueness ignoring case
create unique index on public.profiles (lower(username));

-- RLS policies

-- Enable RLS
alter table public.profiles enable row level security;

-- Anyone can view profiles
create policy "Public profiles are viewable by everyone."
on public.profiles
for select
using (true);

-- Users can insert only their own profile
create policy "Users can insert their own profile."
on public.profiles
for insert
with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile."
on public.profiles
for update
using (auth.uid() = id);


-- AUTO UPDATE TIMESTAMP

-- Function to update updated_at column on every update
create function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to call function before every update
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();



-- AUTO CREATE PROFILE ON SIGNUP

-- Trigger function: runs when a new user is created in auth.users
-- Copies basic metadata into profiles table
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Restrict search_path for security
alter function public.handle_new_user() set search_path = public;

-- Trigger: fires after a new user is inserted into auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();