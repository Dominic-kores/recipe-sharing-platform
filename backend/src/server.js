
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PrismaClient, Prisma } from "@prisma/client";
import { z, ZodError } from "zod";

// Initialize Express and Prisma.
const app = express();
const prisma = new PrismaClient();

// Configure Express middleware.
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));

// Allow requests from the React application.
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}));

// Wrap asynchronous routes so errors reach the error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create an HTTP error with an appropriate status.
function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

// Validate an ID provided in the URL.
function parseId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw httpError(400, "ID must be a positive integer");
  }

  return id;
}

// Allowed recipe categories.
const categories = [
  "Kenyan",
  "Italian",
  "Indian",
  "Chinese",
  "Mexican",
  "Desserts",
];

// Validate ingredient objects.
const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  unit: z.string().trim().min(1),
}).strict();

// Validate the data for creating a user.
const userSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  bio: z.string().optional().nullable(),
}).strict();

// Validate recipe data.
const recipeFields = {
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  prepTime: z.number().int().min(0),
  cookTime: z.number().int().min(0),
  servings: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.enum(categories),

  // JSON values stored in PostgreSQL.
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(z.string().trim().min(1)).min(1),

  imageUrl: z.string().url().optional().nullable(),
  authorId: z.number().int().positive(),
};

const createRecipeSchema = z.object(recipeFields).strict();

// Allow partial updates, but reject empty objects.
const updateRecipeSchema = createRecipeSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Include author and rating information with recipes.

// Include the recipe author's details.
// Ratings can be added later as an optional feature.
const recipeInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

// Format recipe data without relying on a Rating model.
function withAverageRating(recipe) {
  return {
    ...recipe,
    averageRating: null,
    ratingCount: 0,
  };
}

// ======================================================
// HEALTH AND HOME ROUTES
// ======================================================

// GET / - API information.
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Karibu Recipes API",
    endpoints: {
      recipes: "/api/recipes",
      users: "/api/users",
      categories: "/api/categories",
      stats: "/api/stats",
    },
  });
});

// GET /api/health - Basic server health check.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ======================================================
// USER ENDPOINTS
// ======================================================

// POST /api/users
// Register a new user.
app.post("/api/users", asyncHandler(async (req, res) => {
  const data = userSchema.parse(req.body);

  const user = await prisma.user.create({
    data,
  });

  res.status(201).json(user);
}));

// GET /api/users
// Retrieve all users with their recipe counts.
app.get("/api/users", asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          recipes: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const result = users.map(({ _count, ...user }) => ({
    ...user,
    recipeCount: _count.recipes,
  }));

  res.json(result);
}));

// GET /api/users/:id
// Retrieve one user and all their recipes.
app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      recipes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  res.json(user);
}));

// ======================================================
// RECIPE CRUD ENDPOINTS
// ======================================================

// POST /api/recipes
// Create a recipe connected to an existing author.
app.post("/api/recipes", asyncHandler(async (req, res) => {
  const data = createRecipeSchema.parse(req.body);

  // Confirm the author exists.
  const author = await prisma.user.findUnique({
    where: { id: data.authorId },
  });

  if (!author) {
    throw httpError(404, "Author not found");
  }

  const recipe = await prisma.recipe.create({
    data,
    include: recipeInclude,
  });

  res.status(201).json(withAverageRating(recipe));
}));

// GET /api/recipes
// Search, filter and paginate recipes.
app.get("/api/recipes", asyncHandler(async (req, res) => {
  const querySchema = z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    maxCookTime: z.coerce.number().int().min(0).optional(),

    // Optional ingredient-based search.
    ingredient: z.string().trim().min(1).optional(),

    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  });

  const query = querySchema.parse(req.query);

  // Prisma WHERE conditions are constructed dynamically.
  const where = {};

  // Filter by cuisine category.
  if (query.category) {
    where.category = {
      equals: query.category,
      mode: "insensitive",
    };
  }

  // Case-insensitive recipe title search.
  if (query.search) {
    where.title = {
      contains: query.search,
      mode: "insensitive",
    };
  }

  // Filter by difficulty.
  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  // Find recipes taking no more than the supplied cook time.
  if (query.maxCookTime !== undefined) {
    where.cookTime = {
      lte: query.maxCookTime,
    };
  }

  // Optional stretch: search ingredient names in JSON.
  if (query.ingredient) {
    // Parameterized SQL prevents SQL injection.
    const matches = await prisma.$queryRaw`
      SELECT id FROM "Recipe"
      WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(ingredients) AS item
        WHERE item->>'name' ILIKE ${"%" + query.ingredient + "%"}
      )
    `;

    where.id = {
      in: matches.map((row) => row.id),
    };
  }

  // Calculate pagination offset.
  const skip = (query.page - 1) * query.limit;

  // Fetch record count and matching recipes.
  const [total, recipes] = await prisma.$transaction([
    prisma.recipe.count({
      where,
    }),

    prisma.recipe.findMany({
      where,
      include: recipeInclude,
      orderBy: {
        id: "asc",
      },
      skip,
      take: query.limit,
    }),
  ]);

  res.json({
    recipes: recipes.map(withAverageRating),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}));

