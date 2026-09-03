---
title: Raft, or How a Cluster Agrees on One Truth
date: 2026-09-01
topic: Technology
lead:
  Notes on the Raft consensus algorithm - what it's actually solving, and why
  "just have a leader" turns out to be the easy 10% of the problem.
---

Start with the dumbest possible way to store some piece of data: one file, on
one server. Works great until that server (or its whole datacenter) goes down,
and now the data is just gone. The obvious fix - run several copies on several
machines - immediately creates a worse problem: what happens when server A says
the value is 12, server B says 23, and server C says 10? You need every node to
agree on one state, and getting a set of unreliable machines to agree on
anything is exactly the problem Raft exists to solve.

**The log is the whole idea.** Every node keeps an ordered log of operations,
not the data itself. If two nodes have the same log, replayed in the same order,
they end up in the same state - so "keep the data consistent" reduces to "keep
the log consistent." Everything else in Raft is machinery built to protect that
one property.

**Leader election** is how the cluster decides who's allowed to add to the log.
One node is the leader and sends heartbeats to the others; if a follower stops
hearing from it within a timeout, it becomes a candidate and requests votes. The
timeout is deliberately randomized per node - if every follower noticed the
leader's death at the same instant, they'd all become candidates simultaneously
and split the vote forever. A follower also refuses to vote for a candidate
whose log is shorter (i.e., staler) than its own, which is what stops a node
with old data from ever becoming leader.

**Committing an entry is a two-phase handshake**, not a single broadcast. The
leader appends a new entry to its own log and ships it to followers, who append
it too - but "appended" isn't "committed." Only once a _majority_ of nodes
confirm they've appended it does the leader mark it committed and tell everyone
to do the same. This is what protects against the case where the leader reaches
exactly one follower before the rest of the cluster drops off: that lone
follower's copy is provisional until a real majority has it.

**Partitions and rejoining nodes** are handled by walking backward. If a
follower comes back after being offline and the leader tries to hand it entry
#6, but it only has up to #3, appending #6 directly would leave a gap. So the
leader sends the previous entry's index/term alongside each new one; if the
follower doesn't recognize that previous entry, it rejects the append, and the
leader retries one entry earlier. This repeats until they land on an entry both
sides agree on, then replication catches up from there.

The part I found genuinely elegant is that this generalizes past "database log":
Raft doesn't care what the log entries _mean_ - swap the log-replaying step for
any finite state machine, and every node ends up in the same state given the
same sequence of inputs. That's the actual abstraction, and it's why the same
algorithm backs everything from key-value stores to config managers to sharded
SQL databases like CockroachDB and YugabyteDB, each just running many
independent Raft groups side by side.

Sources: Diego Ongaro and John Ousterhout's original paper,
["In Search of an Understandable Consensus Algorithm"](/assets/pdf/raft/raft.pdf)
(also mirrored at [raft.github.io](https://raft.github.io/raft.pdf)), and the
interactive visualization at
[thesecretlivesofdata.com/raft](https://thesecretlivesofdata.com/raft/), which
is worth clicking through even after reading the paper.
