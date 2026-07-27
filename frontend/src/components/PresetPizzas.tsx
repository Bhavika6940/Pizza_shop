'use client';

import React from 'react';
import { PresetPizza, CustomPizza, Ingredient, IngredientCategory } from '@/types';
import { Pizza, Sparkles, Plus, Flame, Sliders } from 'lucide-react';

interface PresetPizzasProps {
  ingredients: Ingredient[];
  onAddToCart: (pizza: CustomPizza) => void;
  onCustomizePreset: (pizza: CustomPizza) => void;
}

const PRESET_PIZZAS: PresetPizza[] = [
  {
    id: 'preset-margherita',
    name: 'Margherita Royale',
    description: 'San Marzano tomato base, creamy fresh mozzarella, cherry tomatoes, and aromatic fresh basil drizzled with white truffle oil.',
    price: 14.50,
    badge: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Medium (12")',
    crustName: 'Classic Hand-Tossed',
    sauceName: 'Signature Tomato Sauce',
    cheeseName: 'Fresh Mozzarella',
    toppingNames: ['Cherry Tomatoes', 'Fresh Basil', 'Truffle Oil Drizzle'],
  },
  {
    id: 'preset-pepperoni',
    name: 'Pepperoni Overload',
    description: 'Double layer of melted mozzarella loaded with crispy cupping pepperoni, savory Italian sausage, and garlic butter finish.',
    price: 16.50,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Medium (12")',
    crustName: 'Classic Hand-Tossed',
    sauceName: 'Signature Tomato Sauce',
    cheeseName: 'Extra Mozzarella',
    toppingNames: ['Classic Pepperoni', 'Italian Sausage'],
  },
  {
    id: 'preset-truffle',
    name: 'Truffle Mushroom Deluxe',
    description: 'Garlic Alfredo cream sauce base topped with sliced cremini mushrooms, 4-cheese blend, and white truffle oil.',
    price: 17.50,
    badge: 'Gourmet',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Medium (12")',
    crustName: 'Thin & Crispy',
    sauceName: 'Creamy Garlic Alfredo',
    cheeseName: 'Four Cheese Blend',
    toppingNames: ['Fresh Mushrooms', 'Truffle Oil Drizzle'],
  },
  {
    id: 'preset-meat',
    name: 'Meat Lover\'s Inferno',
    description: 'Packed with pepperoni, Italian sausage, applewood smoked bacon, spicy salami, and diced ham on signature tomato sauce.',
    price: 18.90,
    badge: 'Heavyweight',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Large (14")',
    crustName: 'Cheese Stuffed Crust',
    sauceName: 'Signature Tomato Sauce',
    cheeseName: 'Fresh Mozzarella',
    toppingNames: ['Classic Pepperoni', 'Italian Sausage', 'Crispy Bacon', 'Spicy Salami', 'Smoked Ham'],
  },
  {
    id: 'preset-veggie',
    name: 'Garden Harvest Supreme',
    description: 'Crisp bell peppers, fresh mushrooms, sweet red onions, Kalamata olives, cherry tomatoes, and fresh basil leaves.',
    price: 15.50,
    badge: 'Healthy & Fresh',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Medium (12")',
    crustName: 'Classic Hand-Tossed',
    sauceName: 'Signature Tomato Sauce',
    cheeseName: 'Fresh Mozzarella',
    toppingNames: ['Fresh Mushrooms', 'Bell Peppers', 'Red Onions', 'Kalamata Olives', 'Cherry Tomatoes', 'Fresh Basil'],
  },
  {
    id: 'preset-bbq',
    name: 'Smoky BBQ Chicken Craze',
    description: 'Hickory BBQ sauce base, grilled chicken breast, sweet red onions, applewood bacon, and spicy pickled jalapeños.',
    price: 17.00,
    badge: 'Fan Favorite',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    sizeName: 'Medium (12")',
    crustName: 'Classic Hand-Tossed',
    sauceName: 'Smoky BBQ Sauce',
    cheeseName: 'Four Cheese Blend',
    toppingNames: ['Grilled Chicken', 'Red Onions', 'Crispy Bacon', 'Jalapeño Peppers'],
  },
];

export const PresetPizzas: React.FC<PresetPizzasProps> = ({
  ingredients,
  onAddToCart,
  onCustomizePreset,
}) => {
  // Convert preset to CustomPizza format using available ingredients list
  const buildCustomPizzaFromPreset = (preset: PresetPizza): CustomPizza => {
    const size = ingredients.find(i => i.name.includes(preset.sizeName.split(' ')[0])) ||
      ingredients.find(i => i.category === IngredientCategory.SIZE) ||
      { id: 'sz', name: preset.sizeName, category: IngredientCategory.SIZE, price: 12.0, inStock: true };

    const crust = ingredients.find(i => i.name === preset.crustName) ||
      ingredients.find(i => i.category === IngredientCategory.CRUST) ||
      { id: 'cr', name: preset.crustName, category: IngredientCategory.CRUST, price: 0, inStock: true };

    const sauce = ingredients.find(i => i.name === preset.sauceName) ||
      ingredients.find(i => i.category === IngredientCategory.SAUCE) ||
      { id: 'sc', name: preset.sauceName, category: IngredientCategory.SAUCE, price: 0, inStock: true };

    const cheese = ingredients.find(i => i.name === preset.cheeseName) ||
      ingredients.find(i => i.category === IngredientCategory.CHEESE) ||
      { id: 'ch', name: preset.cheeseName, category: IngredientCategory.CHEESE, price: 0, inStock: true };

    const toppings = preset.toppingNames.map(tName => {
      const ing = ingredients.find(i => i.name === tName) || {
        id: `ing-${tName}`,
        name: tName,
        category: IngredientCategory.MEAT,
        price: 1.5,
        inStock: true,
      };
      return { ingredient: ing, quantity: 1 };
    });

    return {
      id: `preset-${Date.now()}-${preset.id}`,
      name: preset.name,
      size,
      crust,
      sauce,
      cheese,
      toppings,
      dips: [],
      quantity: 1,
      totalPrice: preset.price,
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Pizza className="w-4 h-4" /> Chef's Signature Menu
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
          Artisan Gourmet <span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">Presets</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Handcrafted combinations perfected by our master pizzaiolos. Order directly or customize any preset to your exact liking!
        </p>
      </div>

      {/* Grid of Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PRESET_PIZZAS.map(preset => (
          <div
            key={preset.id}
            className="group glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            {/* Image Header */}
            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
              <img
                src={preset.image}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

              {/* Badge */}
              {preset.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {preset.badge}
                </span>
              )}

              <span className="absolute bottom-4 right-4 text-2xl font-black text-amber-300 drop-shadow-md">
                ${preset.price.toFixed(2)}
              </span>
            </div>

            {/* Details Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Ingredient Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-zinc-300 font-medium">
                  {preset.crustName}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-zinc-300 font-medium">
                  {preset.sauceName}
                </span>
                {preset.toppingNames.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
                    + {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => onCustomizePreset(buildCustomPizzaFromPreset(preset))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Customize
                </button>

                <button
                  onClick={() => onAddToCart(buildCustomPizzaFromPreset(preset))}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Quick Add
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