// GET /api/recipes/:id
// Retrieve one recipe, including author details.
app.get("/api/recipes/:id", asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: recipeInclude,
  });

  if (!recipe) {
    throw httpError(404, "Recipe not found");
  }

  res.json(withAverageRating(recipe));
}));

// PUT /api/recipes/:id
// Update one or more recipe fields.
app.put("/api/recipes/:id", asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const data = updateRecipeSchema.parse(req.body);

  // Validate author ID if the author is being changed.
  if (data.authorId) {
    const author = await prisma.user.findUnique({
      where: {
        id: data.authorId,
      },
    });

    if (!author) {
      throw httpError(404, "Author not found");
    }
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data,
    include: recipeInclude,
  });

  res.json(withAverageRating(recipe));
}));

// DELETE /api/recipes/:id
// Remove a recipe and its dependent favorites and ratings.
app.delete("/api/recipes/:id", asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await prisma.recipe.delete({
    where: { id },
  });

  res.status(204).send();
}));

// GET /api/categories
// Group recipes by category using Prisma groupBy.
app.get("/api/categories", asyncHandler(async (req, res) => {
  const grouped = await prisma.recipe.groupBy({
    by: ["category"],
    _count: {
      _all: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  res.json(
    grouped.map((item) => ({
      category: item.category,
      count: item._count._all,
    }))
  );
}));

// ======================================================
// OPTIONAL STRETCH: FAVORITES
// ======================================================

// POST /api/users/:id/favorites
app.post("/api/users/:id/favorites", asyncHandler(async (req, res) => {
  const userId = parseId(req.params.id);

  const body = z.object({
    recipeId: z.number().int().positive(),
  }).strict().parse(req.body);

  const favorite = await prisma.favorite.create({
    data: {
      userId,
      recipeId: body.recipeId,
    },
  });

  res.status(201).json(favorite);
}));

// GET /api/users/:id/favorites
app.get("/api/users/:id/favorites", asyncHandler(async (req, res) => {
  const userId = parseId(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      recipe: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.json(favorites.map((item) => item.recipe));
}));

// DELETE /api/users/:id/favorites/:recipeId
app.delete(
  "/api/users/:id/favorites/:recipeId",
  asyncHandler(async (req, res) => {
    const userId = parseId(req.params.id);
    const recipeId = parseId(req.params.recipeId);

    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    res.status(204).send();
  })
);

// ======================================================
// OPTIONAL STRETCH: RECIPE RATINGS
// ======================================================

// POST /api/recipes/:id/ratings
app.post("/api/recipes/:id/ratings", asyncHandler(async (req, res) => {
  const recipeId = parseId(req.params.id);

  const body = z.object({
    userId: z.number().int().positive(),
    value: z.number().int().min(1).max(5),
  }).strict().parse(req.body);

  // Update an existing rating or create a new rating.
  const rating = await prisma.rating.upsert({
    where: {
      userId_recipeId: {
        userId: body.userId,
        recipeId,
      },
    },
    update: {
      value: body.value,
    },
    create: {
      userId: body.userId,
      recipeId,
      value: body.value,
    },
  });

  res.status(201).json(rating);
}));

// ======================================================
// OPTIONAL STRETCH: STATISTICS
// ======================================================

// GET /api/stats
app.get("/api/stats", asyncHandler(async (req, res) => {
  const [
    totalRecipes,
    totalUsers,
    categoryCounts,
    average,
    easiest,
    hardest,
  ] = await prisma.$transaction([
    prisma.recipe.count(),
    prisma.user.count(),

    prisma.recipe.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
    }),

    prisma.recipe.aggregate({
      _avg: {
        cookTime: true,
      },
    }),

    prisma.recipe.findFirst({
      orderBy: {
        cookTime: "asc",
      },
      select: {
        title: true,
        cookTime: true,
      },
    }),

    prisma.recipe.findFirst({
      orderBy: {
        cookTime: "desc",
      },
      select: {
        title: true,
        cookTime: true,
      },
    }),
  ]);

  res.json({
    totalRecipes,
    totalUsers,
    recipesByCategory: Object.fromEntries(
      categoryCounts.map((item) => [
        item.category,
        item._count._all,
      ])
    ),
    avgCookTime: average._avg.cookTime,
    easiestRecipe: easiest,
    hardestRecipe: hardest,
  });
}));

// ======================================================
// ERROR HANDLING
// ======================================================

// Handle unknown API endpoints.
app.use((req, res, next) => {
  next(httpError(404, "Route not found"));
});

// Central error handler.
app.use((error, req, res, next) => {
  // Invalid request data.
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.flatten(),
    });
  }

  // Database-specific errors.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "This unique value already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Referenced record does not exist",
      });
    }
  }

  console.error(error);

  res.status(error.status || 500).json({
    error: error.status
      ? error.message
      : "Internal server error",
  });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Recipe API running on port ${PORT}`);
});
