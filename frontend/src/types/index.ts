export enum IngredientCategory {
  SIZE = 'SIZE',
  CRUST = 'CRUST',
  SAUCE = 'SAUCE',
  CHEESE = 'CHEESE',
  MEAT = 'MEAT',
  VEGGIE = 'VEGGIE',
  DIP = 'DIP',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  BAKING = 'BAKING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  price: number;
  image?: string;
  inStock: boolean;
  description?: string;
  isDefault?: boolean;
}

export interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
}

export interface CustomPizza {
  id: string;
  name: string;
  size: Ingredient;
  crust: Ingredient;
  sauce: Ingredient;
  cheese: Ingredient;
  toppings: SelectedIngredient[];
  dips: SelectedIngredient[];
  quantity: number;
  totalPrice: number;
}

export interface OrderItemIngredient {
  id?: string;
  ingredientId?: string;
  ingredientName: string;
  ingredientPrice: number;
  category?: IngredientCategory;
}

export interface OrderItem {
  id?: string;
  pizzaName: string;
  size: string;
  quantity: number;
  itemPrice: number;
  ingredients: OrderItemIngredient[];
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface PresetPizza {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  image: string;
  sizeName: string;
  crustName: string;
  sauceName: string;
  cheeseName: string;
  toppingNames: string[];
}
