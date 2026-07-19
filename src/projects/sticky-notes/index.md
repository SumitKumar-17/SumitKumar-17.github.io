---
title: Sticky Checklist Notes
date: 2026-05-10
repo: SumitKumar-17/Sticky-Notes
topics: ["Tauri", "React", "TypeScript"]
lead:
  A desktop checklist-notes app for Linux, built with Tauri instead of another
  Electron app.
image: demo.png
---

Most "sticky notes" apps for Linux are either abandoned GNOME extensions or an
Electron app burning 300MB of RAM to show a text box. I wanted something
native-feeling, checklist-first (not just freeform text), and light — so I built
it on **Tauri** instead: a Rust-backed shell around a React frontend, producing
an actual small native binary per platform rather than shipping a whole Chromium
runtime.

It's a proper checklist-notes app, not just sticky text: create, search (by
title or checklist content), duplicate, and delete notes; add/edit/toggle/delete
individual checklist items; filter items by all/open/done; mark everything done
or reset in one action; and track completion progress per note. Everything's
persisted locally in the app's own data directory — no account, no sync service,
no cloud dependency.

**Modular by design**, not just in theory:

- `useNotes.ts` owns all state management and the Tauri-side data operations
- `NotesSidebar.tsx` handles the note list, search, sort, and import/export
  controls
- `NoteEditor.tsx` is just the checklist editor and bulk actions
- Import/export round-trips notes as JSON, with ID/field normalization on import
  so merging notes from another machine doesn't collide

Building for Arch Linux means pulling in the full WebKitGTK + AppIndicator stack
(`webkit2gtk-4.1`, `libappindicator-gtk3`, `librsvg`, plus the Rust toolchain)
before `cargo`/`npm` even get involved — that packaging reality is exactly the
tax you pay for a genuinely native, genuinely small desktop app instead of
another Electron wrapper.
