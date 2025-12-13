# Digital Mood Co-Worker  
**Full-Stack Capstone Project**

Digital Mood Co-Worker is a full-stack web application that allows users to track daily moods, reflect through journaling, and visualize emotional trends over time. The application includes secure authentication (email/password and Google OAuth), personalized dashboards, and interactive data visualizations.

This project was developed as an **individual full-stack capstone project** and demonstrates modern software engineering practices using React, Express, MongoDB, OAuth, and cloud deployment.

---

## 🔗 Live Links

- **Frontend (React):**  
  _Add deployed frontend URL_

- **Backend (Express API):**  
  _Add deployed backend URL_

- **Video Demo:**  
  _Add demo video link_

---

## ✨ Features

- Secure authentication:
  - Email & password login
  - Google OAuth login
- Personalized user dashboard after login
- Mood tracking using a 0–10 scale
- Journal notes attached to mood entries
- Interactive mood visualization chart
- Motivational quote displayed dynamically
- Responsive UI with animations and visual feedback

---

## 🧠 Architecture Overview

### Frontend
- React (Vite)
- Context API + `useReducer`
- Google OAuth (`@react-oauth/google`)
- Third-party charting library
- Tailwind CSS + custom animations

### Backend
- Express.js
- MongoDB with Mongoose
- JWT-based authentication
- Google OAuth token verification
- RESTful API with full CRUD functionality

---

## 🔄 Design Artifact (Sequence Diagram)

```mermaid
sequenceDiagram
  participant U as User
  participant R as React App
  participant E as Express API
  participant M as MongoDB
  participant Q as External Quote API

  U->>R: Login (Email or Google)
  R->>E: POST /api/auth/*
  E->>R: JWT Token
  R->>E: GET /api/entries
  E->>M: Fetch user entries
  M->>E: Entries data
  E->>R: JSON entries
  R->>E: Request quote
  E->>Q: Fetch quote
  Q->>E: Quote
  E->>R: Display quote
