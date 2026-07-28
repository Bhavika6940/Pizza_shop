import { Ingredient, IngredientCategory, Order, OrderStatus } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to get/set mock orders from localStorage
const getMockOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('slicecraft_mock_orders');
  return stored ? JSON.parse(stored) : [];
};

const saveMockOrders = (orders: Order[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('slicecraft_mock_orders', JSON.stringify(orders));
};

// Background simulator for mock order progression
function simulateOrderStatusProgress(orderId: string) {
  const intervals = [
    { status: OrderStatus.PREPARING, delay: 8000 },  // 8s
    { status: OrderStatus.BAKING, delay: 18000 },    // 18s
    { status: OrderStatus.OUT_FOR_DELIVERY, delay: 32000 }, // 32s
    { status: OrderStatus.DELIVERED, delay: 50000 }, // 50s
  ];
  
  intervals.forEach(({ status, delay }) => {
    setTimeout(() => {
      const orders = getMockOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1 && orders[idx].status !== OrderStatus.CANCELLED) {
        orders[idx].status = status;
        orders[idx].updatedAt = new Date().toISOString();
        saveMockOrders(orders);
        // Trigger a custom event to notify components to refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mock-order-updated', { detail: { orderId, status } }));
        }
      }
    }, delay);
  });
}

export async function fetchIngredients(category?: IngredientCategory): Promise<Ingredient[]> {
  try {
    const url = new URL(`${API_BASE_URL}/ingredients`);
    if (category) {
      url.searchParams.append('category', category);
    }
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ingredients');
    return await res.json();
  } catch (error) {
    console.warn('Backend API connection failed, using fallback ingredients:', error);
    return FALLBACK_INGREDIENTS.filter(i => !category || i.category === category);
  }
}

export async function createOrder(orderData: any): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to place order');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('Backend API order placement failed, falling back to local simulation:', error);
    
    // Generate a local mock order
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mockOrder: Order = {
      id: `local-${Date.now()}`,
      orderCode: `SC-${randomSuffix}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      orderType: orderData.orderType,
      paymentMethod: orderData.paymentMethod,
      specialInstructions: orderData.specialInstructions,
      totalPrice: orderData.totalPrice,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderData.items.map((item: any, idx: number) => ({
        id: `item-${idx}-${Date.now()}`,
        pizzaName: item.pizzaName,
        size: item.size,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        ingredients: item.ingredients,
      })),
    };
    
    const mockOrders = getMockOrders();
    mockOrders.push(mockOrder);
    saveMockOrders(mockOrders);
    
    // Start status simulation in background
    simulateOrderStatusProgress(mockOrder.id);
    
    return mockOrder;
  }
}

export async function fetchOrder(idOrCode: string): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${idOrCode}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Order not found');
    return await res.json();
  } catch (error) {
    console.warn('Backend API fetch order failed, checking local simulation:', error);
    
    const mockOrders = getMockOrders();
    const order = mockOrders.find(
      o => o.id === idOrCode || o.orderCode === idOrCode || o.id.includes(idOrCode) || o.orderCode.includes(idOrCode)
    );
    
    if (!order) {
      throw new Error('Order not found locally or via API.');
    }
    return order;
  }
}

export async function fetchAllOrders(status?: OrderStatus): Promise<Order[]> {
  let apiOrders: Order[] = [];
  try {
    const url = new URL(`${API_BASE_URL}/orders`);
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (res.ok) {
      apiOrders = await res.json();
    }
  } catch (error) {
    console.warn('Failed to fetch orders from API:', error);
  }
  
  // Combine with mock orders
  const mockOrders = getMockOrders().filter(o => !status || o.status === status);
  
  // Combine both lists, sorting by createdAt descending
  const allOrders = [...apiOrders, ...mockOrders];
  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allOrders;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
  } catch (error) {
    console.warn('Failed to update order status via API, updating local simulation:', error);
  }
  
  const mockOrders = getMockOrders();
  const idx = mockOrders.findIndex(o => o.id === orderId);
  if (idx === -1) {
    throw new Error('Order not found to update status.');
  }
  
  mockOrders[idx].status = status;
  mockOrders[idx].updatedAt = new Date().toISOString();
  saveMockOrders(mockOrders);
  return mockOrders[idx];
}

export async function toggleIngredientStock(ingredientId: string): Promise<Ingredient> {
  const res = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}/toggle-stock`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to toggle stock');
  return await res.json();
}

export async function updateIngredientPrice(ingredientId: string, price: number): Promise<Ingredient> {
  const res = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price }),
  });
  if (!res.ok) throw new Error('Failed to update price');
  return await res.json();
}

