-- Starter task seeding helper for new users.
-- Run this in Supabase SQL editor.

create or replace function public.seed_starter_tasks(
  p_user_id uuid,
  p_tasks jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'Cannot seed tasks for another user';
  end if;

  if p_tasks is null or jsonb_typeof(p_tasks) <> 'array' then
    raise exception 'Starter task payload must be an array';
  end if;

  with desired as (
    select
      p_user_id as user_id,
      task.title,
      task.category,
      task.time,
      coalesce(task.days, array[true, true, true, true, true, true, true]) as days,
      coalesce(task.active, true) as active,
      coalesce(task.streak_count, 0) as streak_count,
      coalesce(task.skipped_count, 0) as skipped_count
    from jsonb_to_recordset(p_tasks) as task(
      title text,
      category text,
      time text,
      days boolean[],
      active boolean,
      streak_count integer,
      skipped_count integer
    )
  )
  insert into public.tasks (
    user_id,
    title,
    category,
    time,
    days,
    active,
    streak_count,
    skipped_count
  )
  select d.user_id, d.title, d.category, d.time, d.days, d.active, d.streak_count, d.skipped_count
  from desired d
  where not exists (
    select 1
    from public.tasks t
    where t.user_id = d.user_id
      and t.title = d.title
  );
end;
$$;

grant execute on function public.seed_starter_tasks(uuid, jsonb) to authenticated;
