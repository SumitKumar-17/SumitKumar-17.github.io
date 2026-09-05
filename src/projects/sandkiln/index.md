---
title: sandkiln
date: 2026-08-31
repo: SumitKumar-17/sandkiln
demo: https://sandkiln.vercel.app
topics: ["Rust", "Firecracker", "microVMs", "Infra"]
lead:
  A compute primitive for safely running untrusted or AI-generated code -
  hardware-isolated Firecracker microVMs, spun up and torn down through a plain
  API.
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

## Architecture

There's no hosted service - you run a `sandkilnd` daemon yourself, backed by a
Rust workspace split into `sandkiln-protocol` (the wire format shared by host
and guest), `sandkiln-guest-agent` (a static binary running inside each
microVM), `sandkiln-vmm` (drives Firecracker and networking), and
`sandkiln-daemon` (the HTTP API). Clients exist for JS/TS (published to npm),
Python, and a `kiln` CLI, all mirroring the same API.

## What's actually working

Core sandbox lifecycle, networking, auth, tags, file operations,
snapshot/resume/fork, named sandboxes, persistent-by-default stop, read-only
shared drives, auto-suspend on idle, and custom/managed base images are all
implemented and verified against real hardware, not just planned - the project
tracks what shipped in its changelog and what's still open (streamed log output,
OCI-image conversion, firewall/egress policy, multi-node) in a living roadmap
rather than a fixed spec.
