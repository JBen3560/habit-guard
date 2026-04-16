-- Add irreversible daily completion/skip flags.
-- Run this in Supabase SQL editor.

alter table public.task_completions
  add column if not exists completed_once boolean not null default false,
  add column if not exists skipped_once boolean not null default false;

-- Backfill historical rows so previous completed/skipped data remains meaningful.
update public.task_completions
set completed_once = coalesce(completed_once, false) or coalesce(completed, false),
    skipped_once = coalesce(skipped_once, false) or coalesce(skipped, false);
