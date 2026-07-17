---
title: C-Kafka
date: 2025-08-15
repo: SumitKumar-17/C-Kafka
topics: ["C", "Systems", "Performance"]
lead:
  A mini Kafka clone in C, built to understand what makes distributed logs fast.
---

I recently went down a rabbit hole and built a mini-Kafka in C. Why? Because I
wanted to understand what makes distributed log systems like Kafka so fast, and
reading about it wasn't cutting it anymore. It turns out a lot of the speed
comes down to a handful of clever, low-level tricks that are genuinely fun to
implement.

**C-Kafka** isn't a feature-complete Kafka clone - no replication, no
partitioning across a cluster - but it implements the core performance tricks
that make the real thing a beast: zero-copy I/O, memory-mapped log reads, and
manual thread-to-core pinning.

## Zero-copy: because copying data is for the birds

Copying data between user space and kernel space is a major bottleneck. Every
time your app reads a file and sends it over the network the normal way, the CPU
spends cycles just shuffling bytes from the kernel's buffer into your process's
buffer, then back into another kernel buffer for the socket. Twice the copying,
for no reason.

**Zero-copy** moves data directly from disk to network without it ever passing
through application memory. C-Kafka does this with the `sendfile` syscall:

```c
#ifdef __APPLE__
        off_t len = st.st_size;
        if (sendfile(file_fd, client_fd, 0, &len, NULL, 0) < 0) {
            perror("sendfile (macOS)");
        }
#else
        off_t offset = 0;
        if (sendfile(client_fd, file_fd, &offset, st.st_size) < 0) {
            perror("sendfile (Linux)");
        }
#endif
```

_C-Kafka/src/zeroCopy/src/server.c_

The OS handles the transfer directly - fewer context switches, no data
duplication. A one-line change with an outsized impact once you're moving real
volumes of data.

## Memory-mapped I/O: pretending a file is a giant array

Instead of `read`/`write` calls, `mmap` maps a file directly into the process's
address space, so its contents look like they're already in memory - you access
them with plain pointer arithmetic instead of syscalls:

```c
void read_log_with_mmap(char *filepath) {
    int fd = open(filepath, O_RDONLY);
    if (fd < 0) {
        fprintf(stderr, "Failed to open log file: %s\n", filepath);
        perror("open");
        return;
    }
    // ...
```

_C-Kafka/src/mmap/src/mapper.c_

For a log-based system like Kafka - constantly reading and writing large,
sequential files - this simplifies the code and leans on the kernel's page cache
instead of reinventing one.

## Thread-to-core mapping: putting your threads on a leash

Normally you let the OS scheduler decide which core each thread runs on. For
high-performance workloads, you can often do better by pinning threads
yourself - **thread affinity**. In C-Kafka I dedicated one core to network I/O,
one to flushing logs to disk, and one to consumer message processing, using
`pthread_setaffinity_np` on Linux:

```c
void bind_thread_to_core(int core_id) {
    cpu_set_t cpuset;
    CPU_ZERO(&cpuset);
    CPU_SET(core_id, &cpuset);

    pthread_t current = pthread_self();
    if ((pthread_setaffinity_np(current, sizeof(cpu_set_t), &cpuset)) != 0) {
        perror("setaffinity error");
    } else {
        printf("Thread %lu bound to core %d\n", (long)current, core_id);
    }
}
```

_C-Kafka/src/threadCore/src/threadmap.c_

It's a more advanced optimization and won't always pay off, but in a system
built to push hardware to its limits, it's one more tool that reduces cache
invalidation and context switching.

Building C-Kafka was a fantastic learning experience. It's one thing to read
about zero-copy and mmap in a blog post; it's another to implement them from
scratch and watch throughput actually change. That's the kind of understanding
that sticks.
