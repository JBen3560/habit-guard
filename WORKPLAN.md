# Habit-Guard — Work Plan

**Team 1: Runtime Terrors**
Last updated: 2026-03-30
Target: Usability-test-ready in ~1 week | 4/5 active developers

---

## Overview

Two parallel tracks run most of the week. The **Backend track** is the
critical path — almost everything in the Frontend track that involves real
data is blocked until Track A reaches Phase 2. Pure UI fixes (marked
**UI-only**) can start immediately on Track B regardless.

```
Day 1     Day 2     Day 3     Day 4-5   Day 6-7
  │         │         │         │         │
  ▼         ▼         ▼         ▼         ▼
[A1]──────[A2]──────[A3]──────[A4]──────[A5]   ← Backend track
            │
           [B: UI-only fixes, any time]          ← Can start Day 1
                     │
                    [B: data-dependent fixes]    ← Unblocked after A2
```

---

## Track A — Backend (Critical Path)

> **3 people recommended.** This track must start Day 1.
> Joey, Stephanie, and/or Kylie flagged as likely leads given SQL background and
> server experience respectively.

### A1 — Supabase Project + Schema `(Day 1, ~2 hrs)`

The foundation. Nothing else in this track can start until done.

- [ ] Create Supabase project at supabase.com
- [ ] Save project URL and anon key to `.env`; add `.env` to `.gitignore`
- [ ] Run schema SQL in the Supabase SQL editor. Below is a mock-up. Adjust formatting for our style guide:

```sql
create table profiles (
      id uuid primary key references auth.users(id) on delete cascade,
      username text,
      created_at timestamp default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  category text not null,
  time text not null,
  days boolean[7] not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('done', 'skipped')),
  unique (task_id, date)
);

create table friends (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  primary key (user_id, friend_id)
);
```

- [ ] Enable Row Level Security on all four tables; add basic policies
      (users can only read/write their own rows)
- [ ] Install the JS client:
      `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage`
- [ ] Create `src/supabase.ts` and confirm the client initializes without
      errors on app start

---

### A2 — Auth: Login & Account Creation `(Day 1–2, ~3 hrs)`

Needed before any data can be written. Unblocks Track B's data-dependent
fixes once a real `user_id` exists at runtime.

- [ ] Add a login/signup screen that renders if `supabase.auth.getSession()`
      returns null on app load
- [ ] Sign-up: email + password via `supabase.auth.signUp()`, then insert a
      row into `profiles` with the chosen `username`
- [ ] Sign-in: email + password via `supabase.auth.signInWithPassword()`
- [ ] Add sign-out to the Settings section of the Profile tab
- [ ] Confirm session persists across app close/reopen (Supabase handles this
      automatically via AsyncStorage with `persistSession: true`)

---

### A3 — Core Read/Write: Habits `(Day 2–3, ~4 hrs)`

The highest-priority data wiring — habits are the main tab and the source of
all streak and completion data.

- [ ] On login, fetch the user's tasks from `tasks` and use them as the
      initial state instead of `INITIAL_TASKS`
- [ ] When a task is checked off or skipped, upsert a row into `completions`
      (`status: 'done'` or `'skipped'`, `date: today`) in addition to updating
      local React state. Use upsert so toggling back and forth is safe
- [ ] When a task is added or edited, write the change to `tasks`
- [ ] When a task is deleted, delete from `tasks` (cascade cleans up
      `completions` automatically)
- [ ] Add the **daily reset gate**: on app open, check today's date against the
      last session date stored locally. If it's a new calendar day, clear
      `completedToday` and `skippedToday` on all local task state
- [ ] At the daily reset, any task with a `completions` row of
      `status: 'skipped'` for yesterday (and no `'done'` row) should have
      its `streakCount` set to 0

---

### A4 — Core Read/Write: Friends + Profile Data `(Day 3–4, ~3 hrs)`

- [ ] When a friend is added, insert into `friends`; when removed, delete
- [ ] Fetch friend profile data (streak, missed days) from `completions` so
      friend cards show real stats rather than hardcoded values
