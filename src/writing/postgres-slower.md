---
title: "Deconstructing a Masterclass: Postgres 42,000x Slower"
date: 2025-08-04
topic: Technology
lead:
  A breakdown of a brilliant and hilarious article on negative performance
  tuning in PostgreSQL.
---

I just came across an absolutely brilliant and hilarious blog post by Jacob
Jackson titled
["Making Postgres 42,000x slower because I am unemployed"](https://byteofdev.com/posts/making-postgres-slow/).

It's a refreshing take on performance tuning. Instead of the usual struggle for
marginal gains, the author embarks on a mission to completely destroy a
database's performance using only its configuration file. The beauty of it is
how much it teaches you about Postgres internals by showing exactly how to break
them - a masterclass in reverse-engineering performance. I was drawn to it given
my own interest in databases.

**The major tweaks used to kill performance:**

- **Destroying the cache** - gutting `shared_buffers` to its minimum, forcing
  nearly every query to read from disk instead of memory.
- **Weaponizing background work** - reconfiguring `autovacuum` to run constantly
  and aggressively, creating perpetual busywork.
- **Making writes inefficient** - manipulating the write-ahead log so every
  write forces frequent, expensive flush-to-disk checkpoints.
- **Tricking the query planner** - setting `random_page_cost` absurdly high so
  Postgres believes a full table scan is always faster than an index lookup,
  without even deleting the indexes.
- **Creating an I/O bottleneck** - forcing all disk I/O through a single,
  overwhelmed worker thread.

The final result: a staggering 42,000x slowdown. It's one of the best articles
I've read on database internals precisely because it approaches the problem from
such a destructive angle - you learn more about making Postgres fast by reading
exactly how to make it slow. Strongly recommend it.
