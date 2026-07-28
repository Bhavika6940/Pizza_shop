import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { fetchOrder, fetchAllOrders } from '@/lib/api';
import { Search, Clock, CheckCircle2, Flame, Bike, PackageCheck, RefreshCw, Pizza, History, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface OrderTrackerProps {
  initialOrder?: Order | null;
}

const STATUS_STEPS = [
  { status: OrderStatus.PENDING, label: 'Order Received', icon: Clock, desc: 'Your order was sent to the kitchen.' },
  { status: OrderStatus.PREPARING, label: 'Chef Prepping', icon: Pizza, desc: 'Tossing dough & adding fresh toppings.' },
  { status: OrderStatus.BAKING, label: 'In Wood Oven', icon: Flame, desc: 'Baking at 500°F to golden perfection.' },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: Bike, desc: 'Hot pizza is en route to your door.' },
  { status: OrderStatus.DELIVERED, label: 'Delivered', icon: PackageCheck, desc: 'Delivered & ready to enjoy!' },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialOrder }) => {
  const { customerUser } = useAuth();
  const [searchCode, setSearchCode] = useState(initialOrder?.orderCode || initialOrder?.id || '');
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerHistory, setCustomerHistory] = useState<Order[]>([]);

  // Load customer order history
  const loadHistory = async () => {
    try {
      const all = await fetchAllOrders();
      if (customerUser) {
        const filtered = all.filter(o =>
          (customerUser.phone && o.customerPhone === customerUser.phone) ||
          (customerUser.name && o.customerName?.toLowerCase().includes(customerUser.name.toLowerCase()))
        );
        setCustomerHistory(filtered.length > 0 ? filtered : all);
      } else {
        setCustomerHistory(all);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [customerUser]);

  // Auto-load initial order or restore last tracked order on refresh
  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      const code = initialOrder.orderCode || initialOrder.id;
      setSearchCode(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('slicecraft_last_tracked_code', code);
      }
    } else if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('slicecraft_last_tracked_code');
      if (savedCode) {
        setSearchCode(savedCode);
        fetchOrder(savedCode)
          .then(res => setOrder(res))
          .catch(() => {});
      }
    }
  }, [initialOrder]);

  // Listen to background mock order updates
  useEffect(() => {
    const handleMockUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      loadHistory();
      if (order && (customEvent.detail.orderId === order.id || customEvent.detail.orderId === order.orderCode)) {
        // Force refresh order details
        setLoading(true);
        fetchOrder(order.id)
          .then(res => setOrder(res))
          .catch(() => {})
          .finally(() => setLoading(false));
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
  }, [order, customerUser]);

  // Handle Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetchOrder(searchCode.trim());
      setOrder(res);
      if (typeof window !== 'undefined') {
        localStorage.setItem('slicecraft_last_tracked_code', searchCode.trim());
      }
    } catch (err) {
      setError('Order not found. Please check your order code or ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Determine current step index
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order?.status);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4" /> Live Order Tracking
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white">
          Track Your <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">Hot Pizza</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Follow your pizza live from dough preparation to your doorstep.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-2 glass-panel p-2 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Enter Order Code or ID (e.g. 550e8400...)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Track'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-center text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Order Status Display Card */}
      {order && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-8 animate-fade-in">
          
          {/* Order Header Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-white">Order #{order.orderCode || order.id?.slice(0, 8) || order.id || 'N/A'}</h2>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/40">
                  {(order.status || OrderStatus.PENDING).replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'}
              </p>
            </div>

            <button
              onClick={() => handleSearch()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
              
              {/* Connector Line */}
              <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-zinc-800 -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STATUS_STEPS.map((step, idx) => {
                const isDone = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const StepIcon = step.icon;

                return (
                  <div key={step.status} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isCurrent
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 scale-110 ring-4 ring-amber-500/30'
                          : isDone
                          ? 'bg-gradient-to-br from-red-600 to-amber-500 text-white'
                          : 'bg-zinc-900 border border-white/10 text-zinc-600'
                      }`}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className={`text-xs md:text-sm font-bold ${isDone ? 'text-white' : 'text-zinc-500'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[140px] hidden md:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Customer & Order Items Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10 text-xs">
            
            {/* Customer Details */}
            <div className="space-y-2 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
              <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider mb-2">Delivery Details</h3>
              <p><span className="text-zinc-400">Customer:</span> <strong className="text-white">{order.customerName}</strong></p>
              <p><span className="text-zinc-400">Phone:</span> <span className="text-white">{order.customerPhone}</span></p>
              <p><span className="text-zinc-400">Address:</span> <span className="text-white">{order.deliveryAddress}</span></p>
              <p><span className="text-zinc-400">Order Type:</span> <span className="text-white">{order.orderType}</span></p>
              <p><span className="text-zinc-400">Payment:</span> <span className="text-white">{order.paymentMethod}</span></p>
              {order.specialInstructions && (
                <p><span className="text-zinc-400">Notes:</span> <span className="text-amber-300">{order.specialInstructions}</span></p>
              )}
            </div>

            {/* Items Summary */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
              <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider mb-2">Order Items</h3>
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.pizzaName} (x{item.quantity})</h4>
                    <p className="text-[11px] text-zinc-400">
                      {item.ingredients?.map(i => i.ingredientName).join(', ')}
                    </p>
                  </div>
                  <span className="font-bold text-amber-300">${(((item.itemPrice || 0) * (item.quantity || 1))).toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2 font-black text-sm text-white">
                <span>Total Paid</span>
                <span className="text-amber-400 text-base">${(order.totalPrice ?? 0).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Customer Track Record & Order History Section */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-white">Your Track Record</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {customerUser
                  ? `Order history for ${customerUser.name} (${customerUser.phone || customerUser.email})`
                  : 'Track your recent orders and live kitchen statuses set by store admin'}
              </p>
            </div>
          </div>
          
          <button
            onClick={loadHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Statuses
          </button>
        </div>

        {customerHistory.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-medium">
            No order track record found yet. Place a hot pizza order to track it live!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {customerHistory.map(histOrder => {
              const isSelected = order?.id === histOrder.id;
              let statusBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
              if (histOrder.status === OrderStatus.PREPARING) statusBg = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
              if (histOrder.status === OrderStatus.BAKING) statusBg = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
              if (histOrder.status === OrderStatus.OUT_FOR_DELIVERY) statusBg = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
              if (histOrder.status === OrderStatus.DELIVERED) statusBg = 'bg-green-500/20 text-green-400 border-green-500/40';
              if (histOrder.status === OrderStatus.CANCELLED) statusBg = 'bg-red-500/20 text-red-400 border-red-500/40';

              return (
                <div
                  key={histOrder.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-white text-sm">
                        Order #{histOrder.orderCode || histOrder.id?.slice(0, 8) || histOrder.id || 'N/A'}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusBg}`}>
                        {histOrder.status ? histOrder.status.replace(/_/g, ' ') : 'PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-amber-300">
                        ${(histOrder.totalPrice ?? 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setOrder(histOrder);
                          const targetCode = histOrder.orderCode || histOrder.id;
                          setSearchCode(targetCode);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('slicecraft_last_tracked_code', targetCode);
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shadow-md"
                      >
                        Track Live <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
                    <p>
                      Customer: <strong className="text-white">{histOrder.customerName}</strong> ({histOrder.customerPhone})
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Placed: {histOrder.createdAt ? new Date(histOrder.createdAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>

                  {histOrder.items && histOrder.items.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px]">
                      {histOrder.items.map(item => (
                        <span key={item.id} className="px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 border border-white/5">
                          {item.pizzaName} (x{item.quantity})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
