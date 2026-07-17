---
title: Online Classroom Management System
date: 2024-04-08
repo: Software-Engineering-Project-Team-Bob/OCMS_Frontend
topics: ["React", "Redux", "Node.js", "MongoDB"]
lead: A full-stack platform for teachers and students to manage classes, assignments, and lectures.
image: ocms.png
subimages: ["ocms-2.png", "ocms-3.png", "ocms-4.png"]
---

For our Software Engineering course, our team built the **Online Classroom Management System (OCMS)** from a blank repo - a platform where teachers and students manage classes, assignments, and lectures without juggling five different tools to do it.

The system splits cleanly into two halves. The **frontend** is React with Redux for global state, styled with Tailwind to move fast without hand-writing a wall of CSS. The **backend** is Node.js and Express backed by MongoDB, handling authentication, course data, and assignment submissions through REST routes scoped around users, courses, and assignments - with role-based access control so a student and a teacher genuinely see different things.

## Where the actual friction was

Redux's global state was the first real wall - specifically getting async calls (fetching a course, submitting an assignment, refreshing after an edit) to update state predictably instead of racing each other. On the backend, designing APIs that were both secure *and* efficient took several passes; the first version was neither.

Tailwind, by contrast, was a genuine speed multiplier - styling a full multi-role UI without drowning in custom CSS files freed up time to spend on the state-management and API problems that actually mattered.

We shipped both halves on Vercel - [frontend](https://ocms-frontend.vercel.app/) and [backend](https://ocms-backend.vercel.app/) - which turned out to be as much a lesson in deployment plumbing as in the application code itself. Between the role-based access model, the async state headaches, and shipping two separately-deployed services that had to agree with each other, this was less "a CRUD app" and more a real dry run of how full-stack teams actually ship software.
