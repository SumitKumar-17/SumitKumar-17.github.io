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

That's the whole pitch I gave myself before starting this. It was supposed to be a Database Management Laboratory final assignment. When I looked at the list of recommended full-stack project ideas, I was bored out of my mind - a to-do app, an e-commerce clone, the usual. So instead of picking one of those or copying a senior's project, I decided to build a database from scratch, because I'd heard terms like "query plan," "WAL," "compaction," and "indexing" a hundred times and none of them meant anything real to me yet.

[KeystoneDB](https://keystonedb.sumitk.me) is what came out of that.

**What it actually is:** a custom-built relational database engine with its own mini-SQL parser and a query executor that talks to a key-value store (RocksDB) underneath. It has a hand-written lexer and parser built with Flex and Bison, supports a genuinely usable SQL-like query language, compiles queries down into operations that run against RocksDB, and stores data in a log-structured way, roughly LSM-tree style. Think of it as writing a compiler for a SQL subset and bolting a tiny execution engine and storage layer onto the back of it.

Stack: **C++** for the core engine, **RocksDB** for persistent key-value storage, **Flex/Bison** for the parser, and **Google Test** for 70+ unit tests covering parsing accuracy, transaction consistency, and safe concurrent execution.

It wasn't always smooth. I broke things constantly. RocksDB has a real learning curve, and writing your own SQL parser is deceptively tricky - especially once you start dealing with whitespace and multi-line queries. But it's a much better way to learn than treating Postgres or SQLite as a black box.

## It actually handles the annoying cases

This isn't a toy that only parses `SELECT * FROM t`. It handles multi-table joins, ambiguous column resolution, `NULL` semantics, constraint violations, and the kind of malformed input that breaks most weekend-project parsers:

```sql
create table t1 (x int, y char(20));
insert into t1 values (42,'hello');
insert into t1 values (42, NULL);
insert into t1 values (99,'hello'), (100,'world');

-- Char too long - rejected
insert into t1 (x,y) values (101, 'looooooooooooooooooooooooooooooooooog');
-- Data type mismatch - rejected
insert into t1 (x,y) values ('100', 'mismatch');
-- Unknown column name - rejected
insert into t1 (not_exist_name) values (1, 'not exist name');

-- no ambiguity
select t2.x, t3.x from t2, t3;
-- ambiguous column name x - caught and rejected
select x, y from t2, t3;

update t2 set x = x*10 where x = 3;
delete from t2 where x = x/x;

-- NOT NULL constraint enforced
create table t5 (id int not null);
insert into t5 values (NULL);  -- rejected: id can not be null

-- BETWEEN expressions
select * from t6 where id between 2 and 4;
```

Getting all of that to fail (or succeed) in exactly the right way - not just the happy path - was most of the actual work.

## Final thoughts

This turned into a lot more than a lab submission. It was a deep dive into writing compilers, working with LSM-tree-based storage, and actually understanding query execution instead of just invoking it. If you're curious how databases work under the hood or want to build your own toy one, the [code is on GitHub](https://github.com/SumitKumar-17/keystoneDB) - let me know if you build something cool with it.
