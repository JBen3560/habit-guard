# Habit Guard

Habit Guard is a mobile habit tracking app built with Expo and React Native (TypeScript), backed by a Supabase (PostgreSQL) database. It lets you create and manage daily habits with full account-based persistence, meaning your data is saved across sessions and devices.

The **Habits** tab shows everything scheduled for today, lets you mark habits as done or skipped, and tracks a live streak count per habit alongside a daily progress bar. Habits can be customized with a title, category, time, and the days of the week they repeat.

The **Achievements** tab rewards consistency with trophies for streak milestones and applies penalties for missed days, giving you something to work toward and a reason to stay on track.

The **Profile** tab gives you a history of your progress over time, a shareable tag to connect with friends, and lets you view their streaks. A nudge button surfaces when a friend has missed a few days so you can send encouragement.

The app is also live on the web at **[habit-guard.netlify.app](https://habit-guard.netlify.app)**, where you can sign in and use a browser-based version of the application.

---

## Creators

Team 1: Runtime Terrors — Clemson University, Spring 2026

Joey Benich, Kylie Gilbert, Miles Rockow, Noah Samol, Stephanie Justus

See [ACKNOWLEDGEMENTS](./ACKNOWLEDGEMENTS) for individual contribution details.

---

## License

This project is source-available under the **PolyForm Noncommercial License 1.0.0**.
See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md) for details.

---

## Environment Setup

This app requires a `.env` file in the project root to connect to the Supabase backend. **This file is not included in the repository.** Contact a team member to obtain the required values, then create the file as follows:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app will not function without these values.

---

## Getting Started

The Makefile provides a workaround for the lack of `npx` on the School of Computing machines (as discussed with Anna during standup). It installs `nvm` and Node locally without requiring `sudo`.

```bash
make install   # First-time setup: installs nvm, Node 20, and all dependencies
make run       # Start the app (runs install automatically if needed)
make clean     # Remove node_modules
```

> **Note:** `make install` uses `npm ci` to install dependencies exactly as specified in `package-lock.json`. All dependencies including Supabase, async storage, and gesture handling are handled automatically. You must still create the `.env` file manually as described above before running.

To run without the Makefile (will not work on School of Computing machines):

```bash
npm install
npx expo start
npx expo start --clear   # to clear cache on relaunch
```

---

## Running on a Device

### iOS

1. Download **Expo Go** from the App Store.
2. Scan the QR code shown in your terminal using your iPhone camera.
3. Allow the app to load.

### Android

1. Download **Expo Go** from the Google Play Store.
2. Open Expo Go and scan the QR code shown in your terminal.
3. Allow the app to load.

### Web

1. Copy the local URL shown in your terminal into a browser tab, or visit the live version at [habit-guard.netlify.app](https://habit-guard.netlify.app).
2. Allow the page to load.

---

## Project Structure

```
habit-guard/
├── app/                  # Expo Router screens and tab layout
│   ├── (tabs)/           # Main tab screens: habits, achievements, profile
│   └── _layout.tsx       # Root layout and auth gate
├── components/           # Shared UI components
├── lib/                  # Supabase client, auth, tasks, friends, trophies
├── src/
│   ├── context/          # Auth, Theme, and TimeFormat context providers
│   └── types/            # Shared TypeScript types
├── public/               # Static web pages (auth confirmation, about, etc.)
├── constants/            # Theme constants
├── ACKNOWLEDGEMENTS      # Contributor credits
├── LICENSE               # PolyForm Noncommercial License 1.0.0
├── NOTICE.md             # Human-readable license summary
└── makefile              # School of Computing setup workaround
```
