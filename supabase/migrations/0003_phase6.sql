-- المرحلة 6: جداول جديدة بالمزامنة + حدود استخدام المدرب الذكي
alter table public.records drop constraint if exists records_table_name_check;
alter table public.records add constraint records_table_name_check
  check (table_name in ('profile','programs','sessions','mealPlans','water','favorites','bodyMetrics','photos','checkins','challenges'));

create table if not exists public.coach_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);
alter table public.coach_usage enable row level security;
drop policy if exists "coach_usage: read own" on public.coach_usage;
create policy "coach_usage: read own" on public.coach_usage for select using (auth.uid() = user_id);

-- زيادة العداد بشكل آمن (تستدعيها الـ Edge Function بمفتاح الخدمة)
create or replace function public.coach_increment(p_user uuid, p_limit int)
returns int language plpgsql security definer as $$
declare c int;
begin
  insert into public.coach_usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.coach_usage.count + 1
  returning count into c;
  if c > p_limit then return -1; end if;
  return c;
end $$;
revoke execute on function public.coach_increment from public, anon, authenticated;
