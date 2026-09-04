---
title: The Ring Buffer That Buys Your Database Some Breathing Room
date: 2026-09-06
topic: Technology
lead:
  Thousands of sensors, one database, and a batching problem a circular array
  solves better than backpressure or an unbounded queue ever could.
---

Say you've got a few thousand low-powered sensors that need to land their
readings in a database. Holding a connection open per sensor is a
non-starter, and inserting one row per reading is a great way to make the
database the bottleneck long before the sensors ever are. The obvious fix is
a co-located collector: something that accepts sensor data as it arrives and
flushes it to the database in batches every 30 seconds, instead of on every
reading.

That reframes the problem into two questions worth sitting with: what's the
max batch size, and what happens when readings keep arriving after that size
is already hit? The batch can fill up not just because sensors got chatty,
but because the database connection is slow, or briefly down. Rather than
building backpressure to stall the sensors, or growing the buffer without
bound, the pragmatic trade-off is to drop the *oldest* buffered reading and
keep the newest one. You lose some data, but whatever batch you eventually
emit is always the freshest signal available - which, for a sensor feed, is
usually exactly what you want.

**A ring buffer is that trade-off, implemented as a fixed-size array.**
Conceptually it's an array where the slot after the last one wraps back to
the first, forming a circle: `a[n] -> a[0]`. Two pointers walk that circle -
a write pointer that advances on every insert, and a read pointer that
advances on every emit. When the write pointer catches up to the read
pointer, the buffer is full, and the next insert is allowed to overwrite the
oldest unread entry instead of blocking or growing.

**Sizing the backing array up front avoids a resize path entirely.** In Go,
`make([]*Data, size)` allocates the full backing array once - there's no
`append`-driven growth to worry about, and the ring never gets bigger than
the size you chose. `lastInsert` starts at `-1` specifically so `Emit` can
tell "nothing has ever been written" apart from "the buffer is sitting at
index 0" - without that sentinel, an empty buffer and one that just wrapped
past its last slot would look identical.

**Insert is one line of real logic, wrapped in a sentinel check:**

```go
func (r *RingBuffer) Insert(input Data) {
    r.lastInsert = (r.lastInsert + 1) % r.size
    r.data[r.lastInsert] = &input

    if r.nextRead == r.lastInsert {
        r.nextRead = (r.nextRead + 1) % r.size
    }
}
```

`(r.lastInsert + 1) % r.size` is the whole trick: in a 5-slot buffer,
advancing from index 4 gives `(4+1) % 5 = 0`, landing back at the start
instead of running off the end. The `if` beneath it is what makes overwriting
safe - if the write pointer is about to land on the read pointer, the read
pointer gets bumped forward too, so `Emit` never hands back a slot that's
mid-overwrite.

**Emit drains everything since the last call, walking the same circle:**

```go
func (r *RingBuffer) Emit() []*Data {
    output := []*Data{}
    for {
        if r.data[r.nextRead] != nil {
            output = append(output, r.data[r.nextRead])
            r.data[r.nextRead] = nil
        }
        if r.nextRead == r.lastInsert || r.lastInsert == -1 {
            break
        }
        r.nextRead = (r.nextRead + 1) % r.size
    }
    return output
}
```

It walks from the read pointer up to the write pointer, collecting anything
non-nil and clearing the slot behind it. Setting the slot to `nil` after
reading keeps the buffer's internal state honest - a second `Emit` call
before any new insert correctly returns an empty slice instead of replaying
old data.

**Running it makes the overwrite behavior concrete.** Insert 10 values (`a`
through `j`) into a buffer sized for 5, then emit: `a` through `e` never
survive, because each gets overwritten by the write pointer lapping the
buffer before emit is ever called. What comes back is `f, g, h, i, j` -
exactly the newest 5, which is the entire point of choosing this trade-off in
the first place.

A couple of things worth flagging if you take this further. None of this is
thread-safe as written, so a real emitter running `Insert` from one goroutine
and `Emit` off a timer in another needs a mutex around both. And the modulo
expressions, small as they are, are exactly the kind of thing you can hide
behind a dedicated index type with a `Next()` method if `(x + 1) % size`
scattered across a file starts to bother you.

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/KyreJSKEagg?start=31"
    title="Ring buffer walkthrough"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

Full runnable code, including the `EMPTY TEST` / `FULL TEST` harness above, is
up at [/code/ringbuffer](/code/ringbuffer).
Source: the [video walkthrough](https://www.youtube.com/watch?v=KyreJSKEagg&t=31s)
above and [Josh Rosso](https://joshrosso.com)'s ring buffer writeup, which is
where this implementation and the sensor-batching framing originate.
