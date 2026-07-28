'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient } from '@/types';
import { fetchIngredients } from '@/lib/api';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { Pizza, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AdminPageContent() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F12] text-zinc-100 font-sans">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Pizza className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg block">SliceCraft Admin Portal</span>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Internal Kitchen & Store Operations</span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1">
        <AdminDashboard ingredients={ingredients} onRefreshIngredients={loadIngredientsData} />
      </main>

      {/* Admin Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-zinc-500">
        SliceCraft Artisan Pizzeria • Staff Management System
      </footer>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminPageContent />
      </ToastProvider>
    </AuthProvider>
  );
}
