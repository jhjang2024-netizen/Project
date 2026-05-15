-- ============================================================
-- 함께 앱 Supabase 스키마
-- Supabase SQL Editor 에서 실행하세요
-- ============================================================

-- 프로필 테이블
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  role text not null check (role in ('child', 'parent')),
  phone text,
  birth_date date,
  avatar_url text,
  invite_code text unique,
  created_at timestamptz default now() not null
);

-- 가족 연결 테이블
create table public.family_links (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  invite_code text unique not null default upper(substring(gen_random_uuid()::text from 1 for 8)),
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now() not null,
  unique(child_id, parent_id)
);

-- 활동 추천 테이블
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  family_link_id uuid references public.family_links(id) on delete cascade not null,
  type text not null check (type in ('movie','performance','restaurant','travel','event')),
  title text not null,
  description text not null default '',
  venue text,
  activity_date timestamptz,
  price_estimate integer,
  match_score integer check (match_score between 0 and 100),
  status text not null default 'suggested' check (status in ('suggested','approved','rejected','completed')),
  ai_reason text,
  created_at timestamptz default now() not null
);

-- 안부 전화 설정 테이블
create table public.call_settings (
  id uuid primary key default gen_random_uuid(),
  family_link_id uuid references public.family_links(id) on delete cascade not null unique,
  notify_time time not null default '19:00',
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

-- 안부 전화 기록 테이블
create table public.call_logs (
  id uuid primary key default gen_random_uuid(),
  family_link_id uuid references public.family_links(id) on delete cascade not null,
  caller_id uuid references auth.users(id) on delete cascade not null,
  duration_seconds integer,
  streak_day integer not null default 1,
  called_at timestamptz default now() not null
);

-- 건강 기록 테이블
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  family_link_id uuid references public.family_links(id) on delete cascade not null,
  heart_rate integer check (heart_rate between 30 and 250),
  oxygen_level integer check (oxygen_level between 50 and 100),
  steps integer check (steps >= 0),
  sleep_hours numeric(4,2) check (sleep_hours between 0 and 24),
  recorded_at timestamptz default now() not null
);

-- 알림 테이블
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('call_reminder','activity_request','health_alert','family_invite')),
  title text not null,
  body text not null,
  read boolean not null default false,
  data jsonb not null default '{}',
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.family_links    enable row level security;
alter table public.activities      enable row level security;
alter table public.call_settings   enable row level security;
alter table public.call_logs       enable row level security;
alter table public.health_records  enable row level security;
alter table public.notifications   enable row level security;

-- profiles: 본인만 읽기/수정
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = user_id or
  id in (
    select parent_id from public.family_links where child_id = (select id from public.profiles where user_id = auth.uid())
    union
    select child_id from public.family_links where parent_id = (select id from public.profiles where user_id = auth.uid())
  )
);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = user_id);

-- family_links: 본인이 포함된 링크만
create policy "family_links_select" on public.family_links for select using (
  child_id  = (select id from public.profiles where user_id = auth.uid()) or
  parent_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "family_links_insert" on public.family_links for insert with check (
  child_id  = (select id from public.profiles where user_id = auth.uid()) or
  parent_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "family_links_update" on public.family_links for update using (
  child_id  = (select id from public.profiles where user_id = auth.uid()) or
  parent_id = (select id from public.profiles where user_id = auth.uid())
);

-- activities: 가족 링크에 속한 사람만
create policy "activities_all" on public.activities using (
  family_link_id in (
    select id from public.family_links
    where child_id  = (select id from public.profiles where user_id = auth.uid())
       or parent_id = (select id from public.profiles where user_id = auth.uid())
  )
);

-- call_settings / call_logs / health_records / notifications
create policy "call_settings_family" on public.call_settings using (
  family_link_id in (
    select id from public.family_links
    where child_id  = (select id from public.profiles where user_id = auth.uid())
       or parent_id = (select id from public.profiles where user_id = auth.uid())
  )
);
create policy "call_logs_family" on public.call_logs using (
  family_link_id in (
    select id from public.family_links
    where child_id  = (select id from public.profiles where user_id = auth.uid())
       or parent_id = (select id from public.profiles where user_id = auth.uid())
  )
);
create policy "health_records_family" on public.health_records using (
  family_link_id in (
    select id from public.family_links
    where child_id  = (select id from public.profiles where user_id = auth.uid())
       or parent_id = (select id from public.profiles where user_id = auth.uid())
  )
);
create policy "notifications_own" on public.notifications using (auth.uid() = user_id);

-- ============================================================
-- 프로필 자동 생성 트리거
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'child')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
