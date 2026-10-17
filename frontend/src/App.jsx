
import { useState, useEffect } from "react";
import {
  ChefHat,
  Search,
  Clock3,
  Users,
  ArrowLeft,
} from "lucide-react";

// API location from Vite environment variables.
const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

// Recipe categories available for filtering.
const categories = [
  "",
  "Kenyan",
  "Italian",
  "Indian",
  "Chinese",
  "Mexican",
  "Desserts",
];

function App() {
  // Search and filtering state.
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Pagination state.
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // Database recipes returned by Express.
  const [recipes, setRecipes] = useState([]);

  // The currently selected recipe.
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch recipes whenever search, category or page changes.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchRecipes() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "6",
        });

        // Add optional query parameters.
        if (search) params.set("search", search);
        if (category) params.set("category", category);

        const response = await fetch(
          `${API}/recipes?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipes.");
        }

        const data = await response.json();

        setRecipes(data.recipes);
        setPagination(data.pagination);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchRecipes();

    // Cancel the previous request if filters change.
    return () => controller.abort();
  }, [search, category, page]);

  // Fetch full details for a selected recipe.
  async function viewRecipe(id) {
    setError("");

    try {
      const response = await fetch(`${API}/recipes/${id}`);

      if (!response.ok) {
        throw new Error("Unable to load recipe details.");
      }

      const data = await response.json();
      setSelectedRecipe(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // Return to the recipe catalogue.
  function backToRecipes() {
    setSelectedRecipe(null);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-center gap-3">
            <ChefHat size={34} />

            <h1 className="text-3xl font-bold">
              Karibu Recipes
            </h1>
          </div>

          <p className="mt-3 text-emerald-100">
            Discover authentic Kenyan recipes and
            delicious meals from around the world.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto w-full px-5 py-8 flex-1">

        {/* Recipe details view */}
        {selectedRecipe ? (
          <article className="bg-white border rounded-xl p-6 shadow-sm">

            <button
              onClick={backToRecipes}
              className="flex items-center gap-2 text-emerald-700 mb-6"
            >
              <ArrowLeft size={18} />
              Back to recipes
            </button>

            <p className="text-emerald-700 font-semibold">
              {selectedRecipe.category}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {selectedRecipe.title}
            </h2>

            <p className="text-gray-500 mt-2">
              By {selectedRecipe.author?.name}
            </p>

            <p className="mt-5 text-gray-700">
              {selectedRecipe.description}
            </p>

            <div className="flex flex-wrap gap-5 mt-6 text-gray-600">
              <span>
                Prep: {selectedRecipe.prepTime} min
              </span>

              <span>
                Cook: {selectedRecipe.cookTime} min
              </span>

              <span>
                Servings: {selectedRecipe.servings}
              </span>

              <span className="capitalize">
                Difficulty: {selectedRecipe.difficulty}
              </span>
            </div>

            {/* Rating information */}
            {selectedRecipe.averageRating !== null && (
              <p className="mt-3 text-amber-700">
                ⭐ {selectedRecipe.averageRating} / 5
                {" "}({selectedRecipe.ratingCount} ratings)
              </p>
            )}

            {/* Ingredient list */}
            <section className="mt-8">
              <h3 className="text-xl font-bold mb-4">
                Ingredients
              </h3>

              <ul className="list-disc pl-6 space-y-2">
                {selectedRecipe.ingredients.map(
                  (ingredient, index) => (
                    <li key={index}>
                      {ingredient.amount}{" "}
                      {ingredient.unit}{" "}
                      {ingredient.name}
                    </li>
                  )
                )}
              </ul>
            </section>

            {/* Cooking instructions */}
            <section className="mt-8">
              <h3 className="text-xl font-bold mb-4">
                Cooking Instructions
              </h3>

              <ol className="list-decimal pl-6 space-y-3">
                {selectedRecipe.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          </article>
        ) : (
          <>
            {/* Recipe catalogue heading */}
            <h2 className="text-3xl font-bold mb-6">
              Explore Recipes
            </h2>

            {/* Search and category filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">

              <div className="flex items-center gap-3 border rounded-lg bg-white px-4 flex-1">
                <Search className="text-gray-500" size={20} />

                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="w-full py-3 outline-none"
                />
              </div>

              <select
                aria-label="Select recipe category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="border rounded-lg px-4 py-3 bg-white"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item || "All Categories"}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading indicator */}
            {loading && (
              <p className="text-gray-600">
                Loading recipes...
              </p>
            )}

            {/* Error notification */}
            {error && (
              <p role="alert" className="text-red-600 mb-4">
                {error}
              </p>
            )}

            {!loading && !error && (
              <>
                <p className="text-gray-600 mb-5">
                  {pagination.total} recipes found
                </p>

                {/* Responsive recipe card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => viewRecipe(recipe.id)}
                      className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition text-left"
                    >
                      <div className="text-4xl mb-4">
                        🍲
                      </div>

                      <p className="text-emerald-700 font-semibold text-sm">
                        {recipe.category}
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {recipe.title}
                      </h3>

                      <p className="text-gray-600 mt-3 text-sm">
                        {recipe.description}
                      </p>

                      {/* Recipe metadata */}
                      <div className="flex flex-wrap justify-between gap-3 mt-6 text-sm text-gray-600">

                        <span className="flex items-center gap-1">
                          <Clock3 size={16} />
                          {recipe.cookTime} min
                        </span>

                        <span className="capitalize">
                          {recipe.difficulty}
                        </span>

                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {recipe.servings}
                        </span>

                      </div>
                    </button>
                  ))}
                </div>

                {/* Empty results message */}
                {recipes.length === 0 && (
                  <p className="mt-6 text-gray-500">
                    No recipes match your search.
                  </p>
                )}

                {/* Pagination controls */}
                <div className="flex items-center justify-center gap-5 mt-10">

                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="border rounded-lg px-4 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of{" "}
                    {Math.max(1, pagination.totalPages)}
                  </span>

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="border rounded-lg px-4 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-6">
        Karibu Recipes | Week 6 Database Project
      </footer>
    </div>
  );
}

export default App;
