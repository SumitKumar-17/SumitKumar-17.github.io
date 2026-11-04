---
title: TimeFS
date: 2026-10-26
repo: SumitKumar-17/timefs
topics: ["Rust", "FUSE", "Filesystems", "Content-Addressed Storage"]
lead:
  A userspace filesystem with time travel built in - every change checkpoints
  into an immutable, content-addressed history you can branch, merge, and roll
  back, the way Git versions text but for anything mounted.
image: architecture.svg
---

Most filesystems only answer "what are the bytes in this file right now?".
History gets bolted on from outside - Git (opt-in, weak on large/binary files),
backup tools (periodic, coarse), ZFS/Btrfs snapshots (powerful, but block-device
level and root-only). **TimeFS** asks a different question: what if the
filesystem itself were built on the primitive Git, Nix, OCI image stores, and
restic all converged on independently - immutable, content-addressed data plus
tiny mutable pointers?

```sh
cargo build --release
timefs init
timefs mount ~/mnt &
echo hello > ~/mnt/a.txt
timefs snap -m "first"
timefs branch try-it
timefs merge main --resolve ours
```

## How it actually works

Every object - blob, file, tree, commit - is immutable and named by its BLAKE3
hash; only refs (`refs/heads/*`, `HEAD`) are mutable. A mount is a writable
in-memory overlay on top of a base commit, so day-to-day edits never touch the
on-disk history directly - only dirty paths get written out on checkpoint, and
objects are always written **before** any ref points at them, so a crash can
only ever leave harmless garbage, never a ref pointing at something that doesn't
exist. By default, objects and refs live in one append-only log (the pack
store), so a checkpoint's durability costs exactly one `fdatasync`.

Branching is just a new ref. Merging is a real three-way tree merge with
explicit conflicts, not a text-only diff - because the objects underneath are
trees and blobs, not lines of text, merge works the same whether the changed
file is a config, a binary, or a 50GB dataset.

## What it cost to measure

I didn't want to claim "fast" without numbers, so most of the engineering effort
went into `timefs-bench` and reproducible benchmarks with the commit hash and
machine spec attached to every result. On a 100,000-file tree, after editing one
file: a TimeFS snapshot took **2.7ms** and wrote 6 objects (18 KiB) with the
pack store, versus **150 to 244ms** for `git commit -a` on the same edit (it has
to stat every tracked file) and about **4 seconds** for `cp -r` (a full copy).
An `fsync` on a pack-store mount cost 2.0ms - identical to ext4 itself and to a
bare FUSE passthrough baseline, meaning the versioning layer itself adds close
to zero overhead on top of what FUSE already costs.

## Status

Milestones M0 through M7 are done: the core engine, pack and loose object
stores, a writable FUSE mount, checkpoints with crash recovery, branches, merge,
GC, and a benchmark/crash-injection/differential-stress-test suite - see the
[roadmap](https://github.com/SumitKumar-17/timefs/blob/main/docs/roadmap.md) for
what's shipped versus still open (hard links, extended attributes, compression,
and multi-node are explicitly not there yet). It's deliberately **not** trying
to be a Git replacement, a distributed filesystem, or a security boundary - it's
a single-node, single-writer research question about how cheaply a
general-purpose filesystem can support snapshots and branching, answered with
actual measurements instead of a pitch deck.
