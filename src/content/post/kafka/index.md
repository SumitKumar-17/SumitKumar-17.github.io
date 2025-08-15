---
title: "Built Kafka for Fun and Now I Understand Why It's Fast"
description: "Deep dive into the high-performance techniques implemented in C-Kafka project, including zero-copy, memory-mapped I/O,thread-to-core mapping."
publishDate: "15 August 2025"
draft: false
tags: ["c", "kafka", "systems-programming", "performance", "learning"]
---

I recently went down a rabbit hole and built a mini-Kafka in C. Why? Because I wanted to understand what makes distributed log systems like Kafka so fast. It turns out, a lot of it comes down to some clever, low-level optimizations that are fascinating to explore.

This project, which I’m calling **C-Kafka**, isn’t a feature-complete Kafka clone, but it implements some of the core concepts that make the real Kafka a performance beast. Let’s break down a few of the most interesting parts.

---
## Zero-Copy: Because Copying Data is for the Birds

One of the first things you learn when you get into high-performance I/O is that copying data between user space and kernel space is a major bottleneck. Every time your application reads data from a file and sends it over the network, the CPU has to spend cycles just shuffling bytes around.

Enter **zero-copy**. The idea is to move data directly from the disk to the network without it ever needing to be copied into the application’s memory. In C-Kafka, I implemented this using the `sendfile` system call, which is available on Linux and macOS.

Here’s a snippet from the server implementation that shows how it works:

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
````

*C-Kafka/src/zeroCopy/src/server.c*

By using `sendfile`, the operating system handles the data transfer directly, which means fewer context switches and no data duplication. It’s a simple change, but it can have a huge impact on performance, especially when you’re moving a lot of data.

-----

## Memory-Mapped I/O: Pretending a File is a Giant Array

Another cool technique I explored is **memory-mapped I/O (mmap)**. Instead of reading a file using traditional `read` and `write` calls, `mmap` allows you to map a file directly into your application's address space. This makes the file's contents appear as if they are in memory, allowing you to access them with simple pointer arithmetic.

This is particularly useful for a log-based system like Kafka, where you’re constantly reading and writing to large, sequential files. In C-Kafka, I used this concept to read log files, which simplifies the code and can offer performance benefits by reducing the number of system calls and leveraging the kernel's page cache.

Here’s a look at how I’m reading the log file:

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

*C-Kafka/src/mmap/src/mapper.c*

Working with memory-mapped files feels a bit like magic. You’re interacting with a file on disk as if it’s just a big array in memory, and the operating system handles the complexity of loading the data in and out of RAM as needed.

-----

## Thread-to-Core Mapping: Putting Your Threads on a Leash

When you’re building a multi-threaded application, you usually let the operating system’s scheduler decide which CPU core each thread runs on. But for high-performance applications, you can sometimes get better results by explicitly telling the OS where to run your threads. This is called **thread pinning** or **thread affinity**.

In C-Kafka, I experimented with pinning different threads to specific CPU cores. For example, I designated one core for network I/O, another for flushing logs to disk, and a third for consumer message processing. The goal is to reduce cache invalidation and context switching, as each core can focus on a specific task.

This is highly dependent on the operating system, and on Linux, you can do this using `pthread_setaffinity_np`.

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

*C-Kafka/src/threadCore/src/threadmap.c*

This is a more advanced optimization, and it won’t always provide a benefit, but in a system that’s designed to push the hardware to its limits, it’s another tool in the performance toolbox.

-----

Building C-Kafka was a fantastic learning experience. It’s one thing to read about these concepts, but implementing them from scratch really solidifies your understanding. If you’re interested in systems programming or just want to see how a project like this is put together, feel free to check out the source code.
