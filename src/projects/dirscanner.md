---
title: DirScanner
date: 2024-05-08
repo: SumitKumar-17/DirScanner
topics: ["Go", "CLI"]
lead: A CLI tool that scans a directory and writes out its structure as Markdown.
image: dirscanner.png
image_border: true
---

A small CLI tool I wrote in Go — it scans any directory and writes out a nice directory tree in Markdown format. I use it to generate structure docs for projects I work on.

I was documenting a project and wanted a clean Markdown view of its folder structure. You can do this with `tree` on Unix, but it doesn't generate proper Markdown and isn't very customizable, so I built my own: custom connector styles for how the tree branches look, the ability to exclude files or directories (like `node_modules`), depth limiting so you don't scan the whole tree, and `.dirignore` support that works just like `.gitignore`.

Install with `go install github.com/SumitKumar-17/DirScanner@latest`, then run `dirscanner <directory> <output-file>` to get a Markdown tree of any folder. Fun one to write in Go — learned a lot about filesystem traversal and CLI flag parsing along the way.
