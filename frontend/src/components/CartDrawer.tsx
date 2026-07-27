'use client';

import React from 'react';
import { CustomPizza } from '@/types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CustomPizza[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + deliveryFee + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel bg-zinc-950/95 border-l border-white/10 text-white flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Your Pizza Cart</h2>
                <span className="text-xs text-zinc-400">{cart.length} item(s) selected</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto opacity-30 stroke-1" />
                <p className="text-sm font-medium">Your cart is empty.</p>
                <p className="text-xs text-zinc-600">Customized pizzas will appear here.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-base text-white">{item.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        {item.size?.name} • {item.crust?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ingredients details */}
                  <div className="text-[11px] text-zinc-400 space-y-0.5">
                    <p><span className="text-zinc-500">Sauce:</span> {item.sauce?.name}</p>
                    <p><span className="text-zinc-500">Cheese:</span> {item.cheese?.name}</p>
                    {item.toppings?.length > 0 && (
                      <p>
                        <span className="text-zinc-500">Toppings:</span>{' '}
                        {item.toppings.map(t => `${t.ingredient.name} (x${t.quantity})`).join(', ')}
                      </p>
                    )}
                    {item.dips?.length > 0 && (
                      <p>
                        <span className="text-zinc-500">Dips:</span>{' '}
                        {item.dips.map(d => `${d.ingredient.name} (x${d.quantity})`).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-extrabold text-amber-300 text-sm">
                      ${(item.totalPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 space-y-4 bg-zinc-900/90">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-zinc-200">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-zinc-200">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="text-amber-400 text-base">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onOpenCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-98"
              >
                Checkout Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
