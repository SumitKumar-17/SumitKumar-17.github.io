---
title: KeystoneDB
date: 2025-04-12
repo: SumitKumar-17/keystoneDB
topics: ["C++", "Databases", "Compilers", "RocksDB"]
lead: A custom relational database engine with its own SQL parser and query executor.
image: keystonedb.png
image_border: true
---

> "Let's build a database engine."

I made this custom small database project as part of my Database Management Laboratory final assignment. When I first looked at the list of recommended full-stack projects, I was honestly bored. They all felt too templated. So instead of picking one of those ideas or copying a senior's project, I decided to do something from scratch — something that sounded cool.

At the time, it felt ambitious. But I'd been curious about how databases actually work under the hood. So this was the perfect excuse to explore that.

[KeystoneDB](https://keystonedb.sumitk.me) is what came out of that effort.

**What is it?** A custom-built relational database engine with its own mini-SQL parser and a query executor that talks to a key-value store (RocksDB) underneath. It has a hand-written lexer and parser (using Flex and Bison), supports a small SQL-like query language, compiles queries into operations that run against RocksDB, and stores data in a log-structured way, somewhat like LSM trees.

I wanted to learn how databases *really* work. I'd heard terms like "query plan," "transaction log," "WAL," "compaction," "indexing," but they were just words to me. This project connected all that theory to real working code, instead of treating SQLite or Postgres as a black box.

Stack: **C++** for the core engine, **RocksDB** for persistent key-value storage, **Flex/Bison** for the SQL-like lexer and parser, and **Google Test** for unit testing — 70+ tests covering parsing accuracy, transaction consistency, and safe concurrent execution.

It wasn't always smooth. I broke things a lot. RocksDB has a bit of a learning curve, and writing your own SQL parser is surprisingly tricky, especially with whitespace and multi-line queries. But it was worth it — this became more than a lab submission; it was a deep dive into writing compilers, working with LSM-tree-based storage, and understanding query execution end to end.
