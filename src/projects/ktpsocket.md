---
title: KTPSocket
date: 2025-03-30
repo: SumitKumar-17/CS39006_Networks_Lab
topics: ["Networking", "C", "UDP", "Visualization"]
lead: A reliable, TCP-like flow control protocol built from scratch over raw UDP.
image: ktp-1.png
subimages: ["ktp-2.png"]
---

This one was from our Networks Lab — we had to simulate a reliable message transmission protocol *over UDP*, basically TCP-like behavior built from scratch. We called it **KTPSocket**, short for "Kharagpur TCP Socket."

The goal: emulate reliable end-to-end flow control over an unreliable communication medium, ensuring message integrity and correct order, acknowledgment of received messages, retransmission on timeout, with no reliance on TCP — implemented entirely over raw UDP sockets.

To test how reliable it was under different loss conditions, we plotted graphs showing how message delivery performance degrades as packet loss probability increases:

- **Impact of loss rate (P):** as P increases, the cost of reliable communication grows *non-linearly*. After P = 0.35, things start to go wild.
- **ACK efficiency:** even under high loss rates, ACK packets don't grow as fast, suggesting the protocol design is decently efficient.
- **Network load:** at P = 0.50, it takes on average ~6 packets to deliver one message successfully — a 6x overhead.

Building your own reliable channel on top of UDP teaches you a lot about how TCP works under the hood. I had to tune the retransmission logic, timers, and loss handling multiple times to get consistent results. I also built a [live dashboard](https://k-socket-graphs.vercel.app/) with real-time plots and Wireshark captures to visualize it all.
