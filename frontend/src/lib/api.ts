import { Ingredient, IngredientCategory, Order, OrderStatus } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Helper to manage registered mock users in localStorage
const getRegisteredUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('slicecraft_registered_users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUser = (user: any) => {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const existingIdx = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('slicecraft_registered_users', JSON.stringify(users));
  } catch {}
};

export async function loginUser(credentials: { email: string; password: string; role?: 'ADMIN' | 'CUSTOMER' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    return await res.json();
  } catch (error: any) {
    const reqEmail = credentials.email.toLowerCase().trim();
    const reqRole = credentials.role || 'CUSTOMER';

    // Demo admin check
    if (reqEmail === 'admin@slicecraft.com' && credentials.password === 'admin123') {
      return {
        user: { id: 'admin-1', email: 'admin@slicecraft.com', name: 'Master Pizzaiolo Admin', role: 'ADMIN' },
        token: 'token_admin_demo',
      };
    }
    // Demo customer check
    if (reqEmail === 'customer@slicecraft.com' && credentials.password === 'customer123') {
      return {
        user: { id: 'cust-1', email: 'customer@slicecraft.com', name: 'Alex Mercer', phone: '+1 (555) 234-5678', address: '742 Evergreen Terrace, Sector 4', role: 'CUSTOMER' },
        token: 'token_customer_demo',
      };
    }

    // Check registered local users
    const registered = getRegisteredUsers();
    const found = registered.find((u: any) => u.email.toLowerCase() === reqEmail && u.password === credentials.password);
    if (found) {
      if (reqRole && found.role !== reqRole) {
        throw new Error(`Access denied. ${reqRole} privileges required.`);
      }
      const { password, ...safeUser } = found;
      return {
        user: safeUser,
        token: `token_${safeUser.role.toLowerCase()}_${safeUser.id}`,
      };
    }

    throw new Error(error.message || 'Invalid email or password');
  }
}

export async function registerUser(data: { email: string; password: string; name: string; phone?: string; address?: string; role?: 'ADMIN' | 'CUSTOMER' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }
    return await res.json();
  } catch (error: any) {
    const role = data.role || 'CUSTOMER';
    const newUser = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      password: data.password,
      name: data.name,
      phone: data.phone || '',
      address: data.address || '',
      role,
    };
    saveRegisteredUser(newUser);
    const { password, ...safeUser } = newUser;
    return {
      user: safeUser,
      token: `token_${role.toLowerCase()}_${safeUser.id}`,
    };
  }
}

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

// Note: Automatic order status progression is explicitly disabled.
// Customer record statuses are exclusively updated manually by authorized admin personnel from the Admin Panel.

// Helper to get/set mock ingredients from localStorage
const getMockIngredients = (): Ingredient[] => {
  if (typeof window === 'undefined') return FALLBACK_INGREDIENTS;
  const stored = localStorage.getItem('slicecraft_mock_ingredients');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('slicecraft_mock_ingredients', JSON.stringify(FALLBACK_INGREDIENTS));
  return FALLBACK_INGREDIENTS;
};

