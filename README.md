
# Karibu Recipes — Recipe Sharing Platform

## Project Overview

Karibu Recipes is a full-stack recipe sharing platform built
with Node.js, Express, Prisma ORM and PostgreSQL.

The application allows users to create, browse, search, update
and delete recipes. It includes Kenyan and international dishes.

## Project Objectives

- Design relational database models using Prisma.
- Connect Node.js to PostgreSQL.
- Implement one-to-many relationships.
- Seed the database with realistic sample records.
- Develop RESTful API endpoints.
- Implement recipe search, filtering and pagination.
- Deploy the backend to Railway.
- Build an optional React frontend.

## Technologies Used

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Supabase
- Zod

### Frontend
- React
- Vite
- Tailwind CSS

### Deployment
- GitHub
- Railway
- Vercel

## Installation

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Before running, configure the environment variables in
the backend and frontend folders.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users | Create a user |
| GET | /api/users | List users |
| GET | /api/users/:id | User details |
| POST | /api/recipes | Create a recipe |
| GET | /api/recipes | List recipes |
| GET | /api/recipes/:id | Recipe details |
| PUT | /api/recipes/:id | Update recipe |
| DELETE | /api/recipes/:id | Delete recipe |
| GET | /api/categories | List categories |
| GET | /api/stats | Platform statistics |

## Database Seeding

The application includes:
- 3 users with Kenyan names.
- 15 recipes across 6 categories.
- 7 required Kenyan dishes.
- Ingredients stored as JSON objects.
- Instructions stored as JSON arrays.

## Deployment Links

**Backend:** Add Railway URL here.

**Frontend:** Add Vercel URL here.

**GitHub:** Add repository URL here.




## Author

**Dominic Kores Kisioya**

Full-Stack Software & AI Engineer
