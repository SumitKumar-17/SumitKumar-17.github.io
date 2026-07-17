---
title: Conversational AI Platform for Employee Welfare
date: 2025-03-01
topics: ["FastAPI", "LangChain", "LLMs"]
lead: An AI-driven system to monitor employee well-being through behavioral signals and automated insights.
---

Most "employee well-being" tools amount to an annual survey nobody fills out honestly. This project took a different angle: an AI-driven system that infers well-being continuously from behavioral signals instead of asking people to self-report on a schedule, and surfaces insights automatically instead of burying them in a dashboard nobody opens.

## How it actually works

Data from **1,000+ users** flows through a multi-stage pipeline built on **FastAPI**, orchestrated by scheduled **CRON jobs** that continuously recompute behavioral metrics rather than running as a one-off batch job. On top of that:

- **Risk scoring:** high-risk users are flagged using **EMA-weighted scores** (exponential moving averages, so a single bad day doesn't dominate the signal) combined with **ensemble models**, which together improved flagging accuracy by **42%** over a naive threshold-based approach.
- **Conversational layer:** an LLM-powered chatbot, orchestrated through **LangChain** pipelines, generates context-aware summaries and check-ins rather than generic ones - the system actually reasons about *why* a user's signals shifted before it says anything to them.

The interesting engineering problem here wasn't the LLM calls themselves - it was making the pipeline trustworthy enough that "AI flagged this person as at-risk" is a claim worth acting on, not just a number that looks impressive in a demo.
