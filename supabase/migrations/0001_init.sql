-- =========================================================
-- GymMate: قاعدة بيانات المزامنة (Supabase / Postgres)
-- شغّله من SQL Editor أو: supabase db push
-- =========================================================

-- 1) جدول واحد لكل بيانات المستخدم (Offline-first, Last-Write-Wins)
create table if not exists public.records (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  table_name  text        not null check (table_name in ('profile','programs','sessions','mealPlans','water','favorites','bodyMetrics','photos')),
  key         text        not null,
  data        jsonb,
  deleted     boolean     not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, table_name, key)
);
create index if not exists records_user_updated on public.records (user_id, updated_at);

-- وقت السيرفر هو المرجع (يتجنب فرق الساعات بين الأجهزة)
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := clock_timestamp(); return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before insert or update on public.records
  for each row execute function public.touch_updated_at();

alter table public.records enable row level security;
drop policy if exists "records: own rows" on public.records;
create policy "records: own rows" on public.records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) اشتراكات الإشعارات
create table if not exists public.push_subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  endpoint         text not null unique,
  p256dh           text not null,
  auth             text not null,
  tz               text not null default 'Asia/Riyadh',
  lang             text not null default 'ar',
  workout_time     text,
  training_days    int[] not null default '{}',
  water_interval_h int,
  water_start      int not null default 9,
  water_end        int not null default 21,
  last_sent        jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push: own rows" on public.push_subscriptions;
create policy "push: own rows" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) صور التقدم: Bucket خاص، كل مستخدم بمجلده فقط
insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false)
  on conflict (id) do nothing;

drop policy if exists "photos: own folder read" on storage.objects;
create policy "photos: own folder read" on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: own folder write" on storage.objects;
create policy "photos: own folder write" on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: own folder update" on storage.objects;
create policy "photos: own folder update" on storage.objects for update
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: own folder delete" on storage.objects;
create policy "photos: own folder delete" on storage.objects for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
