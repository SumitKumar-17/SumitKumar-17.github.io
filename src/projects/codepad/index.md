---
title: Codepad
date: 2026-01-13
repo: SumitKumar-17/codepad
topics: ["Rust", "WebAssembly", "Collaborative Editing"]
lead:
  A minimal, self-hosted collaborative code editor built on operational
  transformation — no database required.
image: codepad.png
image_border: true
---

Real-time collaborative editing is usually associated with either a SaaS product
or a genuinely heavy CRDT implementation. **Codepad** takes a lighter path: it's
built on **operational transformation** (OT), the same class of algorithm behind
early Google Docs, and it's designed to be small enough to self-host without
provisioning a database at all.

The architecture splits cleanly across three layers. The server is Rust, using
the [`warp`](https://github.com/seanmonstar/warp) web framework and the
[`operational-transform`](https://github.com/spebern/operational-transform-rs)
crate for the actual OT logic, storing documents as in-memory data structures
rather than rows in a database — that's what keeps the whole thing fast and
keeps testing simple, at the cost of documents being transient by default
(garbage-collected after 24 hours of inactivity, or lost on a server restart,
unless persistence is turned on). The OT transformation logic itself is compiled
to **WebAssembly** via `wasm-bindgen` so the exact same conflict-resolution code
runs client-side in the browser as runs on the server. The frontend is
TypeScript and React, with [Monaco](https://github.com/microsoft/monaco-editor)
— the actual editor component from VS Code — as the text editing surface,
talking to the server over a plain WebSocket connection.

Configuration is entirely environment-variable driven: `EXPIRY_DAYS` controls
garbage collection, `SQLITE_URI` optionally turns on snapshot persistence to a
local SQLite file (so documents survive restarts if you want that), and
`PORT`/`RUST_LOG` cover the basics. The whole thing ships as a **6 MB Docker
image** with multi-platform support for `linux/amd64` and `linux/arm64`,
published to Docker Hub — `docker pull sumitkumar17/codepad` and you have a
fully self-hosted collaborative editor with zero external dependencies.
