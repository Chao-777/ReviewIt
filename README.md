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

---

## 🏃 Getting Started

### Prerequisites

- **.NET 8 SDK**
- **Node.js 18+** and npm
- **PostgreSQL** (create a database named `ReviewIt`)

### 1. Backend (API)

```bash
cd ReviewIt/backend
```

Update `appsettings.Development.json` or `appsettings.json` with your PostgreSQL connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=ReviewIt;Username=YOUR_USER;Password=YOUR_PASSWORD"
}
```

Then run:

```bash
dotnet run
```

The API will start at **http://localhost:5000**. In Development it creates the database schema automatically and seeds categories + a demo user (`demo@reviewit.com` / `Demo123!`).

### 2. Frontend (React)

```bash
cd ReviewIt/frontend
npm install
npm run dev
```

The app will be at **http://localhost:5173** and will proxy `/api` to the backend.

### 3. Try it

- Open http://localhost:5173
- **Sign up** or log in as `demo@reviewit.com` / `Demo123!`
- Browse categories, open an item, write a review (0–5 stars), comment, and thumb up/down. Create new items from the header when logged in.
