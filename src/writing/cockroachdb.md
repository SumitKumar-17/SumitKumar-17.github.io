---
title: CockroachDB - Notes from a SIGMOD Deep Dive
date: 2026-09-03
topic: Technology
lead:
  Putting together my CS60113 presentation forced me to actually understand
  CockroachDB's architecture instead of just knowing its buzzwords.
---

I spent the last week going through CockroachDB's SIGMOD'20 paper
(["The Resilient Geo-Distributed SQL Database"](https://www.cockroachlabs.com/guides/sigmod-2020-cockroachdb-resilient-geo-distributed-sql-database/))
for a class presentation, alongside Peter Mattis's QCon talk on the same
architecture and a walkthrough by Nathan VanBenschoten. Writing the concept
explainer and slides for CS60113 was the actual forcing function - here's what
stuck.

**The pitch, in one line:** a database that keeps European user data in Europe
for GDPR, keeps Australian queries fast without crossing an ocean, and stays up
through a full datacenter failure - while still looking like an ordinary
Postgres-speaking SQL database to the application. A single-machine Postgres or
MySQL can't do any of that; it lives in one place, and if that place is
unreachable, so is your data.

**Underneath the SQL, it's one giant sorted key-value store.** CockroachDB
splits its entire logical key space into ~64 MiB chunks called Ranges - think of
the whole database as one alphabetically sorted phone book, and a Range as one
physical volume of it ("Aaronson" to "Dawson"). Ranges split when they get too
big and merge when they shrink, which is the actual mechanism behind horizontal
scaling: just keep slicing volumes and spreading them across more machines.

**Each Range is its own independent Raft group.** Not the whole cluster - each
64 MiB chunk runs its own consensus protocol, replicated by default to 3 nodes,
tolerating one failure while a majority (2 of 3) stays reachable. One replica
per Range is the **leaseholder**: the only one allowed to serve authoritative
reads or propose writes, specifically so reads don't need a network round trip
through the whole Raft group every time. Replica placement itself is driven by a
few heuristics - spreading copies across failure domains (disk, rack,
datacenter, region), balancing load so hot Ranges don't pile onto one node, and
a "follow-the-workload" mechanism that automatically drags leaseholders closer
to wherever they're actually being queried from.

**Ordering data instead of hashing it turns out to matter a lot.** CockroachDB
deliberately avoids consistent hashing for placement - keys stay
lexicographically ordered, which is what makes range scans
(`WHERE id BETWEEN ...`) efficient, and it's also exactly the property SQL needs
when mapping table rows and secondary indexes onto key-value pairs: each row
becomes one KV pair, keyed so its encoding preserves the same ordering as the
original column type.

**The clock problem is the part I found most interesting.** A geo-distributed
database needs to order transactions across machines whose clocks are never
perfectly synchronized. Google's Spanner solves this with TrueTime - atomic
clocks and GPS receivers in every datacenter. CockroachDB's bet is that you
don't need that: it uses a **Hybrid-Logical Clock** (physical time plus a
Lamport counter, nudged forward on every message so causally related events
always get increasing timestamps) plus an explicit **uncertainty interval**
around each transaction's timestamp. If a transaction reads a value that might
have been written before or after it in real time, it doesn't guess - it pushes
its own timestamp past the uncertain value and re-evaluates, rather than
requiring a hardware-guaranteed bound on clock skew.

**Transactions are optimistic, not lock-based.** Writes are staged as
provisional "intents" tagged with a pointer to a transaction record (`pending` /
`staging` / `committed` / `aborted`), and conflicts are resolved by pushing
timestamps forward instead of blocking outright - a **read refresh** lets a
transaction continue at a new timestamp without a full restart if none of its
already-read keys actually changed. Two optimizations compound on top of that:
**write pipelining** sends non-overlapping writes for replication without
waiting on earlier ones, and **parallel commits** collapses the normal two
sequential consensus rounds (replicate the writes, then replicate the
"committed" marker) into one by introducing a `staging` status. The paper's own
benchmark shows this holding throughput roughly flat and latency close to
constant as the number of secondary indexes (and therefore Ranges touched per
transaction) grows - classic two-phase commit degrades noticeably on the same
test.

**None of the distributed machinery is visible from SQL.** The SQL layer parses,
optimizes, and executes queries with zero awareness of how data is
range-partitioned underneath, and the wire protocol is exactly Postgres's, so
existing drivers and ORMs just work. The optimizer is cost-based and, unlike
most single-node databases, its cost model factors in _locality_ - given a
reference table replicated in three regions, it picks whichever region's copy
avoids a wide-area network hop, the same way it'd otherwise pick between two
indexes based on estimated row counts.

For anyone chasing the primary sources, here's everything I actually worked from
for CS60113:

- [The SIGMOD'20 paper](https://www.cockroachlabs.com/guides/sigmod-2020-cockroachdb-resilient-geo-distributed-sql-database/) -
  Taft, Sharif, Matei, VanBenschoten, et al., the real foundation for all of
  this.
- [Peter Mattis's QCon slides](/assets/pdf/cockroachdb/qcon_architecture_of_a_geo-distributed_sql_database.pdf) -
  walks the Ranges/replication/transactions layers slide by slide.
- [My concept explainer](/assets/pdf/cockroachdb/CockroachDB_Concept_Explainer.pdf) -
  the write-up I did while working through the paper, with the HLC and
  parallel-commits sections in more depth than I could fit here.
- [My CS60113 presentation slides](/assets/pdf/cockroachdb/CockroachDB_Presentation.pdf)
  and the
  [speaker script](/assets/pdf/cockroachdb/CockroachDB_Speaker_Script.txt) that
  goes with them.

And the [Raft post](/writing/raft) right before this one covers the consensus
layer everything here is quietly standing on.
