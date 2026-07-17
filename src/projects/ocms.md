---
title: Online Classroom Management System
date: 2024-04-08
repo: Software-Engineering-Project-Team-Bob/OCMS_Frontend
topics: ["React", "Redux", "Node.js", "MongoDB"]
lead: A full-stack platform for teachers and students to manage classes, assignments, and lectures.
image: ocms.png
subimages: ["ocms-2.png", "ocms-3.png", "ocms-4.png"]
---

For our Software Engineering course, our team built an Online Classroom Management System (OCMS) from scratch — a platform to help teachers and students manage classes, assignments, and lectures online in one place.

The system is split into two parts. The **frontend** is React.js with Redux for state management, styled quickly with Tailwind CSS to keep things responsive without writing a mountain of custom CSS. The **backend** is Node.js and Express with MongoDB, handling authentication, course data, assignment submissions, and the APIs the frontend consumes — structured around routes for users, courses, and assignments with role-based access control.

Managing global state with Redux was tricky at first, especially around async calls, and designing secure, efficient APIs took a few iterations to get right. We deployed both the [frontend](https://ocms-frontend.vercel.app/) and [backend](https://ocms-backend.vercel.app/) on Vercel — a good exercise in shipping a full-stack app end to end with modern tooling.
