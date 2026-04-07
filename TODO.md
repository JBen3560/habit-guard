# Habit-Guard — TODO

**Team 1: Runtime Terrors**
Last updated: 2026-03-30 (Supabase decision)

---

## 🗄️ Data Persistence — Supabase (PostgreSQL)

The app currently resets all state on every reload. The team has decided on
**Supabase** as the backend — it's a hosted PostgreSQL instance with a
generous free tier, a JS client that drops into the existing Expo setup, and
built-in auth. Joey and others with SQL experience can work directly in the
Supabase dashboard SQL editor to inspect and debug data during testing.

> **Note:** Supabase free-tier projects pause after 1 week of inactivity.
> Before handing the app to usability testers, log into the dashboard and
> confirm the project is active.

### 1. Supabase project setup

- [ ] Create a Supabase project at supabase.com and save the project URL and
      anon key to a `.env` file (add `.env` to `.gitignore`)
- [ ] Install the JS client:
      `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage`
      (AsyncStorage is still needed as the auth token store for the Supabase
      client — it just isn't used for app state anymore)
- [ ] Create a `src/supabase.ts` file that initialises and exports the client:
      `ts
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { createClient } from '@supabase/supabase-js';
    const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
    export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true },
    });
    `

### 2. Schema

Run the following in the Supabase SQL editor to create the four core tables:

```sql
-- Users (managed by Supabase Auth, this extends it with app-specific fields)
create table profiles (
      id uuid primary key references auth.users(id) on delete cascade,
      username text,
      created_at timestamp default now()
);

-- Tasks (one row per habit per user)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  category text not null,
  time text not null,              -- 'HH:MM'
  days boolean[7] not null,        -- Sun–Sat
  active boolean default true,
  created_at timestamptz default now()
);

-- Completions (one row per task per calendar day)
create table completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('done', 'skipped')),
  unique (task_id, date)           -- prevent duplicate entries per day
);

-- Friends (directional: user_id follows friend_id)
create table friends (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  primary key (user_id, friend_id)
);
```

- [ ] Enable **Row Level Security** on all four tables and add policies so
      users can only read/write their own rows (Supabase docs:
      "Enable RLS" toggle in the table editor, then "New Policy")

### 3. Auth — login & account creation screens

- [ ] Add a **login/signup screen** that renders before the main tab view if
      `supabase.auth.getSession()` returns null on app load
- [ ] Sign-up flow: email + password via `supabase.auth.signUp()`, then insert
      a row into `profiles` with the chosen `username`
- [ ] Sign-in flow: email + password via `supabase.auth.signInWithPassword()`
- [ ] On successful auth, store the session (Supabase handles this via
      AsyncStorage automatically with `persistSession: true`)
- [ ] Add a sign-out option in the Settings section of the Profile tab

### 4. Wiring app state to Supabase

- [ ] On login, fetch the user's tasks from the `tasks` table and replace
      `INITIAL_TASKS` as the initial `useState` value in `index.tsx`
- [ ] On login, fetch the last 28 days of rows from `completions` and use them
      to compute real `streakCount` per task and real history for the profile
      charts (replaces `buildHistory`'s seeded random data)
- [ ] When a user checks off or skips a habit, upsert a row into `completions`
      (`status: 'done'` or `'skipped'`, `date: today`) in addition to updating
      local React state
- [ ] When a user adds or edits a habit, write the change to the `tasks` table
- [ ] When a user deletes a habit, delete the row from `tasks` (cascade will
      clean up `completions`)
- [ ] When a user adds or removes a friend, insert/delete from `friends`
- [ ] Fetch friend profile data (streak, missed days) from `completions` for
      friends listed in the `friends` table so friend cards show real stats

### 5. Daily reset gate

- [ ] Add a daily **reset gate**: on app open, compare today's date to the last
      stored session date. If it's a new calendar day, clear `completedToday`
      and `skippedToday` on all local task state (the source of truth for
      history is `completions`, so nothing is lost)
- [ ] **Skipping a task should break its streak** — at the daily reset, any
      task that has a `completions` row with `status: 'skipped'` for yesterday
      (and no `status: 'done'` row) should have its streak reset to 0

---

## ✅ Habits Tab

- [ ] **Bug: streaks don't reset correctly.** `toggleTaskComplete` increments
      `streakCount` by 1 on each tap, but if a user un-checks a habit multiple
      times it can go negative or drift. Tie streak logic to the daily reset gate
      (see Persistence above) rather than to the toggle button
- [ ] **Bug: "Done" count in the header counts skipped tasks as done** — confirm
      whether skipped should count toward the progress ring or not, and make it
      consistent
- [ ] **Add a "Skipped" filter tab** alongside All / Pending / Done so skipped
      tasks have their own view rather than appearing mixed into other lists
- [ ] **Sort tasks by scheduled time** regardless of their order in `mockData`
      (or the order they were added) — sort the `todayTasks` array by
      `task.time` (HH:MM string sort works fine here) before rendering
- [ ] **Progress ring should hide on scroll** — the circular progress indicator
      at the top of the Habits tab should animate out as the user scrolls down
      the task list, giving more screen space to the list. Use an
      `Animated.ScrollView` with a scroll offset listener to drive opacity/scale
- [x] **Custom reminder time** — replaced the fixed preset cards with a "Custom"
      option in the time picker that reveals a validated HH:MM text input.
      Presets still work as quick picks; loading a habit with a non-preset time
      automatically opens custom mode
- [ ] Add a **swipe-to-delete** or long-press delete affordance on habit cards
      as a faster alternative to tapping into the edit modal (the delete button
      is already in the modal, but it requires several taps)

---

## 👤 Profile Tab

- [ ] **Bug: progress charts use `INITIAL_TASKS` directly** (`ProgressSection`
      is passed `INITIAL_TASKS` as a hard-coded prop in `ProfileTab`). Change
      it to receive and use the live `tasks` prop so charts reflect actual
      user habits
- [ ] **Bug: 7-day progress bars not rendering on web** — completion percentages
      display correctly but the filled bars themselves don't appear in the web
      version. Investigate whether `flex`-based bar height (`height: \`${pct}%\``)
    behaves differently on web and switch to an explicit pixel height or
    `Animated` value if needed
- [ ] **`MY_STREAK` is hard-coded to 13.** Replace with a value derived from
      the user's task data (e.g. the longest current `streakCount` among active
      tasks, or a dedicated "overall streak" concept)
- [ ] **`MY_TASKS` counts all `INITIAL_TASKS`** rather than the live task list.
      Fix to count from the live `tasks` prop
- [ ] **Fully implement historical data for the profile charts** — the 7-day
      bar chart, 28-day heatmap, and category breakdown all currently use
      seeded random data from `buildHistory`. Once the backend or AsyncStorage
      persistence is in place, replace with real per-day completion records
- [ ] **Friend deletion** — add a delete/remove button to the `FriendModal`
      (next to or below the nudge section) that calls `setFriends` to remove
      the friend and closes the modal. Include an `Alert.alert` confirmation
      before deleting
- [ ] **Hard-coded friend bios** — `FriendModal` renders specific bio text for
      `@cplaue` and `@agalean` only. Friends added via the Add Friend flow show
      nothing. Either remove the bio section for added friends gracefully, or
      make bio an optional field in the `Friend` type that users can set

---

## 🏆 Achievements Tab

- [ ] **Most trophies have no unlock logic.** `evaluateTrophies` in `index.tsx`
      only checks two conditions. Wire up the remaining trophies:
  - [ ] **First Step** — unlock when the user completes any habit at least once
        (check if any task has `completedToday === true` or `streakCount >= 1`)
  - [ ] **Sennight Soldier** — unlock when any task reaches `streakCount >= 7`
  - [ ] **Hydration Hero** — unlock when any Hydration task reaches
        `streakCount >= 10`
  - [ ] **Early Bird** — unlock when a habit is marked complete before 7:00 AM
        (compare `task.time` to current time at the moment of completion)
  - [ ] **Streak Breaker** — unlock when a task's streak resets after reaching
        7+ days (needs streak-before-reset tracking)
  - [ ] **Gone Missing** — unlock when all tasks are skipped for a full week
        (needs per-day history, tie to persistence)
  - [ ] **Month Master / Iron Will** — unlock at `streakCount >= 30` / `>= 100`
        on any task
- [ ] **Achievement unlock pop-up** — when a trophy transitions from
      `earned: false` to `earned: true`, show a brief modal or toast with
      different copy depending on type: "🎉 Achievement Unlocked: [Name]! Go
      check the Achievements tab!" for awards, "😬 Penalty Unlocked: [Name]"
      for `type: 'bad'`. Hook into the return value of `evaluateTrophies` to
      diff old vs new earned state and trigger the alert
- [ ] **Sort achievements by earned date**, with unlocked badges floating to
      the top of the grid ordered by `earnedDate`. Locked badges remain below,
      sorted by some stable order (e.g. difficulty / type)
- [ ] **Clarify penalty triggers** — penalties are intended for patterns of
      overall poor performance (missing a large fraction of tasks over several
      days), not for occasionally skipping a single task like brushing teeth.
      Update `evaluateTrophies` logic and trophy descriptions to reflect this
      distinction clearly
- [ ] **Custom achievements** (Plaue's recommendation) — allow users to define
      their own badge with a name and a goal condition. This likely requires
      an onboarding flow on first open: "What are you using this app for?" →
      category/goal selection → account setup. Scope is large; treat as a
      stretch goal post-usability-testing

---

## 🧹 Polish & Misc

- [ ] **Profile stats card shows friends count from live state** ✅ (already
      correct — `friends.length` is used)
- [ ] Confirm the **"Add Friend" flow** works end-to-end with persistence:
      added friends should survive a reload once persistence is in place
- [ ] Review all `Alert.alert` calls for consistent wording and tone across the
      app (nudge sent, friend added, friend removed, habit deleted)
- [ ] Manually test **dark mode + light mode** for all three tabs after any
      styling changes — the theme system is solid but new UI elements need to
      use `C.*` colors rather than hard-coded hex values
