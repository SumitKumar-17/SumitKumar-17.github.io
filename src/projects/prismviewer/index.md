---
title: PrismViewer
date: 2025-01-01
repo: SumitKumar-17/Prismviewer
topics: ["Prisma", "DevTools", "Node.js"]
lead:
  A lightweight Prisma schema viewer and database editor for quick DB tweaks.
---

Sometimes you just want to peek at a schema, tweak one row, or check if
`isAdmin` is actually `true` for some user - and firing up a full SQL client, or
writing a one-off query, feels like overkill for that. Prisma Studio already
solves this reasonably well, but I wanted something even lighter, so I built
[PrismViewer](https://prismviewer.sumitk.me/PrismViewer).

**The workflow:** paste a database connection URL in. It runs `prisma db pull`
behind the scenes to introspect the schema, spins up a local viewer, and gives
you a quick UI to browse tables and fields - no writing queries, no opening a
heavier client, no scaffolding an app just to check one value.

I've half-jokingly called it "Prisma Cloud" for fun, but it's really more like
Prisma Viewer Lite - built for exactly one job: get you from _"I have a DB URL"_
to _"I can see what's actually in there"_ in the fewest possible steps.

Under the hood it's nothing fancy - Node.js, Prisma, and a simple frontend that
renders tables - and it's explicitly local-dev-focused, not production-ready.
But it saves real time on the days where the alternative is opening pgAdmin just
to confirm one field, and that's really the whole point: not everything has to
be polished to be genuinely useful.
