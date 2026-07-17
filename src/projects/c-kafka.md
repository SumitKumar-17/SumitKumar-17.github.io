---
title: C-Kafka
date: 2025-08-15
repo: SumitKumar-17/C-Kafka
topics: ["C", "Systems", "Performance"]
lead: A mini Kafka clone in C, built to understand what makes distributed logs fast.
---

I recently went down a rabbit hole and built a mini-Kafka in C. Why? Because I wanted to understand what makes distributed log systems like Kafka so fast. It turns out a lot of it comes down to some clever, low-level optimizations that are fascinating to explore.

This project isn't a feature-complete Kafka clone, but it implements some of the core concepts that make the real Kafka a performance beast.

**Zero-copy.** Copying data between user space and kernel space is a major bottleneck: every time your app reads a file and sends it over the network, the CPU spends cycles shuffling bytes around. C-Kafka uses the `sendfile` syscall so the OS moves data directly from disk to network without it ever passing through application memory — fewer context switches, no duplication.

**Memory-mapped I/O.** Instead of `read`/`write` calls, `mmap` maps a file directly into the process's address space, so its contents look like a giant in-memory array accessible via pointer arithmetic. For a log-based system like Kafka, constantly reading/writing large sequential files, this simplifies the code and leverages the kernel's page cache.

**Thread-to-core mapping.** Rather than letting the OS scheduler pick cores freely, I pinned specific threads to specific cores using `pthread_setaffinity_np` — one core for network I/O, one for flushing logs to disk, one for consumer message processing — to reduce cache invalidation and context switching.

Building C-Kafka was a fantastic learning experience. It's one thing to read about zero-copy and mmap, but implementing them from scratch really solidifies your understanding of why distributed logs are built the way they are.
