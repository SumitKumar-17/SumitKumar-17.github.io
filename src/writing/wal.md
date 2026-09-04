---
title: Why Your Database Has a Write-Ahead Log
date: 2026-09-05
topic: Technology
lead:
  A single row update can mean rewriting a dozen index pages - the write-ahead
  log is the trick that keeps that fast anyway.
---

Say you're updating one row in a table with a couple of indexes on it. That
single `UPDATE` doesn't touch one B+ tree - it touches every index that covers a
changed column, each of which might mean a random write to a completely
different part of the disk. Do all of that before telling the client "saved,"
and every write in your app is now paying for a handful of scattered disk I/Os
in serial. That's the problem the write-ahead log (WAL) exists to solve, and the
mechanism behind it is one of those things that's obvious in hindsight once
you've seen it laid out.

![How a write-ahead log defers B+ tree updates: dirty pages stay in the in-memory buffer while a single sequential WAL entry is committed to disk, and the tree pages are only flushed later on eviction or checkpoint](/assets/images/writing/wal.png)

**The trick is deferral, not avoidance.** When a write comes in, the database
still walks the B+ tree, still loads the relevant leaf pages into its in-memory
buffer, and still applies the change there - but it marks those pages **dirty**
instead of flushing them to disk immediately. If the update touches ten indexes,
that's ten dirty pages sitting in memory, none of them written back yet.

**What actually hits disk is one compact log entry.** Instead of the full set of
page writes, the database appends a single record to a sequential file: a
sequence number, which table and row, and just the delta - old value, new value,
not a full copy of the row. That one sequential write is the only I/O the client
waits on before getting back "committed." Ten logical page updates collapse into
one physical write.

**Sequential writes being fast is a hard-drive-era optimization, but it still
pays off.** On spinning disks, sequential I/O was routinely an order of
magnitude (or more) faster than random I/O, which is most of why WALs exist in
the first place. SSDs erase a lot of that gap, but you still come out ahead
simply because you did one write instead of several.

**The dirty pages get written back eventually, not never.** Typically that
happens when a page is evicted from the buffer cache to make room for something
else - if the evicted page is dirty, it has to be flushed to disk first; if it's
clean, it just gets dropped. Checkpointing does the same thing proactively on a
schedule, rather than waiting for cache pressure to force it.

**The log itself can't grow forever**, so it's bounded and reused like a ring
buffer. Once a checkpoint confirms a given change is durably reflected in the
actual table/index pages on disk, that segment of the log is dead weight - it
gets reclaimed for new entries.

**And that log is the whole reason crash recovery works.** During normal
operation, all of this is invisible - dirty pages just live in memory until
they're flushed. But if the server crashes with dirty pages still un-flushed,
those changes only exist in the WAL, not in the tree itself. On restart, the
database replays the log forward from the last checkpoint to rebuild exactly the
state it had already told clients was committed. Without that, "committed" would
just mean "in memory, probably," which is a promise you can't actually keep.

Source: [this video walkthrough](https://www.youtube.com/watch?v=s3hKYMOpp3E),
which is where the B+ tree diagram framing above comes from.
