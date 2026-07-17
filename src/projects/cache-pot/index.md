---
title: Cache-Pot
date: 2026-07-14
repo: SumitKumar-17/Cache-Pot
topics: ["Go", "AI Infra", "Redis", "Vector Search"]
lead: A Redis-compatible memory engine for AI agents — one server instead of Redis, a vector DB, a memory framework, and a pile of MCP glue code.
---

Building an AI agent that actually remembers things usually means stitching together four separate systems: Redis for a fast KV cache, a vector database for semantic recall, a Mem0/LangMem-style memory framework on top of that, and a stack of custom MCP glue code so your agents can actually reach any of it. Four services, four bills, and a constant risk of the cache and the vector store quietly disagreeing with each other.

**Cache-Pot** is my bet that these aren't actually four separate problems — they're one memory engine with different retrieval modes. It's a single, Redis-compatible server where agents cache, remember, retrieve, share, and reason over information, and since it speaks the real Redis protocol, adopting it starts with swapping a connection string, not rewriting your stack.

|  | Redis | + Vector DB | + Mem0/LangMem | + MCP adapters | **Cache-Pot** |
|---|---|---|---|---|---|
| Fast KV cache | ✅ | | | | ✅ |
| Semantic/prompt/tool-call caching | | | partial | | ✅ |
| Vector search | | ✅ | | | ✅ |
| MCP-native tool access | | | | ✅ | ✅ |
| Agent memory (semantic recall) | | | ✅ | | ✅ |
| Shared memory across agents/models | | | partial | | ✅ |
| Memory consolidation + knowledge graph | | | partial | | ✅ |
| Multi-tenant isolation + memory versioning | | | partial | | ✅ |
| Separate services to run & pay for | — | 2 | 3 | 4 | **1** |

## What's actually built (v0.7.0)

I'm being deliberately honest about status here rather than overselling it — the repo's `ROADMAP.md` tracks exactly what's real per version. As of v0.7.0, Cache-Pot is a genuinely working Redis-compatible cache (RESP2, core data structures, TTL, transactions, pub/sub), plus:

- **Semantic/prompt/tool caching** — `CACHE.SEMANTIC`, `CACHE.PROMPT`, `TOOL.CACHE`
- **A native vector store** — `VECTOR.UPSERT` / `SEARCH` / `DELETE`, no bolted-on Pinecone
- **Shared agent memory** — `MEMORY.*`, `AGENT.REMEMBER` / `RECALL`
- **A native MCP server** exposing that same memory to any connected agent
- **Observability and cost analytics** — `/metrics`, `/stats`, `/dashboard`, eviction via `--max-entries`
- **Real LLM-backed consolidation and a knowledge graph** — `SUMMARY.CREATE`, `GRAPH.EXTRACT` / `GRAPH.RELATED`
- **Enforced multi-tenancy and full memory version history** — `--workspace-credentials`, `MEMORY.HISTORY`

## Getting it running

```bash
docker compose -f deployments/compose/docker-compose.yml up --build
redis-cli -p 6380 PING
redis-cli -p 6380 SET hello world
redis-cli -p 6380 GET hello
```

Or build it directly:

```bash
go build -o bin/cachepotd ./cmd/cachepotd
./bin/cachepotd --port 6380
```

Because it's RESP2-compatible, it works with any existing Redis client — `go-redis`, `redis-py`, `ioredis` — for whatever subset of commands it currently implements.

Full docs (vision, command reference, architecture, and the honest state of "Redis-compatible") live in the repo's own VitePress site under `docs/`.
