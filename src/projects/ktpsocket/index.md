---
title: KTPSocket
date: 2025-03-30
repo: SumitKumar-17/CS39006_Networks_Lab
topics: ["Networking", "C", "UDP", "Visualization"]
lead:
  A reliable, TCP-like flow control protocol built from scratch over raw UDP.
image: ktp-1.png
subimages: ["ktp-2.png"]
---

TCP feels like magic until you're forced to rebuild a sliver of it yourself.
That's exactly what our Networks Lab made us do: simulate a reliable message
transmission protocol _over raw UDP_ - no TCP allowed anywhere in the stack. We
called it **KTPSocket**, short for "Kharagpur TCP Socket," and the goal was to
make an inherently unreliable channel behave like a reliable one.

## The objective

Emulate reliable end-to-end flow control over an unreliable communication
medium. Concretely, the protocol had to guarantee:

- Message integrity and correct ordering, even when packets arrive scrambled
- Acknowledgment of every received message
- Retransmission on timeout, without duplicating delivered messages
- Zero reliance on TCP - everything hand-rolled over raw UDP sockets

## Breaking it on purpose

To find out how reliable the protocol actually was, we didn't just test the
happy path - we deliberately injected packet loss at varying probabilities and
plotted how performance degraded as things got worse:

- **Loss rate (P) vs. cost:** the cost of reliable delivery grows _non-linearly_
  as P increases. Past P = 0.35, the curve stops being gentle and starts
  climbing fast.
- **ACK efficiency:** even under heavy loss, ACK traffic doesn't scale nearly as
  fast as data traffic - a decent sign the protocol design isn't wasteful.
- **Network load:** at P = 0.50, it took on average **~6 packets to deliver a
  single message successfully** - a 6x overhead just to survive a coin-flip's
  worth of packet loss.

Building a reliable channel on top of something explicitly unreliable teaches
you, viscerally, why TCP's retransmission timers and windowing schemes look the
way they do. I ended up re-tuning the retransmission logic, timers, and
loss-handling code more times than I'd like to admit before the numbers stopped
looking suspicious.

For the full picture, I also built a
[live dashboard](https://k-socket-graphs.vercel.app/) with real-time plots and
Wireshark packet captures, so the loss/retransmission behavior isn't just a
claim in a lab report - you can actually watch it happen.
