---
title: "Deconstructing a Masterclass: Postgres 42,000x Slower"
description: "A breakdown of a brilliant and hilarious article on negative performance tuning in PostgreSQL."
publishDate: "4 August 2025"
draft: false
tags: ["postgres", "database", "performance", "tuning", "dev-culture"]
---

I just came across an absolutely brilliant and hilarious blog post by Jacob Jackson titled "[Making Postgres 42,000x slower because I am unemployed](https://byteofdev.com/posts/making-postgres-slow/)".

It's such a refreshing take on performance tuning. Instead of the usual struggle for marginal gains, the author embarks on a glorious mission to completely destroy a database's performance using only its configuration file.

The beauty of the article is how much it teaches you about Postgres internals by showing you exactly how to break them. It’s a masterclass in reverse-engineering performance.

I was interested in this article due to my intereset and further working in Databases
---
## The Major Tweaks to Kill Performance

The author's approach was both methodical and malicious. Here are the major tweaks they used to systematically cripple the database:

* **Destroying the Cache:** The first and most devastating blow was gutting the **`shared_buffers`**. By slashing the RAM cache to its absolute minimum, they forced nearly every query to read from the slow disk instead of fast memory.

* **Weaponizing Background Work:** They reconfigured the **`autovacuum`** process to run constantly and aggressively. This created a state of perpetual, useless "busywork" that consumed system resources for no reason.

* **Making Writes Inefficient:** They manipulated the **Write-Ahead-Log (WAL)** to make every single database write as slow as possible, forcing frequent and expensive flush-to-disk operations (checkpoints).

* **Tricking the Query Planner:** In a particularly clever move, they didn't delete the indexes but made them useless. By setting the **`random_page_cost`** to an absurdly high number, they tricked Postgres into thinking a full table scan was always faster than a targeted index lookup.

* **Creating an I/O Bottleneck:** The final nail in the coffin was using new configuration options to force all disk **Input/Output (I/O)** operations through a single, overwhelmed worker thread.

---
The final result was a staggering **42,000x slowdown**, taking a high-performance database and making it completely unusable.

It’s one of the best articles I’ve read on database internals precisely because it comes at the problem from such a unique and destructive angle. You learn more about making Postgres fast by reading how to make it slow. 🔥
I will definitely recommend all the people to just go through this blog. It is awesome.