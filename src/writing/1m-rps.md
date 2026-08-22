---
title: What I Learned Trying to Serve 1 Million Requests/Second
date: 2026-08-22
topic: Technology
lead:
  I ran agile8118's node-1m-rps and cpp-1m-rps myself and landed in the same
  ballpark - here's what actually breaks on the way to a million.
---

I spent a weekend running [agile8118](https://github.com/agile8118)'s
[node-1m-rps](https://github.com/agile8118/node-1m-rps) and
[cpp-1m-rps](https://github.com/agile8118/cpp-1m-rps) myself, after watching the
video that walks through them
([Let's Handle 1 Million Requests per Second](https://www.youtube.com/watch/W4EwfEU8CGA)).
I wasn't just going to take the numbers on faith - I cloned both, ran the same
benchmarks locally, and landed in the same ballpark the video reports. Here's
what actually breaks on the way to a million requests per second, in the order I
hit each wall.

**First wall: your framework matters more than you'd think, but less than your
database.** The repo has the same route written three ways - a minimal
zero-dependency framework called Cpeak, Express, and Fastify. Express loses
badly (mine landed around 14-20k req/s), Fastify and Cpeak both land way ahead
of it and close to each other. Fine, framework picked. Then you hit the route
that writes to Postgres and the number falls off a cliff - tens of thousands of
requests per second turns into tens of thousands of _writes_ per second, and no
amount of framework choice fixes that. I bumped the disk IOPS on a test database
and gained maybe 2x for a few hundred dollars a month more, nowhere close to
what you'd need to close that gap.

**Second wall: the database is never getting to a million, so stop trying.** The
actual fix isn't "scale the database harder," it's "don't hit the database at
all." Write to Redis instead, and sync to Postgres later in batches. A single
Redis instance still caps out around 100k ops/second though - which is a real
number worth knowing, not a rounding error - so the repo shards across a 30-node
Redis Cluster (15 masters, 15 replicas) and _that's_ what actually clears a
million writes a second. The lesson isn't "use Redis," it's "know where your
actual ceiling is before you try to push past it."

**Third wall: this is where Node.js just stops.** On a route that returns a
heavier ~30KB JSON payload, even on a 192-core box, Node's cluster model
plateaus under a million - all that traffic funnels through one parent process
before fanning out to workers, and that dispatcher itself becomes the
bottleneck. The fix was rewriting the same route in C++ on Drogon. The genuinely
funny part: the first C++ version was _four times slower_ than Node, because
Drogon's default JSON parser was worse than V8's. Swapping it for RapidJSON is
what actually got it past a million - not the language change, a parsing
library. I would not have guessed that going in.

**Fourth wall: proving the number is its own project.** Even after the server
could do it, one tester machine couldn't generate enough load without becoming
the bottleneck itself. The fix in the video was almost funny: stop using one
giant tester, use sixty small ones instead. Sixty separate 8-core client
machines, all firing `autocannon` at a single 192-core target in parallel, is
what it actually took to saturate the thing convincingly. The final clean run:
30 minutes, roughly 2 billion requests, over 60 terabytes moved - and only about
40 timeouts in all of that. Not zero. Forty. Which is somehow more convincing
than zero would have been.

![1M RPS by the numbers: 192 cores on the target server, 60 client machines firing load, 2.07 billion requests in 30 minutes, 67.81 TB moved with only ~40 timeouts](/assets/images/writing/1m-rps-rig.svg)

None of this needed to be groundbreaking to be worth doing. Running it myself
instead of just reading the README changed what stuck: the framework benchmark
is the least interesting part, the database wall is where most people would
actually give up, and the C++ rewrite matters far less than the one line about
swapping a JSON parser. Go read the repos, and if you can, actually run them -
the numbers hit different when they're on your own screen.
