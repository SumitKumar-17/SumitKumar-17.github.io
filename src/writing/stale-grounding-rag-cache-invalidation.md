---
title: Stale Grounding: The Cache-Invalidation Problem in RAG
date: 2026-09-26
topic: AI
lead:
  Your vector index is a cache, and nobody invalidated it.
---

![Rows of server racks lit in blue, representing a data center hosting a vector index](https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?w=1600&q=80&auto=format&fit=crop)
_Photo by [Kevin Ache](https://unsplash.com/@kevinache) on
[Unsplash](https://unsplash.com/photos/a-rack-of-servers-in-a-server-room-2JJ3wBHu4_0)_

A support agent pinged me on a Tuesday afternoon with a screenshot of our
internal docs bot telling a customer they had 30 days to request a refund.
Finance had changed the policy to 14 days three weeks earlier. The change was
live everywhere that mattered: the public help center, the terms page, the
billing team's own dashboard. Everywhere except the one place our support bot
actually read from.

The screenshot was almost impressive in how confident it was:

> **Customer:** how many days do I have to request a refund after purchase?
> **Bot:** You have **30 days** from your purchase date to request a full
> refund. Just reach out to support with your order number and we'll take care
> of it right away!

Cheerful, correctly formatted, grounded in a real chunk of what used to be our
refund policy doc, and wrong. Not hallucinated-wrong — retrieved-wrong. The
model didn't make anything up. It faithfully reported a fact that had stopped
being true twenty-one days earlier.

Nobody had touched the retrieval pipeline. Nobody had touched the embeddings.
That was the problem. The pipeline was working exactly as designed, and "as
designed" meant it had no idea the world had changed underneath it.

_(I've swapped the company, the product, and the exact numbers in this post; the
mechanism and the mistake are both real, and I've watched some version of this
happen at more than one place, which is really the point.)_

## The reframe that actually matters

Every RAG writeup I'd read up to that point was about chunking strategy,
embedding model choice, rerankers, hybrid search. All useful. None of it would
have caught this bug, because the bug wasn't in retrieval quality. It was in
retrieval _currency_.

Here's the mental model that finally made it click for me: a vector index is not
a second copy of your knowledge base. It's a cache. Specifically, it's a
read-optimized, precomputed, denormalized derivative of whatever your actual
source of truth is: a CMS, a docs repo, a database of policies, a Confluence
space, whatever. And like every cache, it goes stale the moment the source
changes and nobody tells it.

We've had this problem in distributed systems for forty years, and we have a
whole vocabulary for it: TTLs, write-through vs. write-behind, cache coherence
protocols, the old joke about the two hard problems in computer science. Somehow
the RAG ecosystem reinvented caching from scratch and forgot to bring the
invalidation half with it. Laid side by side, the mapping is almost
embarrassingly direct:

| Classic cache strategy            | What it means for a vector index                                                  | What we were actually doing                                           |
| --------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| TTL expiry                        | Chunk expires N hours after `indexed_at`, forced re-embed regardless of change    | Nothing — chunks lived forever once written                           |
| Write-through                     | Source write and index write happen in the same transaction/request               | Nothing — the two were connected by a nightly cron, not a write path  |
| Write-behind / async invalidation | Source write queues an event; index catches up asynchronously, with a bounded lag | This is the one we ended up building                                  |
| Cache coherence / versioning      | Every entry carries a version so a reader can detect it's behind the writer       | Missing — chunks had no version, generation, or timestamp of any kind |

Once it's a table instead of a metaphor, the gap is obvious: we had none of the
four. Not the cheap one (TTL), not the correct-but-expensive one
(write-through), not even a version number that would have let anything
downstream notice it was behind.

The reason this is worse in RAG than in a normal cache is the part that made me
actually sit down and write this up. When a normal cache is stale, it's usually
_visibly_ stale — you get a 404, an old timestamp, a page that clearly hasn't
refreshed. Staleness announces itself. When a RAG pipeline retrieves a stale
chunk, the LLM doesn't know the chunk is old. It has no signal for that. So it
takes the outdated policy text and writes a warm, confident, perfectly-formatted
answer around it, with the same tone and fluency it would use for a chunk
indexed ten minutes ago. Staleness gets laundered into confidence. That's the
actual failure mode: not that the system retrieves wrong information, but that
it retrieves _outdated_ information and presents it as indistinguishable from
current information.

Once I framed it that way, the fix stopped being "improve the retrieval
pipeline" and started being "build the invalidation half of the cache we already
have."

## Why the naive setup breaks quietly

Our original pipeline looked like almost every RAG tutorial's diagram: a cron
job ran every night, pulled the current state of every document from the CMS,
chunked it, re-embedded everything, and swapped the collection in the vector
store. It felt safe. Full rebuild, no partial-update bugs, nothing to reconcile.

Two things were wrong with it, and they pulled in opposite directions:

- **It was blind.** The cron job had no idea which documents had changed since
  last night. It re-embedded three thousand chunks to catch the two that
  mattered.
- **It was still slow relative to reality.** Even doing all that unnecessary
  work, the freshest a fact could ever be was "as of last midnight." A policy
  published at 9am was invisible to the bot until the next night's run: worst
  case, just under 24 hours of silently wrong answers (and that's assuming the
  run didn't fail or get skipped, which ours did, twice, in the month before the
  refund incident).

Finding out how bad it actually was meant joining two systems that had never
talked to each other: the CMS's revision history and the support platform's
ticket log, on timestamp.

```sql
select t.ticket_id, t.created_at, t.transcript_excerpt
from support_tickets t
join cms_revisions r
  on r.doc_id = 'refund-policy'
  and t.created_at between r.published_at and r.superseded_at
where t.transcript_excerpt ilike '%30 day%'
  and r.published_at < now() - interval '1 day'  -- revision already superseded when the ticket was created
order by t.created_at;
```

That query returned 47 tickets over the three-week window. Support had already
resolved most of them manually by the time we ran it (a human had caught the
discrepancy and quietly given the customer the right answer), but 11 had gone
out the door with the 30-day figure standing, unflagged, in the actual
resolution note. Eleven customers who were told the wrong policy, by a system
none of them had any reason to distrust, because the index didn't know the
ground had moved.

The diagram below is the version of our architecture I'd actually draw on a
whiteboard now, both halves:

![Architecture diagram comparing a blind nightly full-reindex pipeline (before) against an event-driven, content-hashed, freshness-aware pipeline (after)](/assets/images/writing/architecture-before-after.svg)

The fix isn't "reindex more often." Reindexing more often just shrinks the blind
window without removing it, and it burns embedding-API budget re-encoding chunks
that never changed. The fix is giving the source system a way to _tell_ the
index what changed, and giving the index a way to _tell_ retrieval how old what
it's holding is.

## Treating documents like cache entries, not files

The core primitive is boring and that's the point: a content hash per chunk,
checked on every write.

```python
import hashlib

def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def diff_chunks(source_chunks: list[dict], indexed_chunks: dict[str, str]) -> dict:
    """
    source_chunks: current chunks pulled from the CMS, each {"chunk_id", "text"}
    indexed_chunks: {chunk_id: content_hash} currently sitting in the vector store
    """
    to_embed, to_tombstone = [], []
    seen = set()

    for chunk in source_chunks:
        h = content_hash(chunk["text"])
        seen.add(chunk["chunk_id"])
        if indexed_chunks.get(chunk["chunk_id"]) != h:
            to_embed.append({**chunk, "content_hash": h})

    to_tombstone = [cid for cid in indexed_chunks if cid not in seen]
    return {"to_embed": to_embed, "to_tombstone": to_tombstone}
```

This alone changes the economics: on a typical day, two or three documents
change out of a few hundred. We went from re-embedding the whole corpus nightly
to re-embedding a handful of chunks whenever they actually moved, a couple of
dollars of embedding calls a day instead of running the full corpus through the
model every single night for no reason.

The second half is a webhook instead of a clock. The CMS already fires an event
on publish — we just weren't listening to it.

```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/cms-webhook")
async def on_publish(event: dict):
    doc_id, rev, source_updated_at = event["doc_id"], event["rev"], event["updated_at"]
    chunks = fetch_and_chunk(doc_id)
    indexed = get_indexed_hashes(doc_id)

    diff = diff_chunks(chunks, indexed)
    for chunk in diff["to_embed"]:
        vector = embed(chunk["text"])
        upsert_vector(
            chunk_id=chunk["chunk_id"],
            vector=vector,
            metadata={
                "content_hash": chunk["content_hash"],
                "source_updated_at": source_updated_at,
                "indexed_at": now_utc(),
                "generation": rev,
            },
        )
    for chunk_id in diff["to_tombstone"]:
        tombstone_vector(chunk_id)  # soft-delete: filtered at query time, hard-deleted async
```

The tombstone step matters more than it looks like it should. Most vector
databases batch physical deletes for performance reasons: an ANN index doesn't
want to rebalance on every single removal. If a document gets pulled and you
rely on the physical delete to keep it out of retrieval, you can serve a
_deleted_ answer for longer than a merely outdated one. A soft tombstone flag,
checked as a metadata filter at query time, closes that gap immediately, and the
physical cleanup can happen on its own schedule without anyone's correctness
depending on when it runs.

`source_updated_at`, `indexed_at`, and `generation` on every chunk are the other
piece that's easy to skip and expensive to skip. Without them, a chunk in the
vector store is just a chunk — there's no way to ask "how old is what I'm about
to hand the model." With them, staleness becomes a queryable, alertable number
instead of an invisible property.

## Making retrieval freshness-aware

The retrieval side needs to actually use that metadata, not just store it for
forensics after the next incident.

```python
def retrieve(query: str, top_k: int = 8, max_staleness_hours: float | None = None):
    results = vector_store.search(embed(query), top_k=top_k * 2, filter={"tombstoned": False})

    now = now_utc()
    scored = []
    for r in results:
        lag_hours = (now - r.metadata["source_updated_at"]).total_seconds() / 3600
        if max_staleness_hours is not None and lag_hours > max_staleness_hours:
            continue  # too old for this domain's freshness budget, drop it entirely
        # mild recency penalty rather than a hard cutoff, tunable per collection
        adjusted_score = r.score - min(lag_hours / 500, 0.05)
        scored.append((adjusted_score, r, lag_hours))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:top_k]
```

The `max_staleness_hours` budget isn't a constant across a company's whole
knowledge base, and treating it like one is its own mistake. A refund-policy
chunk with a two-week lag is a liability. A chunk describing the company's
founding story with a two-week lag is irrelevant: nothing about it changed, and
it's not going to. The freshness budget should live next to the document type,
not the pipeline. Ours ended up looking roughly like this once we'd been burned
enough times to take it seriously:

| Document type                    | Freshness budget | Reasoning                                                                           |
| -------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| Billing / refund / legal policy  | 15 minutes       | Directly quoted to customers; wrong answer is a support or compliance incident      |
| Product feature docs             | 4 hours          | Changes with releases; a few hours of lag is a minor annoyance, not a liability     |
| Pricing pages                    | 1 hour           | Customer-facing dollar amounts; treated closer to policy than to features           |
| Internal runbooks                | 24 hours         | Read by engineers who can sanity-check against the source if something looks off    |
| Company history / marketing copy | 30 days          | Effectively static; a generous budget mostly guards against silent pipeline failure |

The other change worth calling out: when a chunk gets dropped for exceeding
budget and nothing better exists, the system says so — "I don't have current
information on this" — instead of quietly answering from what it has. That one
sentence of honesty is the entire difference between a stale cache and a silent
lie.

## The invalidation nobody budgets for: your embedding model

Everything above assumes the _source documents_ are the only thing that changes.
There's a second invalidation trigger that's easy to miss entirely: the
embedding model itself.

Swap `text-embedding-3-small` for a newer model, or even bump a minor version of
the same model family, and every vector already sitting in your index was
computed by a function that no longer matches the one you're using to embed new
queries. Nothing about the source documents changed. The cache is stale anyway,
in its entirety, all at once. And because nothing triggered the normal diffing
logic, nothing catches it. Cosine similarity between an old-model chunk vector
and a new-model query vector doesn't throw an error or return nothing — it
returns a number, and the number looks like a normal similarity score. It just
quietly means less than it used to, across every result, with no single answer
bad enough to generate a support ticket and get investigated.

We handle this by treating the embedding model's identifier as part of the cache
key, not a side detail:

```python
EMBEDDING_MODEL_VERSION = "text-embedding-3-small@2024-06"

def upsert_vector(chunk_id, vector, metadata):
    metadata["embedding_model_version"] = EMBEDDING_MODEL_VERSION
    vector_store.upsert(chunk_id, vector, metadata)

def retrieve(query, **kwargs):
    query_vector = embed(query, model=EMBEDDING_MODEL_VERSION)
    results = vector_store.search(query_vector, filter={
        "embedding_model_version": EMBEDDING_MODEL_VERSION,
        "tombstoned": False,
    })
    ...
```

A model upgrade becomes a full-corpus re-embed, deliberately and visibly (the
same "big scary migration" a schema change would be in a normal database),
rather than a silent, partial, permanent staleness that nobody scheduled and
nobody will ever fully clear out on its own.

## The cache above the cache

Once I'd fixed the index, I went looking for whoever else had hit this, mostly
to check I hadn't missed an obvious existing solution. Most of what's out there
treats the vector index as the only cache in the system, which was true for us
at the time. It stopped being true a few months later, when we put a semantic
answer cache in front of the LLM call to cut cost on repeated questions: cache
the generated answer, keyed by similarity to past queries, and skip the model
entirely on a near-duplicate question.

That cache has the same staleness problem, but it's a meaner version of it. The
vector index is keyed by `doc_id` and `chunk_id` — when the refund policy
changes, I know exactly which rows to touch. The answer cache is keyed by _query
similarity_, not document identity. There's no `doc_id` column to tombstone by,
because a cached answer isn't "about" a document, it's a blob of generated text
that happened to be produced using some set of retrieved chunks at some point in
the past. Nothing about the cache entry itself points back to what it depended
on, unless you deliberately made it do that.

The fix is the same idea as the index-level one, one layer up: record, per
cached answer, which chunk IDs (and which content hashes of those chunks)
actually went into generating it. When a chunk's hash changes, invalidate not
just its own index entry but every cached answer whose dependency list includes
it.

```python
def cache_answer(query: str, answer: str, retrieved_chunks: list[dict]):
    answer_cache.set(
        key=embed(query),
        value=answer,
        depends_on=[(c["chunk_id"], c["content_hash"]) for c in retrieved_chunks],
    )

def invalidate_dependent_answers(chunk_id: str, new_hash: str):
    for entry in answer_cache.find_by_dependency(chunk_id):
        old_hash = dict(entry.depends_on).get(chunk_id)
        if old_hash != new_hash:
            answer_cache.delete(entry.key)
```

I don't think this is a widely solved problem yet, at least not in anything I
found written up for a general audience — the closest thing I came across was a
research paper on dependency-consistent answer reuse for RAG serving, which at
least confirms it's a real, named failure mode and not something specific to how
we'd built things. Two layers of cache, two different keys, two different
invalidation strategies, and neither one covers the other automatically. If
you're only invalidating the index, a semantic answer cache sitting in front of
it will happily keep serving a stale answer forever, fully unaware that the
chunks underneath it moved.

## Testing for staleness instead of just relevance

Every RAG eval set I'd used before this measured the same thing: given a fixed
corpus, is the retrieved chunk relevant and is the answer faithful to it. None
of that catches this bug, because the bug only shows up when the corpus
_changes_ and the pipeline doesn't keep up. You need a test that mutates the
source and checks how long the system takes to notice.

```python
def test_freshness_propagation():
    doc_id = create_test_doc("refund policy: 30 days")
    trigger_index_pipeline()
    assert "30 days" in ask("what is the refund window?")

    update_test_doc(doc_id, "refund policy: 14 days")
    trigger_index_pipeline()

    deadline = time.time() + FRESHNESS_SLO_SECONDS
    while time.time() < deadline:
        answer = ask("what is the refund window?")
        if "14 days" in answer and "30 days" not in answer:
            return  # propagated within SLO
        time.sleep(5)

    raise AssertionError(f"stale answer survived past the {FRESHNESS_SLO_SECONDS}s freshness SLO")
```

This runs in CI on every deploy to the ingestion pipeline, and separately as a
synthetic canary in production: a real document, in a real (test-labeled) corner
of the CMS, mutated on a schedule, with an alert if the answer doesn't flip
within the SLO window. It's the same idea as a synthetic transaction check for
an API, aimed at a failure mode nobody usually monitors for.

## What actually changed

We instrumented staleness lag as a real metric, the time between a document's
`updated_at` and the moment its embedding lands in the index, and watched it
before and after the CDC-based rework:

![Bar chart comparing staleness lag percentiles before and after the fix: p50 drops from 21.4 hours to 0.18 hours, p95 from 68.5 to 0.9, p99 from 96.2 to 2.4, and the observed maximum from 141 hours to 6.1 hours](/assets/images/writing/staleness-lag-before-after.png)

The p50 moving from about a day down to roughly ten minutes was the expected
win. The number I actually cared about was the tail. The old pipeline's p99 was
four days, meaning at least 1% of the time, a fact could be nearly a week stale
before the nightly job even got to it, longer if that run happened to fail. The
new pipeline's worst observed case, across weeks of running it, was a little
over six hours, and that one case was a CMS webhook retry storm during an
unrelated outage, not the steady-state behavior. Median latency is what you put
in a demo. Tail latency is what generates support tickets, and it's the number
that actually should gate a rollout.

Two smaller numbers ended up mattering more day to day than the headline latency
chart. Embedding spend on the ingestion pipeline dropped from re-encoding
roughly 3,000 chunks a night to an average of 6, which took that line item from
a fixed nightly cost to something that scales with how much the business
actually changes. And in the two months after rollout, the same ticket-audit
query from earlier returned zero cases of a resolved ticket quoting a policy
value that had already been superseded at the time it was quoted. That's down
from the 11 we found in the three weeks before the fix. Zero isn't a number I
trust to hold forever, which is exactly why the freshness canary from the
testing section keeps running instead of getting deleted once the postmortem
closed.

## Where this is still uncomfortable

I don't think this is a solved problem, and I'd rather say what's still rough
than pretend the pipeline above is the final answer.

Hash-based diffing catches changed _text_. It doesn't catch semantic drift where
the surrounding meaning shifts without the specific sentence changing: a policy
that's still technically true but has become misleading because something
adjacent to it changed. I don't have a clean answer for that one; it's closer to
a documentation-quality problem than a pipeline problem.

The freshness budget per document type is currently a config value a human sets,
not something derived automatically. It should probably be informed by how often
a document has historically changed and how costly a wrong answer in that domain
is, but we're not there yet — it's a spreadsheet, not a model.

And volatility is really the deeper question underneath all of this: some data
shouldn't be embedded at all. If a fact changes hourly, baking it into a vector
index and then fighting to keep the index in sync is fighting the wrong battle.
That data belongs behind a live tool call at generation time, not in the
retrieval corpus. Figuring out where that line sits for a given system is, I
think, a more interesting design decision than anything about chunk size, and it
gets almost none of the attention chunk size does.

The unglamorous version of the lesson: if you wouldn't ship a cache without an
invalidation strategy, don't ship a vector index without one either. It's the
same primitive wearing a fancier name.
