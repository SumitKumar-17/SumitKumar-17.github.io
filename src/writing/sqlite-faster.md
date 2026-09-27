---
title: "SQLite, fsync, and the Path from 300 TPS to a Million"
date: 2026-09-27
topic: "Technology"
lead: >-
  A 3 ms SQLite commit is not slow SQL so much as a durability wait. Once you
  see where the fsyncs are hiding, WAL mode, synchronous settings, and batching
  become different ways to spend the same I/O budget.
---

Say you are moving money between two rows in an **accounts** table. One
transaction debits one account, credits another, and refuses to let the balance
go below zero. With SQLite’s default settings in the source benchmark, that
ordinary loop landed at 338 transactions per second, which is just under 3 ms
per transaction: 1,000 ms divided by 338. Three milliseconds is not much to a
human, but it is a long time for a CPU, so the interesting question is what the
database is waiting on.

![SQLite rollback-journal commits protect the main database by syncing backup pages before overwriting data, while WAL commits append changes first and checkpoint them back later.](/assets/images/writing/sqlite-commit-paths.png)

The wait is mostly durability. When SQLite calls **write**, the operating system
can accept the bytes into its own page cache and return before the storage
device has actually made them persistent. If power disappears at that point, the
application saw success but the data may be gone. **fsync** is the stronger
request: do not return until the earlier writes are on durable storage. That is
the D in ACID, and it is deliberately expensive.

A **dd** test in the source forced a sync after each block on a local SSD and
measured roughly 0.6 ms per block. That still does not explain a 3 ms SQLite
transaction by itself. The missing piece is that a safe commit is not
necessarily one synced write.

SQLite stores the database in fixed-size pages, and a single transaction can
dirty several pages scattered across the file. If SQLite wrote those modified
pages directly into the main database and the machine died halfway through, the
file could contain a mix of old and new state. The default rollback-journal path
avoids that by first copying the original, unmodified pages into a separate
journal file. If the commit fails midway, SQLite can copy those old pages back
and restore the pre-transaction database.

That safety has a concrete I/O cost. In the rollback-journal commit path
described in the source, SQLite needs to sync the journal contents, sync the
modified main database pages, sync the directory entry that makes the journal
file durable, and perform a **separate journal-header sync**. That is four
**fsync** calls for one committed transaction, which lines up with the roughly
**3 ms latency** and the low hundreds of transactions per second. The exact file
choreography is SQLite-specific; the broader rule is not. If a database promises
that a commit survives power loss, some durable-storage acknowledgement sits on
the critical path.

**WAL changes which file gets the first write.** Instead of backing up old pages
and then overwriting the main database, SQLite can append new changes to a
write-ahead log file. Readers combine the main database file with the WAL: if a
newer version of a page exists in the WAL, SQLite uses it; otherwise it reads
the page from the main file. The main database catches up later during a
checkpoint, when WAL frames are copied back into the database file.

```sql
PRAGMA journal_mode = WAL;
PRAGMA wal_autocheckpoint = 10000; -- example page threshold
```

These are SQLite **PRAGMA** commands, not standard SQL. **journal_mode = WAL**
switches the database from rollback-journal mode to SQLite’s WAL mode.
**wal_autocheckpoint** controls how large the WAL may grow, in pages, before
SQLite automatically checkpoints it; SQLite’s default threshold is 1,000 pages,
and the **10000** above is just an example of raising that threshold for a
**write-heavy benchmark**. A checkpoint still has to sync data, but it does not
run on every transaction, so it usually hurts per-transaction throughput much
less than syncing every rollback-journal step.

With WAL mode and a high checkpoint threshold, the benchmark rose to about 1,100
transactions per second. That is a substantial improvement, but it is not magic:
in **FULL** synchronous mode, each committed transaction still waits for one
**fsync** on the WAL. Cutting four syncs down to one gives roughly a 3x gain in
this setup, not the 10x or 20x sometimes attributed to WAL alone.

**The hidden multiplier is **synchronous**.** SQLite exposes the durability
trade-off directly:

```sql
PRAGMA synchronous = FULL;
PRAGMA synchronous = NORMAL;
PRAGMA synchronous = OFF;
```

**FULL** is the conservative setting: commits wait for the relevant sync, so a
confirmed transaction is meant to survive a power failure under the
local-storage assumptions of the benchmark. **OFF** goes the other direction.
SQLite hands data to the operating system with **write** and lets the OS flush
whenever it chooses; the source benchmark reached about 1**00,000 transactions
per second**, but this sacrifices **durability** and can leave the database
corrupt after a crash or power loss. It is fast because it stops making the
expensive promise.

