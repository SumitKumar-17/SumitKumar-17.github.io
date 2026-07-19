---
title: Build Your Own SQLite (Go)
date: 2026-01-28
repo: SumitKumar-17/codecrafters-sqlite-go
topics: ["Go", "Databases", "File Formats"]
lead:
  A from-scratch SQLite file-format reader in Go, built through CodeCrafters'
  "Build Your Own SQLite" challenge.
---

SQLite's `.db` file is a single, self-contained binary format — no server, no
separate WAL by default, just pages on disk. This project works through
[CodeCrafters' "Build Your Own SQLite" challenge](https://codecrafters.io/challenges/sqlite),
building a barebones SQLite reader in Go that can parse that format directly and
answer basic `SELECT` queries against it, staged incrementally rather than all
at once.

Each stage forces a deeper layer of the format: parsing the database header and
page structure first, then reading table b-trees to list tables and their
schemas, then walking b-tree leaf pages to actually read rows, and eventually
using an index b-tree to do an index scan instead of a full table scan. It's the
same progression
[this excellent explainer](https://jvns.ca/blog/2014/10/02/how-does-sqlite-work-part-2-btrees/)
on SQLite's b-trees walks through — except here it has to actually run against
real `.db` files, including a companies database with an index
(`idx_companies_country`) that only pays off once the index-scan stage is
implemented correctly.

Testing happens against real sample databases (`sample.db` with
`apples`/`oranges` tables, `superheroes.db` for the table-scan stage,
`companies.db` for the index-scan stage), so there's no faking it with synthetic
data — the parser either reads the actual file format correctly or it doesn't.
