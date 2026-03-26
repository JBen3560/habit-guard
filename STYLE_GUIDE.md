# Habit Guard — Code Style Guide

This document explains the formatting and linting setup for the project and what
every contributor needs to do to comply.

---

## Tools

| Tool | Purpose |
|------|---------|
| **Prettier** | Opinionated code formatter — handles all whitespace, quotes, commas, etc. |
| **ESLint** | Static analysis — catches bugs, enforces naming conventions, import order, React patterns. |
| **VSCode settings** | Ties the two together so your editor formats and fixes on every save. |

---

## Quick-start (one-time setup)

### 1. Install dev dependencies

Prettier and the TypeScript ESLint plugin are not yet in `package.json`.
Run the following once after cloning:

```bash
npm install --save-dev \
  prettier \
  eslint-import-resolver-typescript \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```

> `eslint-config-expo` already pulls in most of the React/hooks rules, so you
> don't need to install those separately.

### 2. Install the required VSCode extensions

Open the command palette (`Cmd/Ctrl + Shift + P`) → **Extensions: Show Recommended Extensions**
and install everything in the list. The two critical ones are:

- **esbenp.prettier-vscode** — Prettier formatter
- **dbaeumer.vscode-eslint** — ESLint

### 3. Reload the window

`Cmd/Ctrl + Shift + P` → **Developer: Reload Window**

After that, every file save will automatically format and auto-fix lint errors.

---

## Naming conventions (enforced by ESLint)

| Thing | Convention | Example |
|-------|-----------|---------|
| Variables | `camelCase` | `streakCount`, `isDark` |
| Functions | `camelCase` | `handlePress`, `getColors` |
| React components | `PascalCase` | `TaskCard`, `ThemedText` |
| Custom hooks | `camelCase` starting with `use` | `useColorScheme`, `useThemeColor` |
| Types & interfaces | `PascalCase` | `Task`, `Trophy`, `Colors` |
| Enums & enum members | `PascalCase` | `Category.Exercise` |
| Module-scope constants | `UPPER_SNAKE_CASE` | `INITIAL_TASKS`, `DAY_LABELS` |
| File names | `kebab-case` | `themed-text.tsx`, `use-color-scheme.ts` |

> **No snake_case in variable/function names.** The ESLint `@typescript-eslint/naming-convention`
> rule will flag violations as errors.

File names use kebab-case (already the convention in this repo) and that is intentional —
it keeps the filesystem cross-platform safe and is consistent with Expo Router's
expectations.

---

## Prettier rules (`.prettierrc`)

```
singleQuote: true       → 'hello' not "hello" in JS/TS
jsxSingleQuote: false   → "hello" in JSX attributes (React convention)
semi: true              → always end statements with ;
trailingComma: all      → trailing comma on last item in multi-line lists
printWidth: 100         → soft wrap at 100 characters
tabWidth: 2             → 2-space indentation
bracketSameLine: false  → closing > of JSX on its own line
arrowParens: always     → (x) => x  not  x => x
endOfLine: lf           → Unix line endings everywhere
```

---

## Running lint manually

```bash
# Check for issues
npm run lint

# Auto-fix everything fixable
npm run lint:fix

# Format all files with Prettier
npx prettier --write "**/*.{ts,tsx,js}"
```

---

## What gets auto-fixed on save vs. what you must fix yourself

| Category | Auto-fixed on save? |
|----------|-------------------|
| Formatting (spacing, quotes, commas, indentation) | ✅ Yes — Prettier |
| Unused imports | ✅ Yes — ESLint |
| `const` vs `let` | ✅ Yes — ESLint |
| Import order | ✅ Yes — ESLint |
| Naming convention violations | ❌ No — must rename manually |
| Missing hook dependencies | ❌ No — must fix manually |
| `any` types | ❌ No — must fix manually |