**NORMAL** is the useful middle ground in WAL mode. SQLite does not sync the WAL
on every commit, but it does enforce syncing around checkpoints when WAL
contents are copied into the main database. The database should remain
structurally consistent, but a sudden power loss can lose recent transactions
that had been reported as committed but were not yet synced. In the benchmark,
WAL plus **NORMAL** reached about 12,000 transactions per second. That is why
benchmark stories can disagree: if a wrapper changes **synchronous** to
**NORMAL** when enabling WAL — better-sqlite3 is cited in the source as an
example — the result is no longer measuring WAL alone.

If you are building a cache, a local queue, or a product feature that can
tolerate losing a few recent writes, **NORMAL** may be a reasonable engineering
choice. If you are building a financial ledger, it probably is not. At that
point you cannot skip the sync; you can only amortize it.

![Group commit collects concurrent requests into an in-memory queue, closes the batch by size or timeout, and pays one durable commit for many logical transfers.](/assets/images/writing/sqlite-group-commit.png)

**Group commit amortizes the bridge toll.** Instead of committing each request
as its own transaction, the application can collect incoming requests in memory
and flush them as one database transaction. The batch closes when it reaches a
maximum size or when a short timer, such as 5 ms, expires. The individual
transfers still execute, but the durable commit boundary is shared.

```sql
BEGIN;
-- execute each queued money transfer here
COMMIT;
```

**BEGIN** starts one SQLite transaction, and **COMMIT** is the point where the
database must make the transaction durable according to the active journal and
synchronous settings. This SQL shape is portable in spirit, but the locking
behavior, WAL implementation, and durability knobs are database-specific. In
SQLite WAL mode with **synchronous = FULL**, batching means many logical
transfers can share one WAL commit and one sync.

The first batching test in the source used a batch size of 10, a 5 ms batching
window, and 20 concurrent in-flight requests. Throughput rose to about 5,500
transactions per second. That result depends on having enough work waiting: the
benchmark intentionally kept in-flight requests at twice the batch size so
batches filled immediately. In a real service, the timer matters. Too long a
window adds latency when traffic is low; too short a window sends half-empty
batches and gives back throughput.

Batching also changes failure semantics at the application boundary. The
database sees one transaction, so the batch commits or rolls back as a unit. The
application still has to map results back to individual requests, handle
constraint failures cleanly, and decide how much queueing latency users are
allowed to pay. The performance trick is simple; making it fit a product
contract is usually the harder part.

Increasing the batch size eventually pushed the benchmark to one million
transactions per second, at a batch size of about 28,000. The scaling was not
linear, and it could not be. At that point the system was only committing about
35 batches per second. With a **0.6 ms sync, that is roughly 21 ms of I/O wait**
per second, leaving the rest of the second for CPU work.

That is where **Amdahl’s Law** shows up. Once disk sync stops dominating, the
CPU becomes the bottleneck. On the 5.4 GHz processor in the source benchmark,
the remaining 979 ms works out to roughly 5.3 billion cycles per second of
useful CPU time, or about 5,300 cycles per logical transaction at one million
transactions per second. In those cycles, SQLite still has to find pages, walk
in-memory B-trees, update balances, and execute the statements. The bridge
stopped being the bottleneck; loading and unloading the bus became the
bottleneck.

The important caveat is that the benchmark measured raw database writes. A real
application also parses HTTP requests, validates input, serializes and
deserializes JSON, runs business logic, logs, and coordinates with other
services. All of that consumes the same CPU budget that the benchmark spent
almost entirely inside SQLite. Keeping throughput high usually means using
multiple cores for the surrounding work and feeding a single writer efficiently,
rather than pretending one core can handle the whole application path at
benchmark speed.

SQLite’s exact switches are its own: **PRAGMA journal_mode**, **PRAGMA
synchronous**, and **PRAGMA wal_autocheckpoint** are not standard SQL, and
PostgreSQL, MySQL, and other engines expose different names and different
internals. Some engines add MVCC for **multiple writers, background
checkpointers, connection pools**, replication, or quorum commits. Network
storage and **cross-AZ replication** can turn one local **fsync** into a very
different durability wait. The physics stays recognizable anyway: durable
commits wait for durable media unless you weaken the promise, WAL reduces the
amount of synchronous work, and group commit spreads the remaining wait across
more transactions.

Based on the supplied transcript for
https://www.youtube.com/watch?v=vOEL_pHFYK0.
