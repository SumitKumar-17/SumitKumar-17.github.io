---
title: sandkiln
date: 2026-11-25
repo: SumitKumar-17/sandkiln
demo: https://sandkiln.vercel.app
topics: ["Rust", "Firecracker", "microVMs", "Infra"]
lead:
  Sandboxes for agents - run untrusted or AI-generated code in hardware-isolated
  Firecracker microVMs, on your own hardware, with a warm pool fast enough to
  answer the first command in milliseconds.
image: isolation-model.svg
---

**sandkiln** boots [Firecracker](https://firecracker-microvm.github.io/)
microVMs on demand and gives you a programmatic API to run commands and
read/write files inside them, then tears the VM down when you're done. Each
sandbox is a real microVM - its own kernel, its own filesystem, its own network
namespace - isolated at the hardware level from every other sandbox on the same
host, rather than relying on container namespacing alone. It's built for the
same class of problem as AI agent sandboxes, code playgrounds, and
untrusted-code execution services: isolate first, then run.

```ts
import { Sandbox } from "sandkiln";

const sandbox = await Sandbox.create({ tags: { env: "ci" } });
const result = await sandbox.runCommand("python3", ["analyze.py"]);
console.log(result.stdout, result.exitCode);
await sandbox.stop();
```

Full docs (getting started, guides, API/SDK/CLI reference) are at
[sandkiln.mintlify.site](https://sandkiln.mintlify.site/); the
[project site](https://sandkiln.vercel.app) has the architecture writeup, case
studies of real bugs and fixes, and every benchmark number below, with the run
file and machine it was measured on.

## Why a microVM and not a container

A container shares the host's kernel - the isolation boundary is namespaces and
cgroups, so a compromised container can still mean a compromised kernel. A
sandkiln sandbox gets its own kernel, its own filesystem on a dedicated
`virtio-blk` device, and its own network namespace, with KVM as the hardware
boundary instead of the syscall table. That trade only makes sense if it's not
also slow: from the warm pool, create-to-first-command is **25.9ms** median;
cold (pool disabled, a fresh microVM every time) it's **234ms**; resuming a
suspended sandbox from a snapshot is **13.1ms**, forking one is **8.77ms**, and
running a command in an already-live sandbox is **1.76ms**. All measured on one
dev box against real Firecracker, with the raw run files checked into the repo -
directional, not authoritative, which is exactly how the project's own numbers
page frames them.

## Two recent engineering problems

**Snapshots used to cost the whole guest's memory.** Taking a snapshot wrote the
entire memory file whether the guest had touched 10 pages or 10,000, which meant
a create-plus-snapshot round trip had a 1781ms median and a 3380ms p95. Turning
on Firecracker's dirty-page tracking and asking for a diff snapshot - sparse,
only the pages a cold-booted guest actually touched - dropped that to a
**546ms** median and **775ms** p95, for a guest whose `mem.bin` now allocates 92
MiB instead of the full 512 MiB it's configured with. The cost of tracking dirty
pages on every sandbox, even ones that never get snapshotted, turned out to be
noise: 228ms vs. 229ms median create time, on or off.

**The daemon used to need root to jail anything.** Firecracker's jailer needs a
chroot, a cgroup, and dropped privileges, which is awkward for a daemon you'd
rather not run as root. The fix was a small static-musl supervisor binary that
opens the jail, execs Firecracker inside it, and is watched by a pipe the daemon
closes if it crashes - so a jailed sandbox can be created, used, and stopped by
an unprivileged daemon, and killing the daemon can't leave an orphaned VM
holding the jail open.

## Architecture

There's no hosted service - you run a `sandkilnd` daemon yourself, backed by a
Rust workspace split into `sandkiln-protocol` (the wire format shared by host
and guest), `sandkiln-guest-agent` (a static binary running inside each
microVM), `sandkiln-vmm` (drives Firecracker, the jailer, and networking),
`sandkiln-store` (durable sandbox-lifecycle history in SQLite), and
`sandkiln-daemon` (the HTTP API). Clients exist for JS/TS
([npm](https://www.npmjs.com/package/sandkiln)), Python
([PyPI](https://pypi.org/project/sandkiln/)), a `kiln` CLI, an MCP server, and a
GitHub Action, all mirroring the same API.

## What's actually working

Core sandbox lifecycle, networking, auth, tags, file operations,
snapshot/resume/fork, named sandboxes, persistent-by-default stop, read-only
shared drives, auto-suspend on idle, custom/managed base images, per-sandbox I/O
rate limiting, an unprivileged jailed daemon, and dirty-page-tracked diff
snapshots are all implemented and verified against real hardware, not just
planned - the project tracks what shipped in its
[changelog](https://github.com/SumitKumar-17/sandkiln/blob/main/CHANGELOG.md)
and what's still open (OCI-image conversion, multi-node, snapshot encryption at
rest) in a living
[roadmap](https://github.com/SumitKumar-17/sandkiln/blob/main/ROADMAP.md) rather
than a fixed spec.
