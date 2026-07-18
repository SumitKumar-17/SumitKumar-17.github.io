---
title: Semester Course Selector
date: 2026-07-15
repo: SumitKumar-17/Semester-Course-Selector
demo: https://semester-course-selector.vercel.app/
topics: ["JavaScript", "Productivity"]
lead:
  A local, no-login tool for picking electives and a TA course without
  double-booking your own timetable.
image: course-selector.png
---

Every semester at IIT Kharagpur comes with the same ritual: pick a handful of
electives plus a TA course off a dense department subject list, and try to do it
without accidentally scheduling two of them into the same timetable slot.
GitHub's own description field for this repo, in my own words at the time, was
just **"I am lazy"** — which is really the whole origin story. So I built a tool
to do the conflict-checking for me.

**[Try it live](https://semester-course-selector.vercel.app/)** — no install, no
login, no build step. It's a static page: courses are grouped by timetable slot,
and picking one automatically blocks every other course in that same slot,
including the messier multi-option lab slots where several different slot
letters are actually alternative choices rather than one big conflict. You can
also mark courses as **completed** or **tough/avoid** to keep the whole list
organized as you narrow things down. Every pick, flag, and completed mark is
saved straight to the browser's `localStorage` — nothing leaves your machine,
and there's nothing to log into.

## Making it reusable beyond my own semester

The course list itself lives in a plain `COURSES` array in `data.js`, which
means adapting this to a different department or semester is just a data-entry
exercise, not a code change:

```js
{ code: "CS10003", name: "...", faculty: "...", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "..." }
```

Copy your subject list straight from your college ERP's course allocation page,
paste the slot codes exactly as the ERP lists them, and the conflict logic just
works — a lecture slot like `B31,B32,B33` (same letter repeated) collapses into
one slot, while a lab slot like `J,K,L,N,P,X` is treated as multiple alternative
options instead of one enormous conflict. If your program needs a different
number of picks than "3 electives + 1 TA course," that's one constant to change
in `state.js`.

A small tool, but one that's saved me from at least one real scheduling headache
every registration cycle since I built it.