const saveMockIngredients = (ingredients: Ingredient[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('slicecraft_mock_ingredients', JSON.stringify(ingredients));
};

export async function fetchIngredients(category?: IngredientCategory): Promise<Ingredient[]> {
  try {
    const endpoint = `${API_BASE_URL}/ingredients${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch ingredients');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    throw new Error('Empty ingredient list');
  } catch (error) {
    const mock = getMockIngredients();
    return mock.filter(i => !category || i.category === category);
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
    // Fall back smoothly to local order creation if backend API is unreachable
    
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
    
    // Automatic status simulation removed: order status remains PENDING until changed manually by admin
    return mockOrder;
  }
}

export async function fetchOrder(idOrCode: string): Promise<Order | null> {
  if (!idOrCode || !idOrCode.trim()) return null;
  const search = idOrCode.trim();

  // 1. Check local mock/stored orders first (e.g. for offline/local created orders)
  const mockOrders = getMockOrders();
  const localMatch = mockOrders.find(
    o => (o.id && (o.id === search || o.id.includes(search))) || 
         (o.orderCode && (o.orderCode === search || o.orderCode.includes(search)))
  );
  if (localMatch) {
    return localMatch;
  }

  // 2. Attempt fetching from Backend API
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(search)}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.orderCode)) {
        return data;
      }
    }
  } catch (error) {
    // Graceful catch when backend API is offline or unreachable
  }

  // 3. Final re-check of mock orders before returning null
  const finalMatch = getMockOrders().find(
    o => (o.id && (o.id === search || o.id.includes(search))) || 
         (o.orderCode && (o.orderCode === search || o.orderCode.includes(search)))
  );
  return finalMatch || null;
}

export async function fetchAllOrders(status?: OrderStatus): Promise<Order[]> {
  let apiOrders: Order[] = [];
  try {
    const endpoint = `${API_BASE_URL}/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (res.ok) {
      apiOrders = await res.json();
    }
  } catch (error) {
    // Gracefully handle offline or unreachable API backend
  }
  
  // Combine with mock orders
  const mockOrders = getMockOrders().filter(o => !status || o.status === status);
  
  // Combine both lists, deduplicating by ID, sorting by createdAt descending
  const orderMap = new Map<string, Order>();
  for (const o of [...apiOrders, ...mockOrders]) {
    if (o.id) orderMap.set(o.id, o);
  }
  const allOrders = Array.from(orderMap.values());
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
    if (res.ok) {
      const updated = await res.json();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mock-order-updated', { detail: { orderId, status } }));
      }
      return updated;
    }
  } catch (error) {
    // Fall back to local storage update when backend API is unreachable
  }
  
  const mockOrders = getMockOrders();
  const idx = mockOrders.findIndex(o => o.id === orderId);
  if (idx === -1) {
    throw new Error('Order not found to update status.');
  }
  
  mockOrders[idx].status = status;
  mockOrders[idx].updatedAt = new Date().toISOString();
  saveMockOrders(mockOrders);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mock-order-updated', { detail: { orderId, status } }));
  }

  return mockOrders[idx];
}

export async function toggleIngredientStock(ingredientId: string): Promise<Ingredient> {
  try {
    const res = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}/toggle-stock`, {
      method: 'PATCH',
    });
    if (res.ok) return await res.json();
  } catch (error) {
    // Fall back to local mock stock toggle
  }

  const ingredients = getMockIngredients();
  const idx = ingredients.findIndex(i => i.id === ingredientId);
  if (idx !== -1) {
    ingredients[idx].inStock = !ingredients[idx].inStock;
    saveMockIngredients(ingredients);
    return ingredients[idx];
  }
  throw new Error('Ingredient not found to toggle stock');
}

export async function updateIngredient(ingredientId: string, data: Partial<Ingredient>): Promise<Ingredient> {
  try {
    const res = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (error) {
    // Fall back to local mock ingredient update
  }

  const ingredients = getMockIngredients();
  const idx = ingredients.findIndex(i => i.id === ingredientId);
  if (idx !== -1) {
    if (data.isDefault) {
      const category = data.category || ingredients[idx].category;
      ingredients.forEach(i => {
        if (i.category === category) i.isDefault = false;
      });
    }
    ingredients[idx] = { ...ingredients[idx], ...data };
    saveMockIngredients(ingredients);
    return ingredients[idx];
  }
  throw new Error('Ingredient not found to update');
}

export async function deleteIngredient(ingredientId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}`, {
      method: 'DELETE',
    });
    if (res.ok) return;
  } catch (error) {
    // Fall back to local mock ingredient deletion
  }

  const ingredients = getMockIngredients();
  const filtered = ingredients.filter(i => i.id !== ingredientId);
  saveMockIngredients(filtered);
}

export async function addIngredient(data: any): Promise<Ingredient> {
  try {
    const res = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (error) {
    // Fall back to local mock ingredient addition
  }

  const ingredients = getMockIngredients();
  if (data.isDefault) {
    ingredients.forEach(i => {
      if (i.category === data.category) i.isDefault = false;
    });
  }
  const newIng: Ingredient = {
    id: `local-ing-${Date.now()}`,
    name: data.name,
    category: data.category,
    price: data.price,
    description: data.description,
    image: data.image,
    inStock: data.inStock ?? true,
    isDefault: data.isDefault ?? false,
  };
  ingredients.push(newIng);
  saveMockIngredients(ingredients);
  return newIng;
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
