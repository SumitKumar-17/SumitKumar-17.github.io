---
title: PrismViewer
date: 2025-01-01
repo: SumitKumar-17/Prismviewer
topics: ["Prisma", "DevTools", "Node.js"]
lead: A lightweight Prisma schema viewer and database editor for quick DB tweaks.
---

A small side project I made out of necessity while working with Prisma on a few other projects. Sometimes I just want to view the current schema, tweak a collection, or inspect what's inside a DB without opening a full SQL client or hand-writing queries. Prisma Studio is great, but I wanted something even lighter — paste in a database URL, and go.

[PrismViewer](https://prismviewer.sumitk.me/PrismViewer) is a small Prisma wrapper that pulls the database schema and gives you a quick UI to browse and inspect things: paste your database URL, it runs `prisma db pull` under the hood, spins up a local viewer, and lets you view tables and fields quickly — all Prisma-powered and lightweight.

Nothing fancy under the hood: Node.js, Prisma, and a simple frontend that displays tables. It's local-dev-focused, not production-ready, but it saves me from scaffolding an entire full-stack app just to check if one field is set correctly in one row. Not everything has to be huge or polished to be useful.
