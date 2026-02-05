# ReviewIt

ReviewIt is a full-stack web application that allows users to review, rate, comment on, and discuss **anything** across flexible categories — including products, books, media, ideas, and experiences.

The platform is designed to encourage open discussion, structured feedback, and community interaction while maintaining secure authentication and scalable architecture.

---

## 🚀 Features

- User authentication & authorisation (JWT)
- Create and manage categories
- Add items under any category
- Write reviews with ratings
- Comment on reviews
- Upvote/downvote reviews
- Sort reviews (latest, highest rated, most popular)
- Role-based access (User / Admin)
- Secure RESTful API
- Cloud-ready architecture

---

## 🏗️ Tech Stack

### Backend
- **C#**
- **ASP.NET Core Web API**
- **Entity Framework Core**
- **JWT Authentication**

### Database
- **PostgreSQL**

### Frontend
- React

### DevOps / Cloud (planned)
- Docker
- AWS / Azure deployment
- CI/CD pipeline

---

## 🧠 System Architecture

React
↓
ASP.NET Core Web API
↓
Entity Framework Core
↓
PostgreSQL Database

---

## 🗄️ Database Design

The system uses a relational database to ensure data integrity and scalability.  
See the database schema section below for full details.

---

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing
- Role-based authorisation
- Token validation middleware
