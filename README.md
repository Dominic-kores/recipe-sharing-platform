# 🍲 Karibu Recipes — Recipe Sharing Platform

### A Full-Stack Recipe Management & Sharing Application

A database-driven recipe sharing platform built with **Node.js, Express.js, PostgreSQL, Prisma ORM, React, Vite, and Tailwind CSS**.

Karibu Recipes celebrates Kenyan cuisine while allowing users to explore recipes from different cultures. The application provides RESTful APIs for recipe management, database relationships, recipe searching, filtering, and pagination.

---

##  Project Overview

Karibu Recipes is a full-stack web application developed as part of the **Week 6 Database & Prisma ORM Project**.

The project demonstrates how to design relational databases, establish relationships using Prisma, populate a PostgreSQL database with realistic data, and perform CRUD operations through an Express REST API.

Users can explore traditional Kenyan dishes such as Nyama Choma, Ugali & Sukuma Wiki, Pilau, Chapati, Mandazi, Githeri, and Mukimo, alongside international recipes.

The optional React frontend provides a responsive interface for browsing recipes, searching by title, filtering by category, and viewing ingredients and cooking instructions.

## Project Objectives

- Design and implement relational database models using Prisma ORM.
- Establish one-to-many relationships between users and recipes.
- Connect a Node.js and Express application to PostgreSQL.
- Seed the database with realistic Kenyan and international recipes.
- Implement RESTful API endpoints supporting CRUD operations.
- Retrieve related records using Prisma's `include` functionality.
- Implement recipe searching, category filtering, difficulty filtering, and pagination.
- Validate API requests and handle errors appropriately.
- Connect a React frontend to an Express backend.
- Prepare the application for deployment using Railway and Vercel.

##  Key Features

### Core Features

**User Management**
- Register users with names, email addresses, and optional biographies.
- Retrieve registered users with recipe counts.
- View an individual user's profile and published recipes.

**Recipe Management**
- Create, retrieve, update, and delete recipes.
- Associate every recipe with its author.
- Store ingredients as JSON objects containing `name`, `amount`, and `unit`.
- Store cooking instructions as JSON arrays.
- Track preparation time, cooking time, servings, category, and difficulty.

**Search and Filtering**
- Search recipes by title.
- Filter recipes by cuisine category.
- Filter by difficulty: easy, medium, or hard.
- Filter by maximum cooking time.
- Navigate through paginated recipe results.

**Database Seeding**
- Three sample users with Kenyan names.
- Fifteen recipes across six categories.
- Seven required Kenyan dishes.
- Realistic cooking ingredients and preparation instructions.

### Additional Features

- Ingredient-based recipe search.
- Recipe favorites management.
- Recipe ratings from 1 to 5 stars.
- Average recipe rating calculation.
- Platform statistics, including recipe totals and category distribution.
- Responsive React interface using Tailwind CSS.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend JavaScript runtime |
| Express.js | REST API development |
| PostgreSQL | Relational database |
| Prisma ORM | Database modeling, migrations, and queries |
| Supabase | Cloud PostgreSQL hosting |
| JavaScript | Application logic |
| Zod | Request data validation |
| CORS | Frontend-backend communication |
| React.js | Frontend development |
| Vite | React development and build tooling |
| Tailwind CSS | Responsive UI styling |
| Thunder Client | API endpoint testing |
| Git & GitHub | Version control |
| Railway | Backend deployment |
| Vercel | Frontend deployment |

---

## Project Structure

```text
recipe-sharing-platform/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├
│
├── .gitignore
└── README.md
```

---

## Database Design

The application uses PostgreSQL with Prisma ORM to manage relational data.

### User Model

Stores user profiles and their associated recipes.

**Main Fields:**
- `id` — Primary key
- `name` — User's name
- `email` — Unique email address
- `bio` — Optional biography
- `createdAt` — Creation timestamp
- `updatedAt` — Last update timestamp
- `recipes` — One-to-many relationship with Recipe

### Recipe Model

Stores recipe information and links every recipe to an author.

**Main Fields:**
- `id` — Primary key
- `title` — Recipe name
- `description` — Optional description
- `prepTime` — Preparation time in minutes
- `cookTime` — Cooking time in minutes
- `servings` — Number of servings
- `difficulty` — Easy, medium, or hard
- `category` — Cuisine category
- `ingredients` — JSON array of ingredient objects
- `steps` — JSON array of cooking instructions
- `imageUrl` — Optional image URL
- `authorId` — Foreign key referencing User

