# Habit-Guard — TODO

**Team 1: Runtime Terrors**
Last updated: 2026-03-30

---

## 🗄️ Data Persistence

The app currently resets all state on every reload. Everything below should
survive a full app close and reopen.

The group has aligned on a **simple backend approach** (see Slack thread below)
as the preferred path — this solves persistence, enables real historical data
for streaks and the profile charts, and sets up account-based multi-device
use all at once. AsyncStorage is the fallback if a backend isn't feasible
before the usability test.

> **From Slack (2026-03-30):**
> Joey: "we should probably try to hook it up to a simple backend so that we
> can actually track previous days data. This would kind of solve both issues
> at once, since we could pull from that for users when they close the app,
> and also it would allow us to have real streaks and make all achievements
> work."
> Stephanie: "wouldn't take outrageously long to do that either since it would
> be extremely basic backend design" / "permanent server I can handle, if we
> want to implement docker"

### Option A — Backend (preferred)

- [ ] Stand up a simple backend server (Docker / Node or equivalent per
      Stephanie's suggestion)
- [ ] Design a minimal schema: users, tasks, daily completion records, friends,
      trophies
- [ ] Add an **account creation + login screen** shown on first app open
      (Joey's suggestion: "it might require an account creation screen and
      login screens, but that shouldn't be too bad either")
- [ ] On each day's first completion toggle, write a completion record to the
      backend so that real historical data accumulates over time
- [ ] Pull historical data on app load to hydrate streaks, heatmap, and the
      7-day chart with real values (replaces the seeded random data in
      `buildHistory`)

### Option B — AsyncStorage (fallback / short-term)

- [ ] Install `@react-native-async-storage/async-storage`
      (`npx expo install @react-native-async-storage/async-storage`)
- [ ] Persist **tasks** (including `completedToday`, `skippedToday`,
      `streakCount`, and the full task list with any user-added or deleted tasks)
- [ ] Persist **trophies** (earned status and earned dates)
- [ ] Persist **friends** (including any friends added via the Add Friend flow)
- [ ] Persist **theme preference** (dark / light / system) — currently held in
      ThemeContext but not saved to disk
- [ ] On app load, hydrate all state from AsyncStorage before rendering (show a
      brief loading state to avoid flash of default data)
- [ ] Kylie noted phone cache as another angle ("we know it's possible from the
      struggle with the image change for the launch icon") — AsyncStorage is
      the standard Expo abstraction over this

### Either path

- [ ] Add a daily **reset gate**: on first open of a new calendar day, clear
      `completedToday` and `skippedToday` on all tasks (streaks persist — only
      today's completion flags reset)
- [ ] **Skipping a task should break its streak at end of day** — currently
      skipping has no effect on `streakCount`. At the daily reset, if a task
      was skipped (and not completed), set its streak to 0

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
