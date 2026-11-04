---
title: Dipper
date: 2026-11-04
repo: SumitKumar-17/dipper
topics: ["Go", "TypeScript", "PostgreSQL", "MySQL", "SQLite"]
lead:
  A local-first SQL workspace for Postgres, MySQL, and SQLite - one binary, no
  account, no cloud, that watches a query run stage by stage instead of just
  handing back rows.
image: hero.png
subimages: ["schema-editor.png", "relationship-view.png", "command-palette.png"]
---

**Dipper** is a SQL workspace for people who spend their time writing,
exploring, and understanding SQL - the schema, an editor, results, plans, and a
table editor in one place, with your queries kept as plain `.sql` files on disk
instead of locked inside a proprietary workspace format. It's one self-contained
binary around 14 MB: no account, no cloud service, no bundled database, no
telemetry. It connects to the Postgres, MySQL, or SQLite you already have -
local, containerized, or hosted on Neon, Supabase, or RDS - and on first launch
finds the databases already running on your machine and offers to connect.

```sh
curl -fsSL https://raw.githubusercontent.com/SumitKumar-17/dipper/main/install.sh | sh
```

The server and CLI are Go; the UI and shared packages are TypeScript, wired
together as a Bun workspace monorepo.

## Query Walk

The feature I spent the most time on: watching a `SELECT` execute one stage at a
time -
`FROM → JOIN → WHERE → GROUP BY → HAVING → WINDOW → SELECT → DISTINCT → ORDER BY → LIMIT` -
with the actual rows at each stage, not just an `EXPLAIN` tree. Window functions
get their own stage showing exactly which rows fed each computed value; a query
with CTEs is walked one chapter per CTE; a `LATERAL` join is walked as what it
is, the subquery re-run once per outer row; a recursive CTE steps one pass at a
time until a pass adds nothing. Every stage of one walk pins a single read-only
transaction, so a row someone else changes mid-walk can't make two stages
disagree - on Postgres and MySQL that's a real `REPEATABLE READ` snapshot, and
the UI says so with a badge rather than pretending the guarantee exists
everywhere.

A walk exports to a single offline `.html` file that replays the whole thing -
every stage, its rows, play/pause/step - with no network calls, so it opens
straight from disk.

## Everything else in the workspace

- **Schema-aware editor** - completion reads the query you're writing, offers
  joins with their `ON` clause pulled straight from the foreign key, and maps a
  database error back to the exact place in your SQL.
- **Relationship View** - foreign keys turned into an interactive, draggable
  schema diagram; large tables collapse to a compact keys-only view so it stays
  readable.
- **Table Editor** - browse and edit a table, change its structure, and see
  every change as the SQL it will run before it runs, checked with a dry run and
  applied in one undoable transaction.
- **Safety by design** - color-tag a connection, mark one read-only (enforced
  server-side, not just hidden in the UI), reach a database over an SSH tunnel,
  connect over verified TLS.

## Why local-first

Everything lives in `~/.dipper/` - connections, settings, snippets, query
history, your `.sql` files - nothing phoned home. `DIPPER_HOME` moves the
directory if you want it somewhere else. The trade-off I made deliberately: no
sync, no team features yet, in exchange for a tool that works the same offline
as it does connected to production.
