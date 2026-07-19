---
title: DBEditor
date: 2026-05-08
repo: SumitKumar-17/dbEditorViewer
topics: ["Go", "React", "DevTools"]
lead:
  A browser-based universal database manager for Postgres, MySQL, SQLite, and
  MongoDB — still a work in progress.
image: image1.png
subimages: ["image2.png", "image3.png"]
---

**Still actively in progress** — this is one I keep coming back to rather than
something I'd call finished, so treat the feature list below as "working" rather
than "polished."

The pitch: paste a database connection URL, get a full GUI — spreadsheet-style
data editor, schema explorer, and SQL query console — with nothing to install
beyond the server itself. One tool instead of switching between pgAdmin, MongoDB
Compass, and a SQLite browser depending on what you're connected to that day.

**Multi-database support** spans PostgreSQL, MySQL/MariaDB, SQLite, and MongoDB,
each behind its own driver implementation on the backend
(`internal/db/drivers/`), fronted by a connection-type auto-detector that
figures out what you pasted from the URL scheme alone. The data editor uses AG
Grid with inline cell editing, add/delete rows, sorting, and column filters; the
query console is a full Monaco editor (the same engine VS Code uses) with syntax
highlighting and Ctrl+Enter execution — MongoDB queries go through a JSON filter
format instead of SQL, since there's no SQL to write against a document store.

**Stack:** Go 1.22 + Gin on the backend, with `pgx`, `go-sql-driver/mysql`,
`modernc.org/sqlite`, and the official MongoDB Go driver behind a thread-safe
connection pool; React 18 + TypeScript + Vite + Tailwind + shadcn/ui on the
frontend, with Zustand for UI state and TanStack Query for data fetching.
Connections persist to `~/.dbeditor/connections.json` and auto-reconnect on
restart. Ships with a Docker Compose setup that runs the whole thing — Go
backend, Nginx-fronted frontend — behind one `docker compose up`.
