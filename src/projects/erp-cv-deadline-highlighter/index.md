---
title: ERP CV Deadline Highlighter
date: 2025-11-27
repo: SumitKumar-17/erp-cv-deadline-highlighter
topics: ["Chrome Extension", "JavaScript"]
lead:
  A Chrome extension that highlights CV and placement deadlines in IIT
  Kharagpur's ERP portal.
image: image.png
---

IIT Kharagpur's ERP placement portal buries CV submission deadlines in dense
tables that are very easy to miss at a glance during placement season, when
there are a dozen things due across different companies at once. This extension
fixes that with color-coded visual highlighting directly on the portal page — no
more scanning a wall of text to figure out what's due today versus next week.

It's a plain Manifest V3 Chrome extension — `content.js` injects the
highlighting logic directly into the ERP page, `background.js` handles the
extension lifecycle, and a small popup (`popup.html`/`popup.js`) gives quick
access to settings — installed as an unpacked extension via Developer Mode
rather than through the Chrome Web Store, since that requires a developer
account fee I haven't set up yet. It also works fine in Brave and Edge through
the same "load unpacked" flow, since they're all Chromium under the hood.

Small, single-purpose tool: one page it targets, one problem it solves, and it's
been genuinely useful every placement cycle since.
