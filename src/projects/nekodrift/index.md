---
title: NekoDrift
date: 2026-06-19
repo: SumitKumar-17/NekoDrift
topics: ["Electron", "TypeScript", "Desktop"]
lead:
  A pixel cat that lives on your desktop, follows your cursor, and reacts to
  every Claude Code tool call.
---

A pixel cat that lives on your desktop — follows your cursor, reacts to typing,
and gets visibly stressed out when Claude Code is grinding through a long tool
call. The README undersells how much is actually going on under the hood, so
here's the fuller picture.

**NekoDrift** is an Electron app, not a browser toy, which matters: it needs to
track your cursor and keystrokes _outside_ its own window to react in real time.
That's done with `uiohook-napi` for global mouse/keyboard hooking from the main
process, feeding a set of small, focused modules rather than one monolithic
background script:

- `mouse-tracker.ts` / `keyboard-tracker.ts` — cursor-follow with smooth lag and
  eye tracking, plus WPM-driven "heat level" from typing speed
- `idle-detector.ts` — drives the mood system (happy / content / tired / lonely)
  based on how long you've actually been at the keyboard
- `pomodoro-timer.ts` / `stretch-timer.ts` / `message-reminder.ts` — the
  productivity side: Pomodoro sessions, stretch reminders, and scheduled daily
  nudges
- `sprite-manager.ts` — drives the pixel coat editor (a 16×16 grid, 10 colors)
  and the animation states
- `tray.ts` / `window-manager.ts` / `ipc-handlers.ts` — the usual Electron
  plumbing to keep a transparent, always-on-top window behaving

The Claude Code integration is its own small HTTP server (`http-server.ts`)
running in the main process — Claude Code's hooks call into it on every tool
invocation, and the cat's mood/animation state reacts accordingly. On the
renderer side, the cat itself, its sprite states, onboarding flow, and settings
panel are split into their own component folders rather than crammed into one
view.

No files, no sound assets shipped — the sound engine (purr, meow, chime) is
synthesized live via the Web Audio API. Nightly builds are published
automatically from CI on every push, alongside the stable Releases.
