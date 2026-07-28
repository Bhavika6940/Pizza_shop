'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient, CustomPizza, Order } from '@/types';
import { fetchIngredients } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PizzaBuilder } from '@/components/PizzaBuilder';
import { PresetPizzas } from '@/components/PresetPizzas';
import { OrderTracker } from '@/components/OrderTracker';
import { AdminDashboard } from '@/components/AdminDashboard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';

import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/context/AuthContext';

import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'builder' | 'presets' | 'track'>('builder');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cart, setCart] = useState<CustomPizza[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [customizingPizza, setCustomizingPizza] = useState<CustomPizza | null>(null);

  // Load ingredients, saved active tab, and saved cart on mount
  const loadIngredientsData = async () => {
    try {
      const data = await fetchIngredients();
      setIngredients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIngredientsData();
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('slicecraft_active_tab') as 'builder' | 'presets' | 'track' | null;
      if (savedTab && ['builder', 'presets', 'track'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
      const savedCart = localStorage.getItem('slicecraft_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch {}
      }
      const savedCheckoutOpen = localStorage.getItem('slicecraft_checkout_open');
      if (savedCheckoutOpen) {
        try { setIsCheckoutOpen(JSON.parse(savedCheckoutOpen)); } catch {}
      }
      const savedCartOpen = localStorage.getItem('slicecraft_cart_open');
      if (savedCartOpen) {
        try { setIsCartOpen(JSON.parse(savedCartOpen)); } catch {}
      }
    }
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Save modal states to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_checkout_open', JSON.stringify(isCheckoutOpen));
    }
  }, [isCheckoutOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_cart_open', JSON.stringify(isCartOpen));
    }
  }, [isCartOpen]);

  const handleTabChange = (tab: 'builder' | 'presets' | 'track') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_active_tab', tab);
    }
  };

  // Cart Handlers
  const handleAddToCart = (pizza: CustomPizza) => {
    setCart(prev => [...prev, pizza]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CustomPizza[];
    });
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slicecraft_checkout_open');
      localStorage.removeItem('slicecraft_cart_open');
      localStorage.removeItem('slicecraft_checkout_form_draft');
    }
    setTrackedOrder(newOrder);
    handleTabChange('track');
  };

  const handleCustomizePreset = (presetPizza: CustomPizza) => {
    // Navigate to builder with preset selected
    setCustomizingPizza(presetPizza);
    handleTabChange('builder');
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AuthProvider>
      <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#0F0F12] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
        
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          cartCount={cartCount}
          cartTotal={cartTotal}
          setIsCartOpen={setIsCartOpen}
        />

        {/* Main View Area */}
        <main className="flex-1 pb-16">
          {activeTab === 'builder' && (
            <PizzaBuilder
              ingredients={ingredients}
              onAddToCart={handleAddToCart}
              initialPizza={customizingPizza}
              onClearInitialPizza={() => setCustomizingPizza(null)}
            />
          )}

          {activeTab === 'presets' && (
            <PresetPizzas
              ingredients={ingredients}
              onAddToCart={handleAddToCart}
              onCustomizePreset={handleCustomizePreset}
            />
          )}

          {activeTab === 'track' && (
            <OrderTracker initialOrder={trackedOrder} />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full glass-panel border-t border-white/10 py-6 px-4 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} SliceCraft Artisan Pizzeria. All rights reserved.</p>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>Fresh 500° Wood-Fired Oven</span>
              <span>•</span>
              <Link href="/admin" className="hover:text-amber-400 transition-colors font-semibold flex items-center gap-1">
                Staff Admin Portal →
              </Link>
            </div>
          </div>
        </footer>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onOpenCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          onOrderSuccess={handleOrderSuccess}
        />

      </div>
    </ToastProvider>
  </AuthProvider>
  );
}
