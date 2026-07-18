---
title: DirScanner
date: 2024-05-08
repo: SumitKumar-17/DirScanner
topics: ["Go", "CLI"]
lead:
  A CLI tool that scans a directory and writes out its structure as Markdown.
image: dirscanner.png
---

I was writing up documentation for a project and wanted a clean Markdown view of
its folder structure to drop straight into a README. `tree` on Unix gets you 80%
there, but it doesn't output Markdown and isn't very customizable - so instead
of fighting `sed`/`awk` to reformat its output, I just wrote the tool I actually
wanted, in Go.

**DirScanner** scans a directory and writes its structure out as a proper
Markdown tree:

```
├── .dirignore
├── file2.txt
└── sumit
    ├── file1.txt
    └── sumit-1
        ├── kafka.txt
        └── sumit-2
            ├── file.txt
            └── sumit-3
                └── file3.txt
```

Beyond the basic tree dump, it picked up a handful of features that made it
genuinely useful instead of a toy:

- **Custom connector styles** - swap the branch characters (`+--`, `` `-- ``,
  whatever fits your doc style)
- **Exclude files/dirs** - skip `node_modules`, specific extensions, or anything
  else that clutters a real tree
- **Depth limiting** - cap how deep it recurses instead of dumping an entire
  monorepo
- **`.dirignore` support** - works exactly like `.gitignore`, so you don't have
  to pass exclude flags every time

Install it directly with:

```bash
go install github.com/SumitKumar-17/DirScanner@latest
```

and run it with:

```bash
dirscanner ./myproject tree.md --exclude ".txt" --exclude "node_modules" --depth 2
```

Small tool, but a genuinely good excuse to actually learn Go's filesystem APIs
and CLI flag parsing instead of just reading about them - and I use it often
enough on other projects that it's paid for the time it took to build.
