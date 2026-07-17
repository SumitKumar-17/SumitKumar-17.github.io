---
title: Vercel Delete
date: 2026-07-12
repo: SumitKumar-17/vercel-delete
topics: ["CLI", "Node.js", "DevTools"]
lead:
  A CLI tool to bulk-delete Vercel projects interactively, since Vercel's own
  CLI won't let you.
image: vercel-delete.png
image_border: true
---

If you've ever spun up a Vercel project for every throwaway demo, side project,
or "let me just test this real quick" idea, you know how this ends: dozens of
dead projects cluttering your dashboard. Deleting them one at a time through the
web UI is painful, and — somewhat bizarrely — the official Vercel CLI doesn't
support bulk deletion at all. So **vercel-delete** exists to do the one thing
Vercel itself won't let you do easily.

## What it does

Point it at your account with a Vercel API token, and it gives you an
interactive checklist of every project you own: arrow keys to navigate, `space`
to select individual projects, `a` to toggle all of them at once, and `enter` to
confirm your selection. Nothing gets deleted until you clear one final
confirmation prompt — bulk-deleting infrastructure is exactly the kind of
operation that should be hard to do by accident.

```bash
npm install
export VERCEL_TOKEN=your_token_here
node delete.mjs
```

There's also a small web UI alternative (`server.js`, running at
`localhost:3456`) for anyone who'd rather click through a browser than drive a
terminal checklist — same underlying bulk-delete logic, different front end.

Small tool, but it replaced what used to be twenty minutes of tedious clicking
with about ten seconds of arrow-key-and-spacebar.