### Database Relationships

**User → Recipe (One-to-Many)**

One user can create multiple recipes, but each recipe belongs to one author.

Optional models support:
- **Favorite:** Users saving recipes.
- **Rating:** Users assigning ratings to recipes.

Prisma's `@relation`, `@unique`, and `@@unique` constraints help maintain relational integrity.

---

## Seeded Recipe Categories

| Category | Example Recipes |
|---|---|
| Kenyan | Nyama Choma, Pilau, Chapati, Mukimo |
| Italian | Spaghetti Bolognese, Margherita Pizza |
| Indian | Chicken Curry, Butter Chicken |
| Chinese | Chinese Fried Rice |
| Mexican | Chicken Tacos |
| Desserts | Chocolate Brownies, Banana Pancakes |

The database includes seven traditional Kenyan recipes with the preparation and cooking times specified in the assignment.

---

## Installation and Setup

### Prerequisites

Ensure you have installed:

- Node.js (version 20 or later)
- npm
- Git
- VS Code
- A PostgreSQL database, such as Supabase

### 1. Clone the Repository

```bash
git clone https://github.com/Dominic-kores/recipe-sharing-platform

cd recipe-sharing-platform
```


### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply Database Migrations

For a new local database:

```bash
npx prisma migrate dev
```

This applies the database migrations and creates the required tables.

### 6. Seed the Database

```bash
npx prisma db seed
```

The seed script populates the database with three users and fifteen recipes.

### 7. Open Prisma Studio

```bash
npx prisma studio
```

Prisma Studio provides a graphical interface for inspecting users, recipes, and their relationships.

### 8. Start the Backend Server

```bash
npm run dev
```

Backend URL:

`http://localhost:5001`

Recipe API:

`http://localhost:5001/api/recipes`

### 9. Install and Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start React:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`


---

## REST API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Register a new user |
| GET | `/api/users` | Retrieve all users with recipe counts |
| GET | `/api/users/:id` | Retrieve one user and their recipes |

### Recipe Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/recipes` | Create a new recipe |
| GET | `/api/recipes` | Retrieve recipes |
| GET | `/api/recipes/:id` | Retrieve one recipe |
| PUT | `/api/recipes/:id` | Update recipe information |
| DELETE | `/api/recipes/:id` | Delete a recipe |
| GET | `/api/categories` | Retrieve recipe categories and counts |


---

## API Testing

API endpoints can be tested using Thunder Client or Postman.

### Example: Create a Recipe

**Method:** `POST`

**Endpoint:** `/api/recipes`

**Request Body:**

```json
{
  "title": "Kenyan Kachumbari",
  "description": "Fresh Kenyan tomato and onion salad",
  "prepTime": 10,
  "cookTime": 0,
  "servings": 4,
  "difficulty": "easy",
  "category": "Kenyan",
  "ingredients": [
    {
      "name": "tomatoes",
      "amount": "3",
      "unit": "whole"
    },
    {
      "name": "onions",
      "amount": "2",
      "unit": "whole"
    }
  ],
  "steps": [
    "Wash and chop tomatoes.",
    "Slice onions thinly.",
    "Combine the ingredients.",
    "Serve fresh."
  ],
  "authorId": 1
}
```

A successful request should return HTTP `201 Created`, provided the author exists.

### Expected API Status Codes

| Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 204 | Resource deleted |
| 400 | Invalid request |
| 404 | Resource not found |
| 409 | Duplicate unique value |
| 500 | Internal server error |

---

## Deployment

### Backend — Railway

1. Push the project to GitHub.
2. Create a Railway project.
3. Connect the GitHub repository.
4. Set the service root directory to `backend`.
5. Add the PostgreSQL environment variables.
6. Generate Prisma Client and apply production migrations.
7. Deploy and test the public API.

**Backend URL:** [https://recipe-sharing-platform-production.up.railway.app/api]

### Frontend — Vercel

1. Import the same GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Configure the Vite build settings.
4. Add `VITE_API_BASE_URL` pointing to the Railway API.
5. Deploy the application.

**Frontend URL:** [https://recipe-sharing-platform-kedroaxpo-dkisioya-7099.vercel.app/]


---

## Author

**Dominic Kores Kisioya**

Full-Stack Software & AI Engineer

