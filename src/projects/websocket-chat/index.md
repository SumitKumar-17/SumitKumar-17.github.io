---
title: WebSocket Chat Server
date: 2026-02-23
repo: SumitKumar-17/websocket-chat
topics: ["C++", "Networking", "WebSockets"]
lead:
  A WebSocket chat server written from scratch in C++ — raw POSIX sockets, no
  libraries, hand-rolled framing.
---

No `libwebsockets`, no Boost.Asio, no framework doing the protocol work for you
— just `poll()`, raw POSIX sockets, and the RFC 6455 spec. I wanted to actually
understand what a WebSocket connection _is_ underneath the abstraction, so I
wrote the handshake and frame parser by hand in C++.

The HTTP side (`http.hpp`/`http.cpp`) handles the initial upgrade request just
enough to extract the `Sec-WebSocket-Key` header. From there, `ws.hpp`/`ws.cpp`
takes over: `websocket_accept()` computes the required `Sec-WebSocket-Accept`
response key (base64-encoded SHA-1 of the client key plus the magic GUID from
the spec), `try_parse_frame()` parses the binary frame format directly off the
socket buffer — FIN bit, opcode, payload — and `make_text_frame()` builds
outgoing frames the same way, no serialization library involved.

The server itself (`chat_server.cpp`) runs a single-threaded `poll()` event loop
over all connected sockets rather than spawning a thread per client, which keeps
it simple and avoids most classic concurrency bugs by construction. A handful of
small, deliberate design choices round it out:

- A **token-bucket rate limiter** per connection (8-token burst, refilling at
  4/sec) so one chatty client can't flood everyone else
- **Message history** — the last 50 messages are kept and replayed to newly
  connected clients, persisted to a local `data/` directory so history survives
  a restart
- A minimal **static file server** for the bundled `public/` web client (plain
  HTML/CSS/JS) so you can open a browser tab and actually chat, no separate
  frontend build step required

There's also a Python test client (`test_client.py`) for scripted
connection/load testing without needing a browser at all. The whole thing builds
with a plain `Makefile` — no build system beyond what a C++ compiler already
gives you.
