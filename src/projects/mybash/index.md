---
title: mybash
date: 2026-04-27
repo: SumitKumar-17/mybash
topics: ["Python", "CLI", "TUI"]
lead:
  A feature-rich interactive shell in Python with a built-in file browser,
  image/video viewer, and process manager.
---

I wanted a shell that didn't make me leave the terminal to browse files, look at
an image, watch a video, or check on a runaway process — so I built one.
**mybash** is a full interactive shell written in Python, with real
bash-compatible parsing (pipelines, redirections, command substitution,
globbing, here-docs, background jobs) underneath a set of built-in TUI
applications that all run inline, in any terminal.

The TUI apps aren't gimmicks — they're the actual point:

- **`fb`** — a ranger-style 3-pane file browser with vim-style keybindings,
  bookmarks, and copy/cut/paste
- **`iv`** — an image viewer that renders through Kitty's image protocol, Sixel,
  `chafa`, or falls back to ASCII art depending on what your terminal supports
- **`vp`** — a video player that suspends the TUI and hands off to
  `mpv`/`ffplay`, with a real playlist, loop, and shuffle
- **`pm`** — an htop-style process manager (sort by CPU/MEM/PID, kill or renice
  from the UI)
- **`gv`** — a git log/diff/status viewer with commit search and stage/unstage
  from the status view
- **`ed`** — a text editor with syntax highlighting, multi-tab support, and
  find/replace

On top of that: 51 built-in shell commands, tab completion that's aware of git
subcommands and common CLI flags, a smart prompt that turns red on failure and
shows elapsed time for slow commands, persistent aliases and history, and an
actual plugin system — drop a Python file subclassing `CommandPlugin` into
`~/.mybash/plugins/` and it's live on next launch. Five built-in themes
(Dracula-inspired default, Nord, Monokai, Solarized, Gruvbox), each just a TOML
file, so adding your own is copy-paste-and-edit rather than writing code.

It's `uv`-packaged (`uv pip install -e ".[dev]"`), has an actual test suite
(`pytest`), and ships a standalone launcher script so it can be bound to a
`.desktop` file and opened like any other application rather than requiring you
to already be in a terminal.
