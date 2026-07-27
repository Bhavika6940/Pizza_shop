'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient, Order, OrderStatus, IngredientCategory } from '@/types';
import { fetchAllOrders, updateOrderStatus, toggleIngredientStock, updateIngredientPrice, addIngredient } from '@/lib/api';
import { ShieldCheck, Package, Layers, CheckCircle, RefreshCw, Plus, Edit2, Check, X, AlertCircle, Clock } from 'lucide-react';

interface AdminDashboardProps {
  ingredients: Ingredient[];
  onRefreshIngredients: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  ingredients,
  onRefreshIngredients,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'ingredients'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');

  // Editing ingredient price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number>(0);

  // New Ingredient form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>(IngredientCategory.MEAT);
  const [newPrice, setNewPrice] = useState<number>(1.50);
  const [newDesc, setNewDesc] = useState('');

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
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, orderFilter]);

  // Handle Order Status Update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Handle Stock Toggle
  const handleToggleStock = async (ingredientId: string) => {
    try {
      await toggleIngredientStock(ingredientId);
      onRefreshIngredients();
    } catch (err) {
      alert('Failed to toggle stock.');
    }
  };

  // Handle Price Save
  const handleSavePrice = async (ingredientId: string) => {
    try {
      await updateIngredientPrice(ingredientId, Number(editingPriceValue));
      setEditingPriceId(null);
      onRefreshIngredients();
    } catch (err) {
      alert('Failed to update price.');
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
        description: newDesc,
        inStock: true,
      });
      setShowAddModal(false);
      setNewName('');
      setNewDesc('');
      onRefreshIngredients();
    } catch (err) {
      alert('Failed to add ingredient.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white">Restaurant Admin Portal</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Manage kitchen orders and ingredient inventory in real time</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ingredients'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Ingredients ({ingredients.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
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
                      <h3 className="font-black text-lg text-white">Order #{order.orderCode || order.id.slice(0, 8)}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {order.customerName} • {order.customerPhone}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{order.deliveryAddress}</p>
                    </div>

                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      ${order.totalPrice.toFixed(2)}
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
                        <span className="font-semibold text-zinc-400">${(item.itemPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Update Status Dropdown */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs font-semibold text-zinc-400">Update Kitchen Status:</span>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-bold focus:outline-none cursor-pointer"
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
                        {ing.name}
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
                            <span>${ing.price.toFixed(2)}</span>
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
                        <button
                          onClick={() => handleToggleStock(ing.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                            ing.inStock
                              ? 'bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/60'
                              : 'bg-green-950/40 border-green-500/30 text-green-400 hover:bg-green-900/60'
                          }`}
                        >
                          {ing.inStock ? 'Mark Out of Stock' : 'Mark Available'}
                        </button>
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

    </div>
  );
};
