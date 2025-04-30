---
title: "KeystoneDB"
description: "My experience in making a small custom Database"
publishDate: "12 April 2025"
draft: false
tags: ["database", "compilers", "tech","grpc","rocksdb"]
---
```

# KeystoneDB

I made this custom small database project as part of my Database Management Laboratory final assignment. When I first looked at the list of recommended full-stack projects, I was honestly bored. They all felt too templated. So instead of picking one of those ideas or copying a senior’s project, I decided to do something from scratch—something that sounded cool.

> “Let’s build a database engine.”

At the time, it felt ambitious. But I’d been curious about how databases actually work under the hood. So this was the perfect excuse to explore that.

[KeystoneDB](https://keystonedb.sumitk.me) is what came out of that effort.

## What is KeystoneDB?

KeystoneDB is a custom-built relational database engine with its own mini-SQL parser and a query executor that talks to a key-value store (RocksDB) underneath.

Here’s what it does:
- It has a hand-written lexer and parser (using Flex and Bison).
- It supports a small SQL-like query language.
- It compiles queries into operations that run against RocksDB.
- It stores data in a log-structured way (somewhat like LSM trees).

Think of it as writing a compiler for a SQL subset and pairing it with a tiny execution engine and storage layer.

## Motivation

I wanted to learn how databases *really* work. I’d heard terms like “query plan,” “transaction log,” “WAL,” “compaction,” “indexing,” etc., but they were just words to me. This project helped connect all that theory to real working code.

Instead of using SQLite or PostgreSQL as a black box, I wanted to build something—even if simple—that could:
- Parse input queries
- Interpret/compile them
- Interact with low-level storage

## Learning Curve & Stack

Here’s what I ended up using:
- **C++** for the core database engine (tight control + performance)
- **RocksDB** for persistent key-value storage
- **Flex/Bison** for writing the SQL-like lexer and parser
- **Google Test** for unit testing

It wasn’t always smooth. I broke things a *lot*. RocksDB has a bit of a learning curve, and writing your own SQL parser is surprisingly tricky (especially when dealing with whitespace and multi-line queries). But the learning was worth it.

## Sample Query

Here's a glimpse of how it looks:

```sql
CREATE TABLE users (id INT, name TEXT);
INSERT INTO users VALUES (1, 'Alice');
SELECT * FROM users;
```

(You can try similar queries at [keystonedb.sumitk.me](https://keystonedb.sumitk.me))

## Demo

Here's a screen shot.

<img width="100%" src="/keystondb/keystoneDB_Demo.png"/>

## Final Thoughts

This project became more than just a lab submission. It was a deep dive into:
- Writing compilers (parsers)
- Working with LSM-tree-based storage
- Understanding query execution

---

If you're curious about how databases work or want to build your own toy DB, feel free to check out the code here: [github.com/SumitKumar-17/keystoneDB](https://github.com/SumitKumar-17/keystoneDB)

Let me know if you build something cool with it or have any ideas :)
