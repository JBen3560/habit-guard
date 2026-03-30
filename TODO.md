# Habit-Guard — TODO

**Team 1: Runtime Terrors**
Last updated: 2026-03-30

---

## 🗄️ Data Persistence (AsyncStorage)

The app currently resets all state on every reload. Everything below should
survive a full app close and reopen.

- [ ] Install `@react-native-async-storage/async-storage` and add it to the
      project (`npx expo install @react-native-async-storage/async-storage`)
- [ ] Persist **tasks** (including `completedToday`, `skippedToday`,
      `streakCount`, and the full task list with any user-added or deleted tasks)
- [ ] Persist **trophies** (earned status and earned dates)
- [ ] Persist **friends** (including any friends added via the Add Friend flow)
- [ ] Persist **theme preference** (dark / light / system) — currently held in
      ThemeContext but not saved to disk
- [ ] On app load, hydrate all state from AsyncStorage before rendering (show a
      brief loading state to avoid flash of default data)
- [ ] Add a daily **reset gate**: on first open of a new calendar day, clear
      `completedToday` and `skippedToday` on all tasks (streaks should persist —
      only today's completion flags reset)

---

## ✅ Habits Tab

- [ ] **Bug: streaks don't reset correctly.** `toggleTaskComplete` increments
      `streakCount` by 1 on each tap, but if a user un-checks a habit multiple
      times it can go negative or drift. Tie streak logic to the daily reset gate
      (see Persistence above) rather than to the toggle button
- [ ] **Bug: "Done" count in the header counts skipped tasks as done** — confirm
      whether skipped should count toward the progress ring or not, and make it
      consistent
- [ ] Add a **swipe-to-delete** or long-press delete affordance on habit cards
      as a faster alternative to tapping into the edit modal (the delete button
      is already in the modal, but it requires several taps)

---

## 👤 Profile Tab

- [ ] **Bug: progress charts use `INITIAL_TASKS` directly** (`ProgressSection`
      is passed `INITIAL_TASKS` as a hard-coded prop in `ProfileTab`). Change
      it to receive and use the live `tasks` prop so charts reflect actual
      user habits
- [ ] **`MY_STREAK` is hard-coded to 13.** Replace with a value derived from
      the user's task data (e.g. the longest current `streakCount` among active
      tasks, or a dedicated "overall streak" concept)
- [ ] **`MY_TASKS` counts all `INITIAL_TASKS`** rather than the live task list.
      Fix to count from the live `tasks` prop
- [ ] **Friend deletion** — add a delete/remove button to the `FriendModal`
      (next to or below the nudge section) that calls `setFriends` to remove
      the friend and closes the modal. Consider an `Alert.alert` confirmation
      before deleting
- [ ] **Hard-coded friend bios** — `FriendModal` renders specific bio text for
      `@cplaue` and `@agalean` only. Friends added via the Add Friend flow show
      nothing. Either remove the bio section for added friends gracefully, or
      make bio an optional field in the `Friend` type that users can set
- [ ] **28-day heatmap and category charts are simulated** (`buildHistory` uses
      seeded random data, not real completions). This is acceptable for the
      usability test but should be noted as a known limitation for testers —
      leave a `// TODO:` comment in `mockData.ts` so it's easy to find later

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
      `earned: false` to `earned: true`, show a brief modal or toast ("🎉
      Achievement Unlocked: First Step!"). Hook into the return value of
      `evaluateTrophies` to diff old vs new earned state and trigger the alert

---

## 🧹 Polish & Misc

- [ ] **Profile stats card shows friends count from live state** ✅ (this one is
      already correct — `friends.length` is used)
- [ ] Confirm the **"Add Friend" flow** works end-to-end with persistence:
      added friends should survive a reload once AsyncStorage is in place
- [ ] Review all `Alert.alert` calls for consistent wording and tone across the
      app (nudge sent, friend added, habit deleted)
- [ ] Manually test **dark mode + light mode** for all three tabs after any
      styling changes — the theme system is solid but new UI elements need to
      use `C.*` colors rather than hard-coded hex values

# TODO LIST FOR USER TESTING VERSION

- [ ] Fully implement backend historical data for progress on profile page
- [ ] make sure last seven day progress bars show for web version on the profile page. Percentage currently displayed, but not filled bars
- [ ] add a tab to the habits page for skipped tasks instead of marking skipped tasks as completed ones
- [ ] On habits/tasks page, sort by time no matter how they are imported in mockData instead of by type
- [ ] Along with having the badges move upwards once they’re unlocked. Have them organized by accomplishment date
- [ ] ability to delete friends
- [ ] ability to add custom achievements (per Plaue's recommendation. idk why, but sure, whatever. this would require asking what the use case for the app is when you originally open it and whatnot. like Open App --> What are you using this app for selection --> input information for account creation --> idk )
- [ ] add in in-app notification for when a achievement is earned.

- add/update stuff for history on previous days (last week for percentage. 28 day or month period for heatmap)

- streak saver = snapchat paid streak saver

- streak ends if not marked as skipped?
- specific % of tasks not done in a 24 hour period?
  (slacker penalty badge/card)

- if you skip a task, it ends the streak
- penalties are for friends to check on you if you're overall doing poorly (half, certain number of days, falling behind. Aka, not necessary for skipping teeth brushing)

Update profile tab to include some progress function

**_ADD MORE STUFF BECAUSE THERE IS_**

## Convo with Steph about saving data

Stephanie Justus — 9:48 AM
the only thing i’m curious if we can fix by the time we have users test:
seeing if we can make it save data even when you close out of the app
that way if we have users test over an entire day, they don’t have to worry about closing out by accident
Kylie Gilbert — 9:50 AM
yeah, i think in order to do that, you might have to set-up an account at app start originally. And maybe fully compile in XCode and launch with expo dev like in that video i shared the other day
and we also might need a permanent server
Stephanie Justus — 9:51 AM
permanent server i can handle, if we want to implement docker
Kylie Gilbert — 9:51 AM
or make sure it saves that data to your phone's cache (we know it's possible from the struggle with the image change for the launch icon)
Kylie Gilbert — 10:43 AM
@Joey what did you say before I left about historical data or whatever?
Joey — 11:09 AM
just that we should probably true to hook it up to a simple backend so that we can actually track pervious days data
This would kind of solve both issues at once, since we could pull from that for users when they close the app, and also it would allow us to have real streaks and make all achievements work
kind of the last thing to do
Stephanie Justus — 11:10 AM
wouldn’t take outrageously long to do that either
since it would be extremely basic backend design
Joey — 11:10 AM
that's what I'm thinking
It might require an account creation screen and login screens, but that shouldn't be too bad either?
