
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Convert ingredients to objects required by the assignment.
// Example: "2|cups|maize flour" becomes:
// { name: "maize flour", amount: "2", unit: "cups" }
function makeIngredients(items) {
  return items.map((item) => {
    const [amount, unit, name] = item.split("|");
    return { name, amount, unit };
  });
}

// Create a standardized recipe object.
// The steps are stored as an array of strings (JSON).
function makeRecipe(
  title, category, difficulty,
  prepTime, cookTime, servings,
  description, ingredients, steps
) {
  return {
    title,
    category,
    difficulty,
    prepTime,
    cookTime,
    servings,
    description,
    ingredients: makeIngredients(ingredients),
    steps,
  };
}

// Seven compulsory Kenyan recipes.
const kenyanRecipes = [
  makeRecipe(
    "Nyama Choma", "Kenyan", "medium", 30, 45, 6,
    "Kenyan-style charcoal-grilled goat meat.",
    [
      "1|kg|goat ribs",
      "2|whole|lemons",
      "1|tsp|salt",
      "1|tsp|black pepper",
    ],
    [
      "Cut goat meat into serving portions.",
      "Season with salt, pepper and lemon juice.",
      "Marinate for at least 30 minutes.",
      "Grill over charcoal until safely cooked.",
      "Rest briefly and serve with kachumbari.",
    ]
  ),

  makeRecipe(
    "Ugali & Sukuma Wiki", "Kenyan", "easy", 5, 20, 4,
    "Maize meal accompanied by sauteed collard greens.",
    [
      "2|cups|maize flour",
      "3|cups|water",
      "1|bunch|sukuma wiki",
      "1|whole|onion",
      "2|whole|tomatoes",
    ],
    [
      "Boil water in a saucepan.",
      "Add maize flour gradually while stirring.",
      "Continue stirring until ugali is thick and cooked.",
      "Fry onion and tomatoes in a separate pan.",
      "Add chopped sukuma wiki and cook until tender.",
      "Serve ugali with the vegetables.",
    ]
  ),

  makeRecipe(
    "Pilau", "Kenyan", "hard", 40, 60, 6,
    "Aromatic spiced rice with beef.",
    [
      "3|cups|basmati rice",
      "500|g|beef",
      "2|tbsp|pilau masala",
      "2|whole|onions",
      "5|cups|beef stock",
    ],
    [
      "Wash and soak the rice.",
      "Brown sliced onions in cooking oil.",
      "Add beef and cook until browned.",
      "Stir in pilau masala.",
      "Add rice and stock.",
      "Simmer covered until beef and rice are cooked.",
    ]
  ),

  makeRecipe(
    "Chapati", "Kenyan", "medium", 40, 30, 6,
    "Soft layered Kenyan flatbread.",
    [
      "3|cups|wheat flour",
      "1.5|cups|warm water",
      "4|tbsp|cooking oil",
      "1|tsp|salt",
    ],
    [
      "Combine flour, salt, water and a little oil.",
      "Knead into a soft dough.",
      "Rest the dough for 20 minutes.",
      "Divide and roll into thin circles.",
      "Cook on a hot pan until both sides are golden.",
    ]
  ),

  makeRecipe(
    "Mandazi", "Kenyan", "medium", 70, 20, 8,
    "Sweet East African fried bread.",
    [
      "3|cups|wheat flour",
      "1|cup|coconut milk",
      "0.25|cup|sugar",
      "2|tsp|baking powder",
      "2|cups|frying oil",
    ],
    [
      "Mix flour, sugar and baking powder.",
      "Add coconut milk and make a smooth dough.",
      "Rest dough for 30 minutes.",
      "Roll out and cut into triangles.",
      "Fry in hot oil until golden brown.",
    ]
  ),

  makeRecipe(
    "Githeri", "Kenyan", "easy", 15, 120, 5,
    "A traditional dish of maize and beans.",
    [
      "2|cups|dry maize",
      "2|cups|dry beans",
      "1|whole|onion",
      "2|whole|tomatoes",
      "2|tbsp|cooking oil",
    ],
    [
      "Soak dry beans overnight.",
      "Boil maize and beans until fully tender.",
      "Fry onions and tomatoes in a separate pan.",
      "Add the cooked maize and beans.",
      "Simmer together and serve hot.",
    ]
  ),

  makeRecipe(
    "Mukimo", "Kenyan", "medium", 15, 45, 4,
    "Mashed potatoes with maize, peas and greens.",
    [
      "6|whole|potatoes",
      "1|cup|green peas",
      "1|cup|cooked maize",
      "1|bunch|pumpkin leaves",
      "1|tsp|salt",
    ],
    [
      "Peel and chop potatoes.",
      "Boil potatoes with peas and pumpkin leaves.",
      "Cook until vegetables are tender.",
      "Add the cooked maize.",
      "Mash everything together and season.",
    ]
  ),
];

// Eight international recipes across five categories.
const internationalRecipes = [
  makeRecipe(
    "Spaghetti Bolognese", "Italian", "medium", 15, 40, 4,
    "Pasta with rich tomato and minced beef sauce.",
    [
      "400|g|spaghetti",
      "400|g|minced beef",
      "2|cups|tomato sauce",
      "1|whole|onion",
    ],
    [
      "Boil spaghetti according to package instructions.",
      "Cook chopped onion and minced beef.",
      "Add tomato sauce and simmer.",
      "Serve sauce over drained pasta.",
    ]
  ),

  makeRecipe(
    "Margherita Pizza", "Italian", "medium", 30, 15, 4,
    "Classic pizza with mozzarella and basil.",
    [
      "1|whole|pizza dough",
      "1|cup|tomato sauce",
      "200|g|mozzarella",
      "1|bunch|fresh basil",
    ],
    [
      "Preheat the oven.",
      "Stretch pizza dough onto a tray.",
      "Spread tomato sauce over the dough.",
      "Top with mozzarella.",
      "Bake until golden and finish with basil.",
    ]
  ),

  makeRecipe(
    "Chicken Curry", "Indian", "medium", 20, 35, 4,
    "Tender chicken cooked in aromatic curry sauce.",
    [
      "500|g|chicken",
      "2|tbsp|curry powder",
      "1|cup|coconut milk",
      "1|whole|onion",
    ],
    [
      "Chop onion and chicken.",
      "Cook onion with curry spices.",
      "Add chicken and brown.",
      "Pour in coconut milk.",
      "Simmer until chicken is fully cooked.",
    ]
  ),

  makeRecipe(
    "Butter Chicken", "Indian", "medium", 30, 40, 4,
    "Chicken cooked in a creamy tomato sauce.",
    [
      "500|g|chicken",
      "2|tbsp|butter",
      "1|cup|cream",
      "1|cup|tomato puree",
    ],
    [
      "Marinate chicken with spices.",
      "Cook the chicken until browned.",
      "Prepare a butter and tomato sauce.",
      "Add cream and chicken.",
      "Simmer until cooked through.",
    ]
  ),

  makeRecipe(
    "Chinese Fried Rice", "Chinese", "easy", 10, 15, 3,
    "Stir-fried rice with vegetables and eggs.",
    [
      "3|cups|cooked rice",
      "2|whole|eggs",
      "1|cup|mixed vegetables",
      "2|tbsp|soy sauce",
    ],
    [
      "Scramble eggs in a hot wok.",
      "Add chopped vegetables.",
      "Stir in cooked chilled rice.",
      "Add soy sauce and toss until heated.",
    ]
  ),

  makeRecipe(
    "Chicken Tacos", "Mexican", "easy", 15, 20, 4,
    "Soft tortillas filled with spiced chicken.",
    [
      "400|g|chicken",
      "8|whole|tortillas",
      "1|cup|shredded lettuce",
      "2|tbsp|taco seasoning",
    ],
    [
      "Season chicken with taco seasoning.",
      "Cook chicken thoroughly.",
      "Warm tortillas.",
      "Fill tortillas with chicken and lettuce.",
      "Serve with your preferred salsa.",
    ]
  ),

  makeRecipe(
    "Chocolate Brownies", "Desserts", "easy", 15, 30, 8,
    "Rich chocolate squares with a soft centre.",
    [
      "1|cup|wheat flour",
      "0.5|cup|cocoa powder",
      "2|whole|eggs",
      "0.75|cup|sugar",
      "0.5|cup|butter",
    ],
    [
      "Preheat oven to 175 degrees Celsius.",
      "Melt butter and mix with sugar.",
      "Add eggs, cocoa and flour.",
      "Pour mixture into a lined baking pan.",
      "Bake until the centre is just set.",
    ]
  ),

  makeRecipe(
    "Banana Pancakes", "Desserts", "easy", 10, 15, 4,
    "Fluffy pancakes made with ripe bananas.",
    [
      "2|whole|bananas",
      "1|cup|wheat flour",
      "1|cup|milk",
      "2|whole|eggs",
    ],
    [
      "Mash the bananas.",
      "Whisk eggs and milk into the bananas.",
      "Mix in flour to form a batter.",
      "Cook small portions on a lightly oiled pan.",
      "Turn once and cook until golden.",
    ]
  ),
];

// Seed function inserts users and their recipes.
async function main() {
  console.log("Starting database seeding...");

  const users = [
    {
      name: "Ochieng Otieno",
      email: "ochieng@example.com",
      bio: "I enjoy traditional Kenyan cooking.",
    },
    {
      name: "Wanjiku Mwangi",
      email: "wanjiku@example.com",
      bio: "Passionate about African and international cuisine.",
    },
    {
      name: "Amina Hassan",
      email: "amina@example.com",
      bio: "I love sharing family recipes.",
    },
  ];

  // Upsert prevents duplicate users on repeated seeding.
  const savedUsers = [];

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        bio: user.bio,
      },
      create: user,
    });

    savedUsers.push(savedUser);
  }

  const allRecipes = [
    ...kenyanRecipes,
    ...internationalRecipes,
  ];

  // Create or update the sample recipes.
  for (const [index, recipe] of allRecipes.entries()) {
    const authorId = savedUsers[index % savedUsers.length].id;

    // Look up the existing seeded recipe.
    const existing = await prisma.recipe.findFirst({
      where: {
        title: recipe.title,
        authorId,
      },
    });

    if (existing) {
      await prisma.recipe.update({
        where: { id: existing.id },
        data: recipe,
      });
    } else {
      await prisma.recipe.create({
        data: {
          ...recipe,
          authorId,
        },
      });
    }

    console.log(`Seeded: ${recipe.title}`);
  }

  console.log("Database seeding completed.");
  console.log("3 users and 15 sample recipes processed.");
}

// Close database connections whether seeding succeeds or fails.
main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
