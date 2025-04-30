---
title: "PrismViewer"
description: "A simple Prisma schema viewer and database editor for quick DB tweaks"
publishDate: "30 April 2025"
draft: false
tags: ["prisma", "fullstack", "devtools", "sideprojects"]
---

# PrismViewer

This one’s a small side project I made out of necessity while working with Prisma on a few projects.

Sometimes I just want to view the current schema, tweak some collections, or inspect what's inside my DB without opening a full SQL client or writing queries manually. Writing queries for one-off stuff feels like overkill. And Prisma Studio is great, but I wanted something even lighter.

Also say if have someone's DB URL , just pull schema and use studio to check, :)

So, I built [**PrismViewer**](https://prismviewer.sumitk.me) — a small Prisma wrapper that pulls the database schema and gives you a quick UI to browse and inspect things.

## What does it do?

- You paste your **database URL**.
- It runs `prisma db pull` under the hood.
- Spins up a local viewer at `localhost:5555`.
- Lets you view tables and fields quickly.
- All Prisma-powered, super lightweight.

I’ve been calling it **“Prisma Cloud”** for fun, but it’s really more like Prisma Viewer Lite™ — made just for local use.

## Why I made it

During dev work, especially with projects that use Prisma, I sometimes just want to:
- Peek at a schema
- Check field types
- Make tiny schema or data tweaks
- Avoid opening DBeaver or pgAdmin

And I didn’t want to scaffold an entire full-stack app just to check if `isAdmin` was `true` in one row.

Another reason is that say I ahvea DB URL and I want to check it . I won't bew writing queries why not `prisma db pull` and just `npx prisma studio` simply. Whole Db is there. 

I also found it a lot simpler to write the schema and push it to any Database ,or rather pull schema, simply write Schema and converts into complex SQL queries with primary,foreign indexing all handled smoothly.

Who the hell wastes so much time in writing simple SQL Create queries when you can optimize and write it fast.

So this helps.

## Tech Stack

Nothing fancy:
- **Node.js**
- **Prisma**
- A simple frontend that displays tables
- Local dev-focused, not production ready (yet)

## Demo

You can check out a live hosted version (still experimental) here:  
[prismviewer.sumitk.me/PrismViewer](https://prismviewer.sumitk.me/PrismViewer)

It’s private to your session — just paste in your own DB URL and it starts a local viewer for you.

## Final Thoughts

Not everything has to be huge or polished to be useful. PrismViewer saves me time, and that’s what matters.

Might add more features later — maybe an actual schema visualizer soon.

If you're working with Prisma and want to speed up your dev loop, give it a try.  
DMs are open if you have feature ideas or bugs to report 🛠️

---

Source Code: [github.com/SumitKumar-17/Prismviewer](https://github.com/SumitKumar-17/Prismviewer)
