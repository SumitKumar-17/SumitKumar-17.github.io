---
title: sandkiln
date: 2026-10-20
repo: SumitKumar-17/sandkiln
demo: https://sandkiln.vercel.app
topics: ["Rust", "Firecracker", "microVMs", "Infra"]
lead:
  A compute primitive for safely running untrusted or AI-generated code -
  hardware-isolated Firecracker microVMs, spun up and torn down through a plain
  API.
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
[project site](https://sandkiln.vercel.app) has the architecture writeup, the
roadmap, and every benchmark number below, with the commit hash they were
measured against.

## Why a microVM and not a container

A container shares the host's kernel - the isolation boundary is namespaces and
cgroups, so a compromised container can still mean a compromised kernel. A
sandkiln sandbox gets its own kernel, its own filesystem on a dedicated
`virtio-blk` device, and its own network namespace, with KVM as the hardware
boundary instead of the syscall table. That trade only makes sense if it's not
also slow: measured on real Firecracker on a single dev box, cold boot (process
spawn to the VM acknowledging `InstanceStart`) runs **10.5-10.9ms**, and
resuming from a snapshot runs **6.5-7.7ms** - both after tracking down and
fixing a 20ms fixed-sleep poll that was dominating the earlier numbers. Those
figures are directional, not authoritative - one machine, one point in time -
which is also exactly how the project's own performance page presents them.

## Architecture

There's no hosted service - you run a `sandkilnd` daemon yourself, backed by a
Rust workspace split into `sandkiln-protocol` (the wire format shared by host
and guest), `sandkiln-guest-agent` (a static binary running inside each
microVM), `sandkiln-vmm` (drives Firecracker and networking), `sandkiln-store`
(durable sandbox-lifecycle history in SQLite), and `sandkiln-daemon` (the HTTP
API). Clients exist for JS/TS ([npm](https://www.npmjs.com/package/sandkiln)),
Python ([PyPI](https://pypi.org/project/sandkiln/)), and a `kiln` CLI, all
mirroring the same API.

## What's actually working

Core sandbox lifecycle, networking, auth, tags, file operations,
snapshot/resume/fork, named sandboxes, persistent-by-default stop, read-only
shared drives, auto-suspend on idle, custom/managed base images, and per-sandbox
I/O rate limiting are all implemented and verified against real hardware, not
just planned - the project tracks what shipped in its
[changelog](https://github.com/SumitKumar-17/sandkiln/blob/main/CHANGELOG.md)
and what's still open (OCI-image conversion, multi-node, snapshot encryption at
rest) in a living
[roadmap](https://github.com/SumitKumar-17/sandkiln/blob/main/ROADMAP.md) rather
than a fixed spec.
