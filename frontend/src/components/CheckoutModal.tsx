import React, { useState, useEffect } from 'react';
import { CustomPizza, OrderType, PaymentMethod, Order } from '@/types';
import { createOrder } from '@/lib/api';
import confetti from 'canvas-confetti';
import { X, CheckCircle, Truck, Store, CreditCard, DollarSign, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CustomPizza[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const { customerUser } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Save form fields draft to localStorage while editing
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const draft = { customerName, customerPhone, deliveryAddress, orderType, paymentMethod, specialInstructions };
      localStorage.setItem('slicecraft_checkout_form_draft', JSON.stringify(draft));
    }
  }, [customerName, customerPhone, deliveryAddress, orderType, paymentMethod, specialInstructions, isOpen]);

  // Restore form fields draft on mount/open or fallback to customerUser
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const savedDraft = localStorage.getItem('slicecraft_checkout_form_draft');
      if (savedDraft) {
        try {
          const d = JSON.parse(savedDraft);
          if (d.customerName) setCustomerName(d.customerName);
          if (d.customerPhone) setCustomerPhone(d.customerPhone);
          if (d.deliveryAddress) setDeliveryAddress(d.deliveryAddress);
          if (d.orderType) setOrderType(d.orderType);
          if (d.paymentMethod) setPaymentMethod(d.paymentMethod);
          if (d.specialInstructions) setSpecialInstructions(d.specialInstructions);
        } catch {}
      } else if (customerUser) {
        if (customerUser.name) setCustomerName(customerUser.name);
        if (customerUser.phone) setCustomerPhone(customerUser.phone);
        if (customerUser.address) setDeliveryAddress(customerUser.address);
      }
    }
  }, [isOpen, customerUser]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);
  const deliveryFee = orderType === OrderType.DELIVERY ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || (orderType === OrderType.DELIVERY && !deliveryAddress)) {
      setError('Please fill in all required customer details.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Transform cart items to API payload structure
      const itemsPayload = cart.map(item => ({
        pizzaName: item.name,
        size: item.size?.name || 'Medium',
        quantity: item.quantity,
        itemPrice: item.totalPrice,
        ingredients: [
          { ingredientId: item.size?.id, ingredientName: item.size?.name, ingredientPrice: item.size?.price || 0, category: item.size?.category },
          { ingredientId: item.crust?.id, ingredientName: item.crust?.name, ingredientPrice: item.crust?.price || 0, category: item.crust?.category },
          { ingredientId: item.sauce?.id, ingredientName: item.sauce?.name, ingredientPrice: item.sauce?.price || 0, category: item.sauce?.category },
          { ingredientId: item.cheese?.id, ingredientName: item.cheese?.name, ingredientPrice: item.cheese?.price || 0, category: item.cheese?.category },
          ...item.toppings.map(t => ({
            ingredientId: t.ingredient.id,
            ingredientName: `${t.ingredient.name} (x${t.quantity})`,
            ingredientPrice: t.ingredient.price * t.quantity,
            category: t.ingredient.category,
          })),
          ...item.dips.map(d => ({
            ingredientId: d.ingredient.id,
            ingredientName: `${d.ingredient.name} (x${d.quantity})`,
            ingredientPrice: d.ingredient.price * d.quantity,
            category: d.ingredient.category,
          })),
        ],
      }));

      const orderPayload = {
        customerName,
        customerPhone,
        deliveryAddress: orderType === OrderType.DELIVERY ? deliveryAddress : 'Store Pickup',
        orderType,
        paymentMethod,
        specialInstructions,
        totalPrice: grandTotal,
        items: itemsPayload,
      };

      const newOrder = await createOrder(orderPayload);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if confetti fails
      }

      onOrderSuccess(newOrder);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-lg glass-panel bg-zinc-950/95 border border-white/10 rounded-3xl p-6 md:p-8 text-white shadow-2xl z-10 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-2xl font-black text-white">Place Your Pizza Order</h2>
            <p className="text-xs text-zinc-400">Enter delivery & payment details below</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {customerUser && (
          <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Logged in as <strong>{customerUser.name}</strong> — Customer info auto-filled!</span>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Order Type Tabs */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-2">Order Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType(OrderType.DELIVERY)}
                className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  orderType === OrderType.DELIVERY
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <Truck className="w-4 h-4" /> Door Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType(OrderType.PICKUP)}
                className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  orderType === OrderType.PICKUP
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <Store className="w-4 h-4" /> Store Pickup
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. (555) 019-2834"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Delivery Address (if Delivery) */}
          {orderType === OrderType.DELIVERY && (
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Delivery Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Street name, Apartment/Suite, City"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  paymentMethod === PaymentMethod.CASH
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CARD)}
                className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  paymentMethod === PaymentMethod.CARD
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Credit / Debit Card
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Special Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Ring doorbell twice, extra crisp crust"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Grand Total Summary */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-between mt-6">
            <div>
              <span className="text-xs text-zinc-400 block">Total Due</span>
              <span className="text-2xl font-black text-amber-400">${grandTotal.toFixed(2)}</span>
            </div>
            <span className="text-xs text-zinc-500">Includes taxes & delivery</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirm & Place Order
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