- [ ] Fetch the last 28 days of `completions` on login and use them to compute:
  - Real `streakCount` per task
  - Real daily history for the 7-day bar chart and 28-day heatmap
  - Real category completion rates
    (This replaces `buildHistory`'s seeded random data entirely)
- [ ] Fix `ProgressSection` to use the live `tasks` prop instead of the
      hardcoded `INITIAL_TASKS` reference in `ProfileTab`
- [ ] Replace hardcoded `MY_STREAK = 13` with a value derived from real task
      data (longest current `streakCount` among active tasks)
- [ ] Replace hardcoded `MY_TASKS` count with the live task list length

---

### A5 — Achievement Logic `(Day 4–5, ~3 hrs)`

Last because it needs real `streakCount` values from real completion history
to be testable. Extend `evaluateTrophies` in `index.tsx`:

- [ ] **First Step** — any task has `streakCount >= 1`
- [ ] **Sennight Soldier** — any task has `streakCount >= 7`
- [ ] **Hydration Hero** — any Hydration task has `streakCount >= 10`
- [ ] **Month Master** — any task has `streakCount >= 30`
- [ ] **Iron Will** — any task has `streakCount >= 100`
- [ ] **Early Bird** — a task is marked done before 7:00 AM (compare current
      time at moment of completion)
- [ ] **Streak Breaker** — a task's streak resets after having been >= 7
      (track pre-reset streak value to detect this)
- [ ] **Gone Missing** — all tasks skipped for a full week (query
      `completions` for 7 consecutive days of all-skipped)
- [ ] **Penalty trigger clarification** — penalties trigger on patterns of
      overall poor performance, not individual skips (e.g. skipping one
      teeth-brushing task should not trigger Gone Missing)

---

## Track B — Frontend

> **2 people recommended.** UI-only items can start Day 1 in parallel with
> Track A. Data-dependent items are blocked until A2 is complete.

### B1 — UI-Only Fixes `(Start Day 1, no backend dependency)`

These touch nothing related to data and can be done in any order.

- [ ] **Web bar chart bug** — 7-day progress bars show percentages but bars
      don't fill on web. The likely cause is `height: \`${pct}%\``inside a
  flex container behaving differently on web. Switch to an explicit pixel
  height calculated from a fixed container height, or use an`Animated`
      value
- [ ] **Sort habits by time** — sort the `todayTasks` array by `task.time`
      (HH:MM string sort) before rendering, regardless of order in state
- [ ] **Skipped filter tab** — add a "Skipped" option alongside All / Pending /
      Done in the Habits tab filter row; filter to tasks where
      `skippedToday === true`
- [ ] **Progress ring scroll behavior** — hide the circular progress indicator
      as the user scrolls down the task list. Use an `Animated.ScrollView`
      with a scroll offset listener driving opacity or scale on the ring
- [ ] **Friend deletion** — add a Remove button to `FriendModal` below the
      nudge section; confirm with `Alert.alert` before calling
      `setFriends(fs => fs.filter(f => f.id !== friend.id))`
- [ ] **Sort achievements by earned date** — earned badges float to the top of
      the grid ordered by `earnedDate`; locked badges remain below
- [ ] Review `Alert.alert` wording for consistency across the app (nudge sent,
      friend added, friend removed, habit deleted)
- [ ] Test dark mode and light mode on all new UI elements — use `C.*` color
      tokens, not hardcoded hex values

---

### B2 — Data-Dependent Frontend Fixes `(Unblocked after A2)`

- [ ] **Achievement unlock pop-up** — when a trophy transitions from unearned
      to earned, show a modal or toast. Diff the before/after trophy arrays
      returned by `evaluateTrophies` to detect new unlocks. Copy varies by
      type:
  - Award: "🎉 Achievement Unlocked: [Name]! Go check the Achievements tab!"
  - Penalty: "😬 Penalty Unlocked: [Name]"
- [ ] **Hard-coded friend bios** — remove the `@cplaue` / `@agalean` specific
      bio strings from `FriendModal`, or make `bio` an optional field on the
      `Friend` type populated from `profiles`
- [ ] **Streak display** — confirm streak counts shown on habit cards reflect
      real values from Supabase once A3 is complete
- [ ] **Custom achievements** (stretch goal, post-testing) — per Plaue's
      recommendation: onboarding flow on first open ("What are you using this
      app for?") feeding into goal-based custom badge creation. Scope this
      after usability feedback is received

---

## Dependency Map

```
A1 (schema + client)
 └── A2 (auth)
      ├── A3 (habits read/write)  ←─── B2 (data-dependent UI) unblocked here
      ├── A4 (friends + profile data)
      └── A5 (achievement logic)

B1 (UI-only fixes) ←── no dependencies, start Day 1
```

---

## Suggested Day-by-Day

| Day | Track A (2 people)            | Track B (2 people)                      |
| --- | ----------------------------- | --------------------------------------- |
| 1   | A1: Schema + Supabase client  | B1: Web bar chart bug, sort by time     |
| 2   | A2: Auth / login screen       | B1: Skipped tab, progress ring scroll   |
| 3   | A3: Habits read/write         | B1: Friend deletion, achievement sort   |
| 4   | A4: Friends + profile data    | B2: Achievement pop-up (A2 done by now) |
| 5   | A5: Achievement logic         | B2: Friend bios, streak display QA      |
| 6–7 | End-to-end testing, bug fixes | End-to-end testing, bug fixes           |

> Days 6–7 should be reserved for integration testing as a full team — this
> is when Track A and Track B features meet for the first time and things
> will break in unexpected ways. Don't let either track run up to the wire.
