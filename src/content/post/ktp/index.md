---
title: "KTPSocket: Reliable Flow Control over Unreliable Channels"
description: "Visualizing and analyzing reliable message delivery using custom TCP-like flow control over UDP"
publishDate: "30 March 2025"
draft: false
tags: ["networks", "socket", "UDP", "TCP", "reliability", "flow-control", "visualization", "pcap"]
---

## KTPSocket - Network Lab Project  
(Source Code: [KTPSocket Code](https://github.com/SumitKumar-17/CS39006_Networks_Lab/tree/main/week_5/Sumit_Kumar_22CS30056))  
(Visualization Dashboard: [Live Dashboard](https://k-socket-graphs.vercel.app/))

This one was from our Networks Lab — we had to simulate a reliable message transmission protocol *over UDP*, basically a TCP-like behavior built from scratch. We called it **KTPSocket**, short for "Kharagpur TCP Socket."

To test how reliable it was under different loss conditions, we plotted graphs to show how message delivery performance degrades as packet loss probability increases.

## Objective

To emulate reliable end-to-end flow control over an unreliable communication medium (i.e., UDP). The system had to ensure:

- Message integrity and correct order
- Acknowledgment of received messages
- Retransmission on timeout
- No reliance on TCP — implemented entirely over raw UDP sockets

##  Graphs

<img width="100%" src="/ktp/image-1.png"/>
<img width="100%" src="/ktp/image-2.png"/>

## Performance Analysis

Here’s what we observed:

- **Impact of P**: As loss rate (P) increases, the cost of reliable communication increases *non-linearly*. After P = 0.35, things start to go wild.
- **ACK Efficiency**: Even under high loss rates, ACK packets don’t grow as fast. That shows our protocol design is decently efficient.
- **Network Load**: Total load increases fast. At P = 0.50, it takes on average ~6 packets to deliver one message successfully. That’s a 6x overhead!

---

## Final Thoughts

This lab was honestly one of the coolest — building your own reliable channel on top of UDP teaches you how TCP might be working under the hood. I had to tune the retransmission logic, timers, and loss handling multiple times to get consistent results.

Was fun to also create a dashboard with real-time plots and Wireshark captures.

