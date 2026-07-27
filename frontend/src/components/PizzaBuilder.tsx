'use client';

import React, { useState, useMemo } from 'react';
import { Ingredient, IngredientCategory, SelectedIngredient, CustomPizza } from '@/types';
import { PizzaCanvas } from './PizzaCanvas';
import { Check, Plus, Minus, RotateCcw, ShoppingBag, Info, Flame, Sparkles } from 'lucide-react';

interface PizzaBuilderProps {
  ingredients: Ingredient[];
  onAddToCart: (pizza: CustomPizza) => void;
}

export const PizzaBuilder: React.FC<PizzaBuilderProps> = ({ ingredients, onAddToCart }) => {
  // Categorize ingredients
  const sizes = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.SIZE), [ingredients]);
  const crusts = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.CRUST), [ingredients]);
  const sauces = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.SAUCE), [ingredients]);
  const cheeses = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.CHEESE), [ingredients]);
  const meats = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.MEAT), [ingredients]);
  const veggies = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.VEGGIE), [ingredients]);
  const dips = useMemo(() => ingredients.filter(i => i.category === IngredientCategory.DIP), [ingredients]);

  // Selections state with safe fallbacks
  const [selectedSize, setSelectedSize] = useState<Ingredient>(() => {
    return sizes.find(s => s.isDefault) || sizes[0] || {
      id: 'default-size',
      name: 'Medium (12")',
      category: IngredientCategory.SIZE,
      price: 12.0,
      inStock: true,
      description: 'Classic 8-slice pizza',
    };
  });

  const [selectedCrust, setSelectedCrust] = useState<Ingredient>(() => {
    return crusts.find(c => c.isDefault) || crusts[0] || {
      id: 'default-crust',
      name: 'Classic Hand-Tossed',
      category: IngredientCategory.CRUST,
      price: 0.0,
      inStock: true,
    };
  });

  const [selectedSauce, setSelectedSauce] = useState<Ingredient>(() => {
    return sauces.find(s => s.isDefault) || sauces[0] || {
      id: 'default-sauce',
      name: 'Signature Tomato Sauce',
      category: IngredientCategory.SAUCE,
      price: 0.0,
      inStock: true,
    };
  });

  const [selectedCheese, setSelectedCheese] = useState<Ingredient>(() => {
    return cheeses.find(c => c.isDefault) || cheeses[0] || {
      id: 'default-cheese',
      name: 'Fresh Mozzarella',
      category: IngredientCategory.CHEESE,
      price: 0.0,
      inStock: true,
    };
  });

  // Sync state when ingredients load
  React.useEffect(() => {
    if (sizes.length > 0 && selectedSize.id === 'default-size') {
      setSelectedSize(sizes.find(s => s.isDefault) || sizes[0]);
    }
    if (crusts.length > 0 && selectedCrust.id === 'default-crust') {
      setSelectedCrust(crusts.find(c => c.isDefault) || crusts[0]);
    }
    if (sauces.length > 0 && selectedSauce.id === 'default-sauce') {
      setSelectedSauce(sauces.find(s => s.isDefault) || sauces[0]);
    }
    if (cheeses.length > 0 && selectedCheese.id === 'default-cheese') {
      setSelectedCheese(cheeses.find(c => c.isDefault) || cheeses[0]);
    }
  }, [ingredients]);

  // Toppings & Dips selections map
  const [selectedToppings, setSelectedToppings] = useState<SelectedIngredient[]>([]);
  const [selectedDips, setSelectedDips] = useState<SelectedIngredient[]>([]);

  // Active step tab in builder
  const [activeStep, setActiveStep] = useState<'size' | 'crust' | 'sauce' | 'cheese' | 'toppings' | 'dips'>('size');

  // Handle Topping Toggle / Quantity change
  const handleToppingChange = (topping: Ingredient, delta: number) => {
    setSelectedToppings(prev => {
      const existing = prev.find(item => item.ingredient.id === topping.id);
      if (!existing) {
        if (delta > 0) return [...prev, { ingredient: topping, quantity: 1 }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(item => item.ingredient.id !== topping.id);
      }
      return prev.map(item =>
        item.ingredient.id === topping.id ? { ...item, quantity: newQty } : item
      );
    });
  };

  // Handle Dip Toggle
  const handleDipChange = (dip: Ingredient, delta: number) => {
    setSelectedDips(prev => {
      const existing = prev.find(item => item.ingredient.id === dip.id);
      if (!existing) {
        if (delta > 0) return [...prev, { ingredient: dip, quantity: 1 }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(item => item.ingredient.id !== dip.id);
      }
      return prev.map(item =>
        item.ingredient.id === dip.id ? { ...item, quantity: newQty } : item
      );
    });
  };

  // Real-time calculated price
  const calculatedTotal = useMemo(() => {
    if (!selectedSize || !selectedCrust || !selectedSauce || !selectedCheese) return 0;
    
    let total = selectedSize.price + selectedCrust.price + selectedSauce.price + selectedCheese.price;

    selectedToppings.forEach(t => {
      total += t.ingredient.price * t.quantity;
    });

    selectedDips.forEach(d => {
      total += d.ingredient.price * d.quantity;
    });

    return total;
  }, [selectedSize, selectedCrust, selectedSauce, selectedCheese, selectedToppings, selectedDips]);

  // Reset to defaults
  const handleReset = () => {
    if (sizes.length > 0) setSelectedSize(sizes.find(s => s.isDefault) || sizes[0]);
    if (crusts.length > 0) setSelectedCrust(crusts.find(c => c.isDefault) || crusts[0]);
    if (sauces.length > 0) setSelectedSauce(sauces.find(s => s.isDefault) || sauces[0]);
    if (cheeses.length > 0) setSelectedCheese(cheeses.find(c => c.isDefault) || cheeses[0]);
    setSelectedToppings([]);
    setSelectedDips([]);
  };

  // Add pizza to cart
  const handleAddToCartClick = () => {
    const customPizza: CustomPizza = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedSize.name.split(' ')[0]} Pizza`,
      size: selectedSize,
      crust: selectedCrust,
      sauce: selectedSauce,
      cheese: selectedCheese,
      toppings: selectedToppings,
      dips: selectedDips,
      quantity: 1,
      totalPrice: calculatedTotal,
    };
    onAddToCart(customPizza);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4" /> Live Interactive Pizza Studio
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
          Craft Your Perfect <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Masterpiece</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Select fresh ingredients, watch your pizza take shape in real time, and enjoy artisan perfection baked to order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VISUAL CANVAS & LIVE PRICE SUMMARY (Sticky on Desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center">
          <div className="w-full glass-panel rounded-3xl p-6 flex flex-col items-center border border-white/10 relative overflow-hidden">
            
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 animate-bounce" /> 500° Wood Fired
            </div>

            {/* Pizza Canvas */}
            <PizzaCanvas
              size={selectedSize}
              crust={selectedCrust}
              sauce={selectedSauce}
              cheese={selectedCheese}
              toppings={selectedToppings}
            />

            {/* Active Specs Summary Pill */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs space-y-2">
              <div className="flex justify-between items-center text-zinc-300">
                <span className="font-semibold">Size & Crust:</span>
                <span className="text-amber-400 font-bold">{selectedSize?.name} • {selectedCrust?.name}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span className="font-semibold">Sauce & Cheese:</span>
                <span className="text-amber-400 font-bold">{selectedSauce?.name} • {selectedCheese?.name}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span className="font-semibold">Selected Toppings ({selectedToppings.reduce((acc, t) => acc + t.quantity, 0)}):</span>
                <span className="text-zinc-400 truncate max-w-[200px]">
                  {selectedToppings.length === 0 ? 'Cheese Base' : selectedToppings.map(t => `${t.ingredient.name} (x${t.quantity})`).join(', ')}
                </span>
              </div>
            </div>

            {/* Total Price & Add to Cart Action */}
            <div className="w-full mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Total Price</span>
                <span className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Reset Pizza"
                  className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleAddToCartClick}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-amber-400 text-white font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: STEP-BY-STEP INGREDIENTS SELECTOR */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'size', label: '1. Size', count: null },
              { id: 'crust', label: '2. Crust', count: null },
              { id: 'sauce', label: '3. Sauce', count: null },
              { id: 'cheese', label: '4. Cheese', count: null },
              { id: 'toppings', label: '5. Toppings', count: selectedToppings.length },
              { id: 'dips', label: '6. Dips', count: selectedDips.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeStep === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* STEP 1: SIZE SELECTOR */}
          {activeStep === 'size' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-between">
                <span>Select Pizza Size</span>
                <span className="text-xs text-amber-400 font-normal">Step 1 of 6</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sizes.map(item => {
                  const isSelected = selectedSize?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSize(item)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{item.name}</h3>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                      </div>
                      <span className="font-extrabold text-amber-400 text-base">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CRUST SELECTOR */}
          {activeStep === 'crust' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-between">
                <span>Choose Your Crust</span>
                <span className="text-xs text-amber-400 font-normal">Step 2 of 6</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crusts.map(item => {
                  const isSelected = selectedCrust?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCrust(item)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{item.name}</h3>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                      </div>
                      <span className="font-extrabold text-amber-400 text-base">
                        {item.price === 0 ? 'FREE' : `+$${item.price.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SAUCE SELECTOR */}
          {activeStep === 'sauce' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-between">
                <span>Select Sauce Base</span>
                <span className="text-xs text-amber-400 font-normal">Step 3 of 6</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sauces.map(item => {
                  const isSelected = selectedSauce?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSauce(item)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{item.name}</h3>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                      </div>
                      <span className="font-extrabold text-amber-400 text-base">
                        {item.price === 0 ? 'FREE' : `+$${item.price.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: CHEESE SELECTOR */}
          {activeStep === 'cheese' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-between">
                <span>Choose Cheese Level</span>
                <span className="text-xs text-amber-400 font-normal">Step 4 of 6</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cheeses.map(item => {
                  const isSelected = selectedCheese?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCheese(item)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{item.name}</h3>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                      </div>
                      <span className="font-extrabold text-amber-400 text-base">
                        {item.price === 0 ? 'FREE' : `+$${item.price.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: MEATS & VEGGIES TOPPINGS */}
          {activeStep === 'toppings' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Custom Toppings</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Add extra flavor layers (Meats & Fresh Veggies)</p>
                </div>
                <span className="text-xs text-amber-400 font-normal">Step 5 of 6</span>
              </div>

              {/* Meats Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Savory Meats
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {meats.map(item => {
                    const sel = selectedToppings.find(t => t.ingredient.id === item.id);
                    const qty = sel ? sel.quantity : 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          qty > 0
                            ? 'bg-amber-500/10 border-amber-500/60 text-white'
                            : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <span className="text-xs text-amber-400 font-semibold">+${item.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-white/10">
                          <button
                            onClick={() => handleToppingChange(item, -1)}
                            disabled={qty === 0}
                            className="p-1 rounded-lg hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => handleToppingChange(item, 1)}
                            className="p-1 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Veggies Section */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Garden Fresh Veggies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {veggies.map(item => {
                    const sel = selectedToppings.find(t => t.ingredient.id === item.id);
                    const qty = sel ? sel.quantity : 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          qty > 0
                            ? 'bg-green-500/10 border-green-500/60 text-white'
                            : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <span className="text-xs text-amber-400 font-semibold">+${item.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-white/10">
                          <button
                            onClick={() => handleToppingChange(item, -1)}
                            disabled={qty === 0}
                            className="p-1 rounded-lg hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => handleToppingChange(item, 1)}
                            className="p-1 rounded-lg bg-green-500 text-black hover:bg-green-400 font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 6: DIPS & EXTRAS */}
          {activeStep === 'dips' && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-between">
                <span>Dipping Sauces & Extras</span>
                <span className="text-xs text-amber-400 font-normal">Step 6 of 6</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dips.map(item => {
                  const sel = selectedDips.find(d => d.ingredient.id === item.id);
                  const qty = sel ? sel.quantity : 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        qty > 0
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div>
                        <h3 className="font-bold text-base">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                        <span className="text-xs font-bold text-amber-400 mt-1 block">+$${item.price.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/10">
                        <button
                          onClick={() => handleDipChange(item, -1)}
                          disabled={qty === 0}
                          className="p-1 rounded-lg hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => handleDipChange(item, 1)}
                          className="p-1 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
