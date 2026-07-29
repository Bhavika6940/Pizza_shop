'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient, Order, OrderStatus, IngredientCategory } from '@/types';
import { fetchAllOrders, updateOrderStatus, toggleIngredientStock, updateIngredient, deleteIngredient, addIngredient } from '@/lib/api';
import { ShieldCheck, Package, Layers, CheckCircle, RefreshCw, Plus, Edit2, Check, X, AlertCircle, Clock, Trash2 } from 'lucide-react';

import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Lock, KeyRound, Mail, Sparkles } from 'lucide-react';

interface AdminDashboardProps {
  ingredients: Ingredient[];
  onRefreshIngredients: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  ingredients,
  onRefreshIngredients,
}) => {
  const toast = useToast();
  const { adminUser, isAdminLoggedIn, loginAdmin, registerAdminAccount, logoutAdmin, quickDemoAdminLogin } = useAuth();
  
  // Admin Login & Register state
  const [adminAuthMode, setAdminAuthMode] = useState<'login' | 'register'>('login');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegPassword, setAdminRegPassword] = useState('');
  const [adminRegPhone, setAdminRegPhone] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'ingredients'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAdminTab = localStorage.getItem('slicecraft_admin_tab') as 'orders' | 'ingredients' | null;
      if (savedAdminTab && ['orders', 'ingredients'].includes(savedAdminTab)) {
        setActiveTab(savedAdminTab);
      }
    }
  }, []);

  const handleAdminTabChange = (tab: 'orders' | 'ingredients') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slicecraft_admin_tab', tab);
    }
  };

  // Editing ingredient price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number>(0);

  // New Ingredient form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>(IngredientCategory.MEAT);
  const [newPrice, setNewPrice] = useState<number>(1.50);
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Edit Ingredient modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<IngredientCategory>(IngredientCategory.MEAT);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editInStock, setEditInStock] = useState(true);
  const [editIsDefault, setEditIsDefault] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError('');
    try {
      const u = await loginAdmin(adminEmail, adminPassword);
      toast.success(`Welcome to Admin Portal, ${u.name}!`);
    } catch (err: any) {
      setAdminAuthError(err.message || 'Admin authentication failed');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError('');
    try {
      const u = await registerAdminAccount({
        name: adminRegName,
        email: adminRegEmail,
        password: adminRegPassword,
        phone: adminRegPhone || undefined,
      });
      toast.success(`Admin account registered in DB! Welcome, ${u.name}!`);
    } catch (err: any) {
      setAdminAuthError(err.message || 'Admin registration failed');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Load orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchAllOrders(orderFilter === 'ALL' ? undefined : (orderFilter as OrderStatus));
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && isAdminLoggedIn) {
      loadOrders();
    }
  }, [activeTab, orderFilter, isAdminLoggedIn]);

  // Listen to background mock order updates to keep dashboard dynamic
  useEffect(() => {
    const handleMockUpdate = () => {
      if (activeTab === 'orders' && isAdminLoggedIn) {
        loadOrders();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mock-order-updated', handleMockUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mock-order-updated', handleMockUpdate);
      }
    };
  }, [activeTab, isAdminLoggedIn]);

  // Handle Order Status Update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      await loadOrders();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // Handle Stock Toggle
  const handleToggleStock = async (ingredientId: string) => {
    try {
      await toggleIngredientStock(ingredientId);
      toast.success('Stock availability updated');
      onRefreshIngredients();
    } catch (err) {
      toast.error('Failed to toggle stock.');
    }
  };

  // Handle Price Save
  const handleSavePrice = async (ingredientId: string) => {
    try {
      await updateIngredient(ingredientId, { price: Number(editingPriceValue) });
      toast.success('Price updated successfully');
      setEditingPriceId(null);
      onRefreshIngredients();
    } catch (err) {
      toast.error('Failed to update price.');
    }
  };

  // Handle Add New Ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addIngredient({
        name: newName,
        category: newCategory,
        price: Number(newPrice),
        description: newDesc || undefined,
        image: newImage || undefined,
        inStock: true,
        isDefault: newIsDefault,
      });
      toast.success(`Ingredient "${newName}" added successfully`);
      setShowAddModal(false);
      setNewName('');
      setNewDesc('');
      setNewImage('');
      setNewIsDefault(false);
      onRefreshIngredients();
    } catch (err) {
      toast.error('Failed to add ingredient.');
    }
  };

  // Handle Edit Click
  const handleEditClick = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setEditName(ing.name);
    setEditCategory(ing.category);
    setEditPrice(ing.price);
    setEditDesc(ing.description || '');
    setEditImage(ing.image || '');
    setEditInStock(ing.inStock);
    setEditIsDefault(ing.isDefault || false);
    setShowEditModal(true);
  };

  // Handle Edit Ingredient Submit
  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIngredient) return;
    try {
      await updateIngredient(editingIngredient.id, {
        name: editName,
        category: editCategory,
        price: Number(editPrice),
        description: editDesc || undefined,
        image: editImage || undefined,
        inStock: editInStock,
        isDefault: editIsDefault,
      });
      toast.success(`Ingredient "${editName}" updated successfully`);
      setShowEditModal(false);
      setEditingIngredient(null);
      onRefreshIngredients();
    } catch (err) {
      toast.error('Failed to update ingredient.');
    }
  };

  // Handle Delete Ingredient
  const handleDeleteIngredient = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteIngredient(id);
        toast.success(`Ingredient "${name}" deleted successfully`);
        onRefreshIngredients();
      } catch (err) {
        toast.error('Failed to delete ingredient.');
      }
    }
  };

  // Render Admin Auth Gate if not logged in as Admin
  if (!isAdminLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16">
        <div className="glass-panel bg-zinc-950/90 rounded-3xl p-8 border border-white/10 text-white space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 inline-block border border-amber-500/20 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </span>
            <h1 className="text-3xl font-black text-white">Admin Portal Access</h1>
            <p className="text-xs text-zinc-400">Restricted portal for kitchen staff & store management</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-300 block">Quick Demo Access</span>
              <span className="text-[11px] text-zinc-400">Log in as Master Pizzaiolo Admin</span>
            </div>
            <button
              onClick={async () => {
                setAdminAuthLoading(true);
                try {
                  const u = await quickDemoAdminLogin();
                  toast.success(`Welcome back, ${u.name}!`);
                } catch {
                  toast.error('Demo admin login failed');
                } finally {
                  setAdminAuthLoading(false);
                }
              }}
              disabled={adminAuthLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shadow-md shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo Admin
            </button>
          </div>

          {/* Login vs Register Admin Toggle */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAdminAuthMode('login'); setAdminAuthError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                adminAuthMode === 'login' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admin Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAdminAuthMode('register'); setAdminAuthError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                adminAuthMode === 'register' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register New Admin
            </button>
          </div>

          {adminAuthError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold text-center">
              {adminAuthError}
            </div>
          )}

          {adminAuthMode === 'login' ? (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="admin@slicecraft.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Admin Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs transition-all shadow-md mt-2"
              >
                {adminAuthLoading ? 'Verifying Admin Credentials...' : 'Unlock Admin Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Pizzaiolo"
                  value={adminRegName}
                  onChange={(e) => setAdminRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="newadmin@slicecraft.com"
                    value={adminRegEmail}
                    onChange={(e) => setAdminRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Admin Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="•••••••• (Min 6 chars)"
                    value={adminRegPassword}
                    onChange={(e) => setAdminRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={adminRegPhone}
                  onChange={(e) => setAdminRegPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs transition-all shadow-md mt-2"
              >
                {adminAuthLoading ? 'Registering Admin Account...' : 'Register & Save Admin to DB'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white">Restaurant Admin Portal</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <strong className="text-amber-300">{adminUser?.name || 'Administrator'}</strong> ({adminUser?.email})
          </p>
        </div>

        {/* Tab Toggle & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => handleAdminTabChange('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Live Orders ({orders.length})
            </button>

            <button
              onClick={() => handleAdminTabChange('ingredients')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Ingredients ({ingredients.length})
            </button>
          </div>

          <button
            onClick={() => {
              logoutAdmin();
              toast.info('Admin logged out.');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-xs font-bold transition-all"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Admin Manual Control Policy Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs font-medium shadow-sm">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-amber-400 block">Manual Admin Control Policy</span>
              <span>Only logged-in Admin personnel can modify customer order record statuses. Automatic status updates have been disabled to guarantee complete admin control.</span>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['ALL', 'PENDING', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderFilter === st
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* Orders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-16 glass-panel rounded-3xl text-zinc-500">
                <Package className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
                <p className="text-sm font-medium">No orders found for selected filter.</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg text-white">Order #{order.orderCode || order.id?.slice(0, 8) || order.id || 'N/A'}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {order.customerName} • {order.customerPhone}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{order.deliveryAddress}</p>
                    </div>

                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      ${(order.totalPrice ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-2 text-xs">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-zinc-200">{item.pizzaName} (x{item.quantity})</span>
                          <p className="text-[11px] text-zinc-400 truncate max-w-[280px]">
                            {item.ingredients?.map(i => i.ingredientName).join(', ')}
                          </p>
                        </div>
                        <span className="font-semibold text-zinc-400">${(((item.itemPrice || 0) * (item.quantity || 1))).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Update Status Dropdown */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Status Override:</span>
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300 text-xs font-bold focus:outline-none cursor-pointer hover:border-amber-400 transition-all"
                    >
                      {Object.values(OrderStatus).map(st => (
                        <option key={st} value={st} className="bg-zinc-950 text-white">
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 2: INGREDIENTS INVENTORY MANAGEMENT */}
      {activeTab === 'ingredients' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">Ingredients & Price Management</h2>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Ingredient
            </button>
          </div>

          {/* Table of Ingredients */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[11px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price ($)</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {ingredients.map(ing => (
                    <tr key={ing.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{ing.name}</span>
                          {ing.isDefault && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        {ing.description && <span className="block text-[11px] text-zinc-500 font-normal">{ing.description}</span>}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-amber-400 font-semibold text-[10px]">
                          {ing.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-amber-300">
                        {editingPriceId === ing.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.25"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 rounded bg-zinc-900 border border-amber-500 text-white text-xs font-bold"
                            />
                            <button
                              onClick={() => handleSavePrice(ing.id)}
                              className="p-1 rounded bg-amber-500 text-black hover:bg-amber-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>${(ing.price ?? 0).toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setEditingPriceId(ing.id);
                                setEditingPriceValue(ing.price);
                              }}
                              className="text-zinc-500 hover:text-amber-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ing.inStock ? 'bg-green-950 text-green-400 border border-green-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
                          {ing.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(ing)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-white/5"
                            title="Edit Ingredient"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                            className="p-2 rounded-xl bg-red-950/20 hover:bg-red-950/60 text-red-400 transition-all border border-red-500/10"
                            title="Delete Ingredient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStock(ing.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                              ing.inStock
                                ? 'bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/60'
                                : 'bg-green-950/40 border-green-500/30 text-green-400 hover:bg-green-900/60'
                            }`}
                          >
                            {ing.inStock ? 'Mark Out' : 'Mark Avail'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Add New Ingredient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel bg-zinc-950 rounded-3xl p-6 border border-white/10 text-white space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-lg">Add New Ingredient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorgonzola Cheese"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as IngredientCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  >
                    {Object.values(IngredientCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Creamy Italian blue cheese"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="newIsDefault"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <label htmlFor="newIsDefault" className="text-xs font-bold text-zinc-300 cursor-pointer select-none">
                  Set as default selection for this category
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md mt-2"
              >
                Save Ingredient
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {showEditModal && editingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel bg-zinc-950 rounded-3xl p-6 border border-white/10 text-white space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-lg">Edit Ingredient</h3>
              <button onClick={() => { setShowEditModal(false); setEditingIngredient(null); }} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateIngredient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorgonzola Cheese"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as IngredientCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  >
                    {Object.values(IngredientCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Creamy Italian blue cheese"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-6 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editInStock"
                    checked={editInStock}
                    onChange={(e) => setEditInStock(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <label htmlFor="editInStock" className="text-xs font-bold text-zinc-300 cursor-pointer select-none">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsDefault"
                    checked={editIsDefault}
                    onChange={(e) => setEditIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <label htmlFor="editIsDefault" className="text-xs font-bold text-zinc-300 cursor-pointer select-none">
                    Default Selection
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
