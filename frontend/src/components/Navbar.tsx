'use client';

import React from 'react';
import { Pizza, ShoppingBag, ShieldCheck, Sparkles, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'builder' | 'presets' | 'track' | 'admin';
  setActiveTab: (tab: 'builder' | 'presets' | 'track' | 'admin') => void;
  cartCount: number;
  cartTotal: number;
  setIsCartOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  cartTotal,
  setIsCartOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('builder')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-orange-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Pizza className="w-6 h-6 animate-pulse-glow" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-orange-400 bg-clip-text text-transparent">
              SliceCraft
            </span>
            <span className="text-xs block font-semibold text-amber-500/90 tracking-wider uppercase">
              Artisan Pizzeria
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'builder'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Custom Builder
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'presets'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Pizza className="w-4 h-4" />
            Presets Menu
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'track'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            Track Order
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-zinc-700 to-zinc-800 text-white shadow-md border border-amber-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Admin Portal
          </button>
        </nav>

        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 hover:border-amber-500/60 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs text-zinc-400 block font-normal">Cart Total</span>
            <span className="text-sm font-bold text-amber-300">${cartTotal.toFixed(2)}</span>
          </div>
        </button>

      </div>
      
      {/* Mobile Nav Tabs */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-3 pt-2 border-t border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex flex-col items-center py-1 px-2 ${activeTab === 'builder' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          Builder
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex flex-col items-center py-1 px-2 ${activeTab === 'presets' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
        >
          <Pizza className="w-4 h-4 mb-0.5" />
          Presets
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex flex-col items-center py-1 px-2 ${activeTab === 'track' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          Tracker
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 px-2 ${activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          Admin
        </button>
      </div>
    </header>
  );
};
