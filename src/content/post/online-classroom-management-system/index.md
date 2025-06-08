---
title: "Online Classroom Management System - Full Stack Project"
description: "Building a full-stack Online Classroom Management System using React, Redux, Tailwind, Node.js, Express, and MongoDB"
publishDate: "8 April 2024"
draft: false
tags: ["full-stack", "React", "Redux", "Tailwind", "Node.js", "Express", "MongoDB"]
---

## Online Classroom Management System (OCMS) - Group Project
(Source Code: [Frontend Repo](https://github.com/Software-Engineering-Project-Team-Bob/OCMS_Frontend), [Backend Repo](https://github.com/Software-Engineering-Project-Team-Bob/OCMS_Backend))

For our Software Engineering course, our team developed an Online Classroom Management System (OCMS) from scratch. The goal was to create a platform that helps teachers and students manage classes, assignments, and lectures all online in a seamless way.

## About the Project
The system is divided into two parts — the frontend and the backend.

The **frontend** is built with React.js and Redux for state management. We used Tailwind CSS to style the app quickly and make it responsive.

The **backend** uses Node.js and Express.js with MongoDB as the database. It handles authentication, course data, assignment submissions, and APIs that the frontend consumes.

## Implementation Details
On the frontend, React components manage the UI and Redux handles global states like user info and courses. Tailwind made styling fast without writing lots of CSS.

The backend exposes REST APIs using Express and connects to MongoDB for storing data. We structured routes for users, courses, and assignments with proper authentication and role-based access control.


## Demo

Here's a screen shot.

<img width="100%" src="/ocms/frontend.png"/>

<img width="100%" src="/ocms/frontend-2.png"/>

<img width="100%" src="/ocms/frontend-3.png"/>

<img width="100%" src="/ocms/frontend-4.png"/>

## Challenges and Learnings
Managing global state with Redux was tricky at first, especially handling async calls. Designing secure and efficient APIs took some iterations.

Tailwind CSS sped up frontend development a lot compared to traditional CSS.

We also learned how to deploy both frontend and backend on Vercel for easy hosting.

## Conclusion
Building OCMS was a great experience combining frontend and backend tech. It gave me a better understanding of full-stack development using modern tools and workflows.

You can check out the live projects here:  
- Frontend: https://ocms-frontend.vercel.app/  
- Backend: https://ocms-backend.vercel.app/  
- Presentation: https://software-engineering-presentation-project.vercel.app/

---
