---
title: Animated Maze Solver
date: 2025-08-11
repo: SumitKumar-17/maze
topics: ["Python", "Matplotlib", "Algorithms"]
lead: Visualizing maze generation and solving algorithms as a particle-system animation.
---

I set out to create a Python script that would visualize maze generation and solving algorithms as a clean, animated video. The final script produces a high-quality MP4: it first shows **Wilson's algorithm** carving out the maze with orange particles, then visualizes **Dijkstra's algorithm** flooding the paths with cyan particles to find the solution, finally highlighted with a bright red line.

The main challenge was using a data-plotting library for a complex animation. The whole thing is generated frame-by-frame with `matplotlib` — hundreds of individual frames. To keep it smooth, I gave each particle a limited lifetime so it would disappear after a short time, preventing the script from slowing down as more particles piled up.

To make the visualization dynamic, I built a small particle system with different effects like trails and glowing pulses, and used Python's `colorsys` library to create smooth color gradients representing the algorithm's progress (e.g. distance explored from the start point).

Biggest takeaway: `matplotlib` is a lot more versatile than I gave it credit for — I only knew it as a charting library until this project. Good visual effects mostly come from carefully tuning a lot of small parameters, and performance planning matters a great deal once you're generating hundreds of video frames.
