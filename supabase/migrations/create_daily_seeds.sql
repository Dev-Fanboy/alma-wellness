-- Create daily_seeds table
create table public.daily_seeds (
  id uuid not null default gen_random_uuid(),
  content text not null,
  publish_date date not null default current_date,
  created_at timestamp with time zone not null default now(),
  constraint daily_seeds_pkey primary key (id),
  constraint daily_seeds_publish_date_key unique (publish_date)
);

-- Enable RLS
alter table public.daily_seeds enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on public.daily_seeds
  for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users (admins only ideally, but open for now for dev)" on public.daily_seeds
  for insert
  to authenticated
  with check (true);

-- Insert some dummy data for development/testing
insert into public.daily_seeds (content, publish_date)
values
  ('The best time to plant a tree was 20 years ago. The second best time is now. Keep growing!', current_date),
  ('Your journey is unique. Do not compare your beginning to someone else''s middle.', current_date - 1),
  ('Small steps every day add up to big changes. You are doing great.', current_date - 2),
  ('Sunshine is delicious, rain is refreshing, wind braces us up, snow is exhilarating; there is really no such thing as bad weather, only different kinds of good weather.', current_date - 3)
on conflict (publish_date) do nothing;
