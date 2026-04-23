create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  username text unique,

  full_name text,
  avatar_url text,

  updated_at timestamptz default now()
);

create unique index on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
on public.profiles
for select
using (true);

create policy "Users can insert their own profile."
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile."
on public.profiles
for update
using (auth.uid() = id);

create function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

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

alter function public.handle_new_user() set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();