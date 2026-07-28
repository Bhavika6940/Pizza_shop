import { PrismaClient, IngredientCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pizzashop?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const initialIngredients = [
  // SIZES
  {
    name: 'Small (10")',
    category: IngredientCategory.SIZE,
    price: 8.0,
    description: 'Personal 6-slice pizza, perfect for 1 person.',
    inStock: true,
    isDefault: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Medium (12")',
    category: IngredientCategory.SIZE,
    price: 12.0,
    description: 'Classic 8-slice pizza, ideal for 2 people.',
    inStock: true,
    isDefault: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Large (14")',
    category: IngredientCategory.SIZE,
    price: 16.0,
    description: 'Family 10-slice pizza, great for sharing (3-4 people).',
    inStock: true,
    isDefault: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Extra Large (16")',
    category: IngredientCategory.SIZE,
    price: 20.0,
    description: 'Party size 12-slice pizza for pizza lovers!',
    inStock: true,
    isDefault: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  },

  // CRUSTS
  {
    name: 'Classic Hand-Tossed',
    category: IngredientCategory.CRUST,
    price: 0.0,
    description: 'Traditional golden-brown crust, crispy on outside, soft inside.',
    inStock: true,
    isDefault: true,
  },
  {
    name: 'Thin & Crispy',
    category: IngredientCategory.CRUST,
    price: 1.0,
    description: 'Ultra-thin, crunchy bar-style crust.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Cheese Stuffed Crust',
    category: IngredientCategory.CRUST,
    price: 2.5,
    description: 'Crust filled with gooey molten mozzarella cheese.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Gluten-Free Crust',
    category: IngredientCategory.CRUST,
    price: 3.0,
    description: 'Delicious gluten-free cauliflower crust.',
    inStock: true,
    isDefault: false,
  },

  // SAUCES
  {
    name: 'Signature Tomato Sauce',
    category: IngredientCategory.SAUCE,
    price: 0.0,
    description: 'Rich San Marzano tomatoes with Italian herbs.',
    inStock: true,
    isDefault: true,
  },
  {
    name: 'Creamy Garlic Alfredo',
    category: IngredientCategory.SAUCE,
    price: 1.5,
    description: 'Decadent garlic parmesan cream sauce.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Smoky BBQ Sauce',
    category: IngredientCategory.SAUCE,
    price: 1.0,
    description: 'Sweet and tangy hickory BBQ sauce base.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Spicy Arrabbiata',
    category: IngredientCategory.SAUCE,
    price: 1.25,
    description: 'Fiery tomato sauce with red chili flakes.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Basil Pesto Swirl',
    category: IngredientCategory.SAUCE,
    price: 1.75,
    description: 'Aromatic basil, garlic, and pine nut pesto.',
    inStock: true,
    isDefault: false,
  },

  // CHEESES
  {
    name: 'Fresh Mozzarella',
    category: IngredientCategory.CHEESE,
    price: 0.0,
    description: 'Classic stretchy whole-milk mozzarella.',
    inStock: true,
    isDefault: true,
  },
  {
    name: 'Extra Mozzarella',
    category: IngredientCategory.CHEESE,
    price: 2.0,
    description: 'Double layer of melted mozzarella.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Four Cheese Blend',
    category: IngredientCategory.CHEESE,
    price: 2.5,
    description: 'Blend of Mozzarella, Cheddar, Parmesan & Provolone.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Plant-Based Vegan Cheese',
    category: IngredientCategory.CHEESE,
    price: 2.0,
    description: '100% dairy-free meltable cheese alternative.',
    inStock: true,
    isDefault: false,
  },

  // MEATS
  {
    name: 'Classic Pepperoni',
    category: IngredientCategory.MEAT,
    price: 1.75,
    description: 'Crispy cupping pepperoni slices.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Italian Sausage',
    category: IngredientCategory.MEAT,
    price: 1.75,
    description: 'Savory seasoned pork sausage crumbles.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Crispy Bacon',
    category: IngredientCategory.MEAT,
    price: 2.0,
    description: 'Applewood smoked bacon pieces.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Grilled Chicken',
    category: IngredientCategory.MEAT,
    price: 2.25,
    description: 'Tender marinated chicken breast chunks.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Spicy Salami',
    category: IngredientCategory.MEAT,
    price: 2.0,
    description: 'Artisanal spicy Calabrian salami slices.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Smoked Ham',
    category: IngredientCategory.MEAT,
    price: 1.75,
    description: 'Diced savory ham.',
    inStock: true,
    isDefault: false,
  },

  // VEGGIES & TOPPINGS
  {
    name: 'Fresh Mushrooms',
    category: IngredientCategory.VEGGIE,
    price: 1.25,
    description: 'Sliced cremini mushrooms.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Bell Peppers',
    category: IngredientCategory.VEGGIE,
    price: 1.0,
    description: 'Crisp green and red bell pepper strips.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Red Onions',
    category: IngredientCategory.VEGGIE,
    price: 0.75,
    description: 'Thinly sliced sweet red onions.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Kalamata Olives',
    category: IngredientCategory.VEGGIE,
    price: 1.0,
    description: 'Rich, salty black olives.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Jalapeño Peppers',
    category: IngredientCategory.VEGGIE,
    price: 1.0,
    description: 'Pickled spicy jalapeño slices.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Cherry Tomatoes',
    category: IngredientCategory.VEGGIE,
    price: 1.25,
    description: 'Juicy roasted cherry tomato halves.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Fresh Basil',
    category: IngredientCategory.VEGGIE,
    price: 1.0,
    description: 'Fragrant fresh basil leaves added post-bake.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Truffle Oil Drizzle',
    category: IngredientCategory.VEGGIE,
    price: 2.5,
    description: 'Aromatic white truffle oil finish.',
    inStock: true,
    isDefault: false,
  },

  // DIPS
  {
    name: 'Garlic Butter Dip',
    category: IngredientCategory.DIP,
    price: 1.0,
    description: 'Warm melted garlic butter dipping sauce.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Creamy Ranch Dip',
    category: IngredientCategory.DIP,
    price: 1.0,
    description: 'House-made buttermilk herb ranch.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Spicy Mayo Dip',
    category: IngredientCategory.DIP,
    price: 1.0,
    description: 'Sriracha infused creamy dipping sauce.',
    inStock: true,
    isDefault: false,
  },
  {
    name: 'Honey Hot Sauce Dip',
    category: IngredientCategory.DIP,
    price: 1.25,
    description: 'Sweet honey blended with habanero heat.',
    inStock: true,
    isDefault: false,
  },
];

async function main() {
  console.log('Seeding pizza ingredients...');
  
 
  await prisma.ingredient.deleteMany({});
  
  for (const item of initialIngredients) {
    await prisma.ingredient.create({
      data: item,
    });
  }

  console.log(`Seeded ${initialIngredients.length} ingredients successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