export async function addIngredient(data: any): Promise<Ingredient> {
  const res = await fetch(`${API_BASE_URL}/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add ingredient');
  return await res.json();
}

// Fallback ingredients if backend is starting up
const FALLBACK_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Small (10")', category: IngredientCategory.SIZE, price: 8.0, description: 'Personal 6-slice pizza', inStock: true },
  { id: '2', name: 'Medium (12")', category: IngredientCategory.SIZE, price: 12.0, description: 'Classic 8-slice pizza', inStock: true, isDefault: true },
  { id: '3', name: 'Large (14")', category: IngredientCategory.SIZE, price: 16.0, description: 'Family 10-slice pizza', inStock: true },
  { id: '4', name: 'Extra Large (16")', category: IngredientCategory.SIZE, price: 20.0, description: 'Party size 12-slice pizza', inStock: true },

  { id: '5', name: 'Classic Hand-Tossed', category: IngredientCategory.CRUST, price: 0.0, description: 'Crispy outside, soft inside', inStock: true, isDefault: true },
  { id: '6', name: 'Thin & Crispy', category: IngredientCategory.CRUST, price: 1.0, description: 'Ultra-thin crunchy crust', inStock: true },
  { id: '7', name: 'Cheese Stuffed Crust', category: IngredientCategory.CRUST, price: 2.5, description: 'Crust filled with molten cheese', inStock: true },
  { id: '8', name: 'Gluten-Free Crust', category: IngredientCategory.CRUST, price: 3.0, description: 'Delicious cauliflower crust', inStock: true },

  { id: '9', name: 'Signature Tomato Sauce', category: IngredientCategory.SAUCE, price: 0.0, description: 'Rich San Marzano tomatoes', inStock: true, isDefault: true },
  { id: '10', name: 'Creamy Garlic Alfredo', category: IngredientCategory.SAUCE, price: 1.5, description: 'Decadent garlic cream', inStock: true },
  { id: '11', name: 'Smoky BBQ Sauce', category: IngredientCategory.SAUCE, price: 1.0, description: 'Sweet & tangy hickory BBQ', inStock: true },
  { id: '12', name: 'Spicy Arrabbiata', category: IngredientCategory.SAUCE, price: 1.25, description: 'Fiery chili tomato sauce', inStock: true },

  { id: '13', name: 'Fresh Mozzarella', category: IngredientCategory.CHEESE, price: 0.0, description: 'Stretchy whole-milk mozzarella', inStock: true, isDefault: true },
  { id: '14', name: 'Extra Mozzarella', category: IngredientCategory.CHEESE, price: 2.0, description: 'Double layer of mozzarella', inStock: true },
  { id: '15', name: 'Four Cheese Blend', category: IngredientCategory.CHEESE, price: 2.5, description: 'Mozzarella, Cheddar, Parmesan & Provolone', inStock: true },
  { id: '16', name: 'Plant-Based Vegan Cheese', category: IngredientCategory.CHEESE, price: 2.0, description: '100% dairy-free cheese', inStock: true },

  { id: '17', name: 'Classic Pepperoni', category: IngredientCategory.MEAT, price: 1.75, description: 'Crispy cupping pepperoni', inStock: true },
  { id: '18', name: 'Italian Sausage', category: IngredientCategory.MEAT, price: 1.75, description: 'Savory pork sausage', inStock: true },
  { id: '19', name: 'Crispy Bacon', category: IngredientCategory.MEAT, price: 2.0, description: 'Applewood smoked bacon', inStock: true },
  { id: '20', name: 'Grilled Chicken', category: IngredientCategory.MEAT, price: 2.25, description: 'Tender chicken breast', inStock: true },

  { id: '21', name: 'Fresh Mushrooms', category: IngredientCategory.VEGGIE, price: 1.25, description: 'Sliced cremini mushrooms', inStock: true },
  { id: '22', name: 'Bell Peppers', category: IngredientCategory.VEGGIE, price: 1.0, description: 'Crisp green & red bell peppers', inStock: true },
  { id: '23', name: 'Red Onions', category: IngredientCategory.VEGGIE, price: 0.75, description: 'Thinly sliced sweet red onions', inStock: true },
  { id: '24', name: 'Kalamata Olives', category: IngredientCategory.VEGGIE, price: 1.0, description: 'Salty black olives', inStock: true },
  { id: '25', name: 'Jalapeño Peppers', category: IngredientCategory.VEGGIE, price: 1.0, description: 'Spicy pickled jalapeños', inStock: true },
  { id: '26', name: 'Fresh Basil', category: IngredientCategory.VEGGIE, price: 1.0, description: 'Aromatic fresh basil', inStock: true },

  { id: '27', name: 'Garlic Butter Dip', category: IngredientCategory.DIP, price: 1.0, description: 'Warm melted garlic butter', inStock: true },
  { id: '28', name: 'Creamy Ranch Dip', category: IngredientCategory.DIP, price: 1.0, description: 'House buttermilk ranch', inStock: true },
];
