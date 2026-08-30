create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  headline text,
  college text,
  stage text not null default 'student',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  organisation text not null,
  type text not null check (type in ('internship', 'job', 'fellowship', 'research', 'event')),
  description text not null,
  location text,
  application_url text,
  source_url text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'expired')),
  closes_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_saves (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, opportunity_id)
);

create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'saved'
    check (status in ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, opportunity_id)
);

create table if not exists public.goal_spaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text not null,
  visibility text not null default 'public'
    check (visibility in ('public', 'private', 'invite_only')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.goal_space_members (
  space_id uuid not null references public.goal_spaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'owner')),
  joined_at timestamptz not null default now(),
  primary key (space_id, profile_id)
);

alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_saves enable row level security;
alter table public.applications enable row level security;
alter table public.goal_spaces enable row level security;
alter table public.goal_space_members enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select using (true);
create policy "Users manage their own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Verified opportunities are publicly readable"
  on public.opportunities for select using (verification_status = 'verified');
create policy "Users manage their own saves"
  on public.opportunity_saves for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage their own applications"
  on public.applications for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Public spaces are readable"
  on public.goal_spaces for select using (visibility = 'public');
create policy "Users manage their memberships"
  on public.goal_space_members for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
