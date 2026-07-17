---
title: NotebookLM Clone
date: 2025-08-06
repo: SumitKumar-17/NotebookLM
topics: ["Next.js", "Convex", "TypeScript", "PDF"]
lead: Chat with your PDFs — and a brutal lesson in JavaScript PDF library dependency hell.
image: notebooklm.png
---

An assignment to build a web app where you upload a PDF and chat with it — the AI finds answers in the document and cites the page number, basically a clone of Google's NotebookLM — turned into a war against PDF libraries, build tools, and server-side rendering.

The stack was the easy part: **Next.js** (React) with TypeScript and Tailwind on the frontend, **Convex** for the database, file storage, and serverless functions, deployed on Vercel. Then came the PDF libraries.

To build the app you need two things: a library to rip text out of a PDF for the AI to read, and a library to actually display the PDF in the browser. Both turned out to be minefields.

**The parser saga.** LlamaParse relies on webhooks, which means your backend needs a public URL even for local dev — ngrok tunnels, CORS issues, too much complexity for a simple task. `pdf-parse` is ancient and tries to read its own internal test fixtures at runtime, so it works locally and breaks on deploy. `pdfjs-dist` is a "universal" library that bundles browser-only code (`DOMMatrix is not defined`) which crashed the Convex bundler. The winner was `@opendocsg/pdf2md` — a small library with one job: turn a PDF buffer into Markdown, no weird dependencies.

**The viewer saga.** `react-pdf`'s worker script loading was a nightmare across CDN links, CORS, and shifting file paths between versions. `@react-pdf-viewer/core` won out, but still needed a custom Webpack config in `next.config.js` to tell the build to pretend the `canvas` package doesn't exist.

Lesson learned: third-party PDF libraries in the JS ecosystem are mostly old, unmaintained, or built for a pre-serverless era. "Universal" libraries that claim to work everywhere often smuggle in browser-specific code that crashes a server build — and deployment errors are the only errors that really count, since `localhost` working means nothing until the build server agrees.
