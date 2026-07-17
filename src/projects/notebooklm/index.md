---
title: NotebookLM Clone
date: 2025-08-06
repo: SumitKumar-17/NotebookLM
topics: ["Next.js", "Convex", "TypeScript", "PDF"]
lead: Chat with your PDFs - and a brutal lesson in JavaScript PDF library dependency hell.
image: notebooklm.png
---

The assignment sounded simple: build a web app where you upload a PDF and chat with it. The AI finds answers in the document and cites the exact page number - basically a clone of Google's NotebookLM. It turned into a genuinely brutal lesson in JavaScript dependency hell. The app works, and works well, but the story here isn't the feature list - it's the fight to get it deployed at all.

## The happy path

The idea: go to the site, upload a PDF, get a split-screen view - PDF on one side, chat on the other. Ask something like "what does this document say about project X?" and the AI (Gemini, under the hood) reads through the extracted text, finds the answer, and hands it back with a `[Page: 5]` button. Click it, and the PDF viewer jumps straight to that page.

That's the dream. The stack to get there was the easy part: **Next.js** (React) with TypeScript and Tailwind on the frontend, **Convex** for the database, file storage, and serverless functions, all deployed on Vercel. Then came the PDF libraries - and both halves of the problem, parsing and viewing, turned out to be minefields.

## The parser saga

Every option I tried failed in a different, more interesting way:

1. **LlamaParse** - the assignment's own suggested tool. Powerful, but webhook-based, which means your backend needs a *public URL* even for local development. That's ngrok tunnels, CORS headaches, and praying your deployed URL is exactly right. After hours fighting webhook failures, I gave up - too much ceremony for what should be a simple function call.
2. **`pdf-parse`** - a popular, simple npm library. Except it's ancient and has a bug where it tries to read its own internal test fixtures at runtime (`ENOENT: no such file or directory, open './test/data/...'`). Works perfectly on localhost, dies instantly on the server. Dead end.
3. **`pdfjs-dist`** (Mozilla's own engine) - surely the canonical choice. Except it's a "universal" library packed with browser-only rendering code. The moment I imported it on the backend, Convex's bundler tripped over `DOMMatrix is not defined` and the build died.
4. **`@opendocsg/pdf2md`** - the winner. One job: turn a PDF buffer into Markdown. No hidden browser code, no exotic dependencies, it just worked. Lesson: the most popular library isn't always the right one - sometimes the boring one that does exactly one thing wins.

## The viewer saga

The frontend should have been the easy half. It wasn't.

1. **`react-pdf`** - the default choice everyone reaches for. Getting its worker script to actually load was its own multi-day saga: the standard import broke the Next.js build (`DOMMatrix` again), switching to a CDN link caused CORS errors at runtime, and copying the worker file locally failed because the path kept shifting between versions.
2. **`@react-pdf-viewer/core`** - the eventual winner, but not without a fight. The build still failed on a hidden dependency on the `canvas` package, fixed only by adding a custom Webpack config to `next.config.js` that tells the build to pretend `canvas` doesn't exist.

## What actually stuck

- Third-party PDF libraries in the JS ecosystem are mostly old, unmaintained, or built for a pre-serverless web - not for the edge/serverless environments everyone deploys to now.
- "Universal" libraries that promise to run everywhere are a trap: they smuggle in browser-specific code that silently detonates your server build.
- `localhost` working means nothing. The build server is the only opinion that counts, and it will surface every flaw your dependencies were hiding.

If you're building something similar, hopefully this saves you a few of the four-or-five-library detours it took me to find the ones that weren't broken.
