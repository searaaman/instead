# Instead

Pay in effort, not willpower.

**Instead** is an Android app that locks the apps you find yourself doomscrolling
into — Instagram, TikTok, whatever it is for you — until you complete a real,
verifiable task. No streaks to feel bad about, no "just don't open it" willpower
games. You want screen time on a blocked app, you earn it: solve a Sudoku, pass a
code challenge, learn a few words, journal for real, or read something.

## Why

Most habit/blocker apps either hard-block apps (easy to just disable) or ask you
to self-report a "focus session" (easy to fake). Instead does two things
differently:

- **It actually blocks apps at the OS level**, the same way real competitor
  blockers do — via Android's Accessibility Service, not a fragile in-app timer.
- **Every task is genuinely checkable.** A Sudoku either validates or it doesn't.
  Code either passes the test cases (run for real on [Judge0](https://judge0.com/))
  or it doesn't. Drawing is the one exception — it can't be graded, so it's
  deliberately the lowest-paying, rate-limited option instead of the main path.

## How it works

1. **Onboarding** — tell it your name and your goal, see a quick forecast of what
   consistent small effort compounds into over a month.
2. **Pick what to lock** — a real system app picker, not a hardcoded list. Choose
   whatever apps pull you in.
3. **Grant access** — Usage Access + Accessibility Service, both explained plainly
   (including why Android's malware-style warning shows up for any sideloaded app
   using these permissions).
4. **Earn time by doing something real:**

   | Task | What makes it real | Reward |
   |---|---|---|
   | Sudoku | Grid must actually validate as solved | 5–15 min |
   | Code challenge | Code runs against real test cases via Judge0 | 5–10 min |
   | Timed focus | Leaving the app mid-session invalidates the run | 1:1 |
   | Language quiz | Must pass 3/5 | 5 min |
   | Read an article | Scroll-to-bottom + comprehension question | 5 min |
   | Journal | Paste is blocked, minimum word count | 5 min |
   | Draw | Time-based, capped, rate-limited (4/day, 30 min cooldown) | lowest payout |

5. **Unlock and open** whatever you earned time on, straight from the dashboard.

No accounts, no server — everything lives in `AsyncStorage` on your phone.

## Tamper resistance

Uninstalling the Accessibility Service or disabling it mid-session is the obvious
way to cheat a blocker, so Instead's native module watches for it: opening
Android's Accessibility settings while the service is active bounces you back
into the app with a "keep protection on?" screen instead of letting you quietly
switch it off. This isn't unbypassable (that requires full Device Owner
provisioning, out of scope for a hackathon build) — it's friction, not a lock.

## Tech stack

- **Expo SDK 57** (React Native + TypeScript), React Navigation
- **Custom native Expo module** (`modules/app-blocker`, Kotlin) — Android
  `AccessibilityService` for real foreground-app interception and tamper
  detection
- **`react-native-launcher-kit`** — system app picker + launching apps
- **`@antardev/react-native-usage-stats`** — real `UsageStatsManager` data
- **`react-native-svg`** — Sudoku/Draw canvases and the hand-built mascot, Sprout
- **Judge0** (public instance, no API key) — real code execution for the code
  challenge task
- **EAS Build** — cloud Android builds (this environment has no local Android
  SDK/emulator)

## Running it

```bash
npm install
npx expo start
```

Building an installable APK (requires an [EAS](https://expo.dev) account):

```bash
npx eas build -p android --profile preview
```

Note: the Accessibility Service, app blocking, and usage stats only work on a
real Android device/build — Expo Go and the web/iOS targets can't exercise them.

## Project layout

```
modules/app-blocker/     Native Android module (Kotlin) — the AccessibilityService
src/lib/                 Task definitions, storage, native module bridges, theme
src/screens/             Onboarding journey + dashboard + one screen per task type
src/components/Sprout.tsx  The mascot
```

## Status

Built solo for a hackathon (due 2026-09-20). Working end-to-end on a real device:
onboarding, app blocking, all task types, tamper-resistance friction screen, and
the full visual identity. Not yet built: a profile/history dashboard and a few
researched-but-undecided competitor features (strictness tiers, streaks, social
accountability) — deliberately deferred pending a features discussion.
