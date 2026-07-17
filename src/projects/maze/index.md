---
title: Animated Maze Solver
date: 2025-08-11
repo: SumitKumar-17/maze
topics: ["Python", "Matplotlib", "Algorithms"]
lead:
  Visualizing maze generation and solving algorithms as a particle-system
  animation.
---

Most people's first (and only) encounter with `matplotlib` is a line chart in a
Jupyter notebook. I wanted to see how far it could actually be pushed, so I set
out to turn maze generation and pathfinding into a proper animated video, not
just a static plot.

The final script renders a high-quality MP4 in two acts: first, **Wilson's
algorithm** carves the maze out of raw grid space, one loop-erased random walk
at a time, visualized as a swarm of orange particles eating through walls. Then
**Dijkstra's algorithm** floods outward from the start in cyan, searching for
the exit, before the final path lights up in a single bright red line.

## Making a plotting library do things it wasn't built for

The whole animation is generated frame-by-frame - hundreds of individual
`matplotlib` frames stitched into video. That alone creates a performance
problem: naively, every particle you've ever drawn stays on screen and in memory
forever, and the render grinds to a halt. The fix was giving each particle a
limited **lifetime**, so it fades out and gets garbage-collected after a short
window instead of accumulating indefinitely.

To make the visualization actually feel alive rather than just correct, I built
a small particle system on top with trail effects and glowing pulses, and used
Python's `colorsys` module to generate smooth color gradients that track the
algorithm's progress - e.g., particles shift color based on distance explored
from the start point, so you can _see_ the search frontier expanding in real
time.

## What I actually learned

- `matplotlib` is a far more capable rendering engine than its reputation as
  "the charting library" suggests.
- Good visual effects are rarely one big idea - they're a lot of small
  parameters (particle lifetime, fade curves, color gradients) tuned until it
  _feels_ right.
- Once you're generating hundreds of video frames, performance planning stops
  being optional and becomes the main design constraint.
