---
title: "DirScanner - Directory Tree Generator CLI in Go"
description: "A simple and customizable CLI tool to scan and visualize directory structure as Markdown"
publishDate: "8 May 2024"
draft: false
tags: ["golang", "cli", "markdown", "filesystem", "open-source", "tools"]
---

## DirScanner - A CLI Tool to Markdown Your Directory  
(Source Code: [DirScanner](https://github.com/SumitKumar-17/DirScanner))

This is a small CLI project I wrote in Go — basically a tool that scans any directory and writes out a nice directory tree in Markdown format. It's called **DirScanner**, and I use it to generate structure docs for projects I work on.

## Why I Made It
I was documenting a project and wanted a clean Markdown view of its folder structure. Of course, you can use `tree` on Unix, but it doesn’t generate proper Markdown and isn't customizable. So I thought — why not make one myself?

## What It Does
It scans a directory and prints out its structure (with folders/files) in a readable format into a Markdown file. Some features I added:

- **Custom Connector Styles**: You can change how the tree branches look — like using `+--` or `|__`, etc.
- **Exclude Files/Dirs**: You can skip certain extensions or folders like `node_modules`, `.txt`, etc.
- **Limit Depth**: If you don’t want to scan the whole tree, you can restrict how deep it goes.
- **.dirignore Support**: You can keep a `.dirignore` file just like `.gitignore` and it will follow that too.

## Demo

Here's a screen shot of it.

<img width="100%" src="/dirscanner/image.png"/>

## Installation

You can install it directly using:

```bash
go install github.com/SumitKumar-17/DirScanner@latest
````

## Basic Usage

To scan a directory and generate a Markdown file with its structure:

```bash
dirscanner <directory> <output-file>
```

For example:

```bash
dirscanner ./myproject tree.md
```

This will create a `tree.md` file with the structure of the `myproject` directory.

## Example Output
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

## Excluding Stuff

If you want to skip certain types of files or folders, just use the `--exclude` flag:

```bash
dirscanner ./dir tree.md --exclude ".txt" --exclude "node_modules"
```

You can also create a `.dirignore` file in the root of the directory, and the tool will automatically respect it.

## Limiting Depth

To avoid scanning too deep into the folder hierarchy, you can limit the depth using the `--depth` flag:

```bash
dirscanner ./dir tree.md --depth 2
```

This will only go 2 levels deep in the folder tree.

## Custom Tree Symbols

You can customize the visual style of the tree using different connector symbols:

```bash
dirscanner ./dir tree.md --intermediate "+-- " --last "`-- " --prefix "    " --branch "|   "
```

This helps you get exactly the look you want in the Markdown output.

## Contribution

Contributions are welcome! Feel free to open issues or pull requests on GitHub if you want to fix something or suggest improvements. I’d love to see others use or extend this.

---

Was fun writing this one in Go — learned a lot about file system traversal and CLI flag parsing. Looking forward to building more tools like this.

