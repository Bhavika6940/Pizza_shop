# 🛠️ SliceCraft Artisan Pizzeria — Developer Insights & Feature Architecture Guide

This comprehensive reference document contains developer insights, architectural patterns, database schemas, resilience strategies, state persistence workflows, and feature implementations accumulated across all development phases of **SliceCraft Artisan Pizzeria**.

---

## 📐 1. System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │            Next.js 16 Frontend           │
                     │  (App Router, React Context, Tailwind)   │
                     └────────────────────┬─────────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │          NestJS 11 REST API           │
                      │  (Controllers, Services, Validation)  │
                      └───────────────────┬───────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │         Prisma ORM v7 Driver          │
                      │         (@prisma/adapter-pg)          │
                      └───────────────────┬───────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │         PostgreSQL 16 Database        │
                      │          (Docker Port 5432)           │
                      └───────────────────────────────────────┘
```

### Stack Composition
- **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS, Lucide React, Canvas Confetti)
- **Backend**: NestJS 11 (REST API, Class Validator, Class Transformer)
- **Database**: PostgreSQL 16 via Prisma ORM v7 with `@prisma/adapter-pg`
- **Seeding**: 35 Initial Ingredients across 7 Categories (`SIZE`, `CRUST`, `SAUCE`, `CHEESE`, `MEAT`, `VEGGIE`, `DIP`) and default user accounts (`ADMIN`, `CUSTOMER`).

---

## 🗄️ 2. Database Schema (Prisma)

```prisma
enum Role {
  ADMIN
  CUSTOMER
}

enum IngredientCategory {
  SIZE
  CRUST
  SAUCE
  CHEESE
  MEAT
  VEGGIE
  DIP
}

enum OrderStatus {
  PENDING
  PREPARING
  BAKING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum OrderType {
  DELIVERY
  PICKUP
}

enum PaymentMethod {
  CASH
  CARD
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(CUSTOMER)
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Ingredient {
  id          String             @id @default(uuid())
  name        String
  category    IngredientCategory
  price       Float
  image       String?
  inStock     Boolean            @default(true)
  description String?
  isDefault   Boolean            @default(false)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model Order {
  id                  String        @id @default(uuid())
  orderCode           String        @unique @default(uuid())
  customerName        String
  customerPhone       String
  deliveryAddress     String
  orderType           OrderType     @default(DELIVERY)
  paymentMethod       PaymentMethod @default(CASH)
  specialInstructions String?
  totalPrice          Float
  status              OrderStatus   @default(PENDING)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  items               OrderItem[]
}

model OrderItem {
  id          String                @id @default(uuid())
  orderId     String
  order       Order                 @relation(fields: [orderId], references: [id], onDelete: Cascade)
  pizzaName   String                @default("Custom Pizza")
  size        String                @default("Medium")
  quantity    Int                   @default(1)
  itemPrice   Float
  ingredients OrderItemIngredient[]
}

model OrderItemIngredient {
  id              String              @id @default(uuid())
  orderItemId     String
  orderItem       OrderItem           @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
  ingredientId    String?
  ingredientName  String
  ingredientPrice Float
  category        IngredientCategory?
}
```

---

## 🌟 3. Complete Feature Directory

### 🍕 A. Custom Pizza Builder (`PizzaBuilder.tsx`)
- **Category Selection Workflow**: Interactive tabbed navigation through Size, Crust, Sauce, Cheese, Meats, Veggies, and Dips.
- **Dynamic Price Calculation**: Calculates base pizza price plus extra topping prices in real time.
- **Preset Customization Deep Linking**: Accepts an `initialPizza` prop from Preset Pizzas, filling selected toppings and allowing customization before cart addition.

### 🍕 B. Presets Menu (`PresetPizzas.tsx`)
- **Pre-designed Artisan Offerings**: Displays pre-made pizza options with 1-click cart addition.
- **"Customize Preset" Action**: Transfers preset topping configurations directly into the Custom Builder.

### 🔐 C. Dual-Role Authentication System (`AuthContext.tsx` & `AuthModal.tsx`)
- **Isolated Session Management**: `customerUser` and `adminUser` session states managed independently via `localStorage` keys (`slicecraft_customer_user` and `slicecraft_admin_user`).
- **Customer Auth**: Sign in and registration with auto-fill capabilities during checkout (`customerName`, `customerPhone`, `deliveryAddress`).
- **Admin Auth Gate**: Dedicated route `/admin` guarded by an Admin Auth Gate requiring email/password verification (`admin@slicecraft.com` / `admin123`).
- **Demo Access**: 1-click demo login buttons for both roles (`Alex Mercer` for Customer, `Master Pizzaiolo Admin` for Admin).

### 🛵 D. Live Order Tracking & Customer Track Record (`OrderTracker.tsx`)
- **Step-by-Step Preparation Stepper**: Visual progression timeline (`PENDING` ➔ `PREPARING` ➔ `BAKING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **Customer Track Record Section**: Displays historical order cards filtered for the active customer or browser session.
- **Real-Time Status Synchronization**: Listens to `mock-order-updated` window events so status changes made in the Admin Portal reflect live on the customer's screen.
- **1-Click Live Stepper Inspection**: Clicking "Track Live →" on any track record card loads that order's interactive stepper timeline.

### 🛡️ E. Admin Portal & Ingredient CRUD Operations (`AdminDashboard.tsx`)
- **Live Kitchen Orders Manager**: Filter orders by status (`ALL`, `PENDING`, `PREPARING`, `BAKING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and update statuses with dropdown controls.
- **Ingredient Inventory CRUD**:
  - **Create**: Add new ingredients with category, price, image, description, and default status.
  - **Edit**: Edit ingredient details in a modal.
  - **Delete**: Confirmation prompt before removing an ingredient.
  - **Stock Availability Toggle**: 1-click toggle for `In Stock` / `Out of Stock`.
  - **Inline Price Editing**: Click-to-edit price cells directly in the table.
  - **Default State Unsetting**: Assigning `isDefault: true` to an ingredient automatically unsets `isDefault: true` on all other ingredients in that category via Prisma `updateMany`.

### 🔔 F. Glassmorphic Toast Notification System (`ToastProvider.tsx`)
- Custom React Context (`useToast()`) providing glassmorphism styled notifications (`success`, `error`, `info`) with smooth animations and 4-second auto-dismissal.

### 🔄 G. Complete Page Refresh State Persistence
| Entity / View | Storage Key | Description |
| :--- | :--- | :--- |
| **Active Customer Tab** | `slicecraft_active_tab` | Persists `'builder'`, `'presets'`, or `'track'` tab so refreshing re-opens the active view. |
| **Cart Items** | `slicecraft_cart` | Persists cart array so items remain in the cart across page reloads. |
| **Tracked Order Code** | `slicecraft_last_tracked_code` | Persists active order code in `OrderTracker.tsx` so refreshing reloads the live stepper. |
| **Admin Portal Tab** | `slicecraft_admin_tab` | Persists `'orders'` vs `'ingredients'` view on `/admin`. |
| **Checkout Modal State** | `slicecraft_checkout_open` | If the checkout form is open, refreshing re-opens the checkout modal automatically. |
| **Checkout Form Draft** | `slicecraft_checkout_form_draft` | Persists typed inputs (`customerName`, `customerPhone`, `deliveryAddress`, etc.) across page refreshes. Cleared upon successful order placement. |

---

## 🐛 4. Resolved Technical Issues & Developer Insights

### 1. Fallback Numeric ID vs PostgreSQL UUID Mismatch
- **Issue**: Offline/fallback ingredients had numeric IDs (`'1'`). Updating fallback items sent `PATCH /api/ingredients/1` to NestJS, which called `prisma.ingredient.findUnique({ where: { id: '1' } })`. Since PostgreSQL expects UUIDs, the database returned 404.
- **Solution**: Implemented a local storage fallback layer in `frontend/src/lib/api.ts` (`getMockIngredients()` / `saveMockIngredients()`) that intercepts updates for local items when backend requests fail. Seeded real UUIDs in PostgreSQL via `prisma/seed.ts`.

### 2. Unsafe String Slicing (`.slice`) Runtime Crash
- **Issue**: `order.id.slice(0, 8)` threw `TypeError: Cannot read properties of undefined (reading 'slice')` when `order.id` was missing or undefined.
- **Solution**: Enforced optional chaining with safe string fallbacks:
  ```tsx
  Order #{order.orderCode || order.id?.slice(0, 8) || order.id || 'N/A'}
  ```

### 3. Unsafe Number Formatting (`.toFixed`) Runtime Crash
- **Issue**: `order.totalPrice.toFixed(2)` threw `TypeError: Cannot read properties of undefined (reading 'toFixed')` when `totalPrice` was undefined.
- **Solution**: Enforced nullish coalescing before calling `.toFixed()`:
  ```tsx
  ${(order.totalPrice ?? 0).toFixed(2)}
  ${(((item.itemPrice || 0) * (item.quantity || 1))).toFixed(2)}
  ```

### 4. NestJS Validation Pipe Whitelisting
- **Issue**: Sending extra fields in API bodies threw HTTP 400 Bad Request errors.
- **Solution**: Configured `ValidationPipe` in `backend/src/main.ts` with `forbidNonWhitelisted: false` to strip extra properties cleanly.

### 5. Prisma Client Synchronization After Schema Changes
- **Insight**: When adding new models (e.g. `User`) to `schema.prisma`, running `npx prisma generate` is required before executing `prisma/seed.ts` to ensure `@prisma/client` types include the new model delegate (e.g. `prisma.user.upsert`).

---

## 🛠️ 5. Development Verification & Commands

```bash
# Database Sync & Seed
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts

# Backend Development Server
cd backend
npm run start:dev

# Frontend Development Server
cd frontend
npm run dev

# Production Build Verification
cd backend && npm run build
cd frontend && npm run build
```

---

## 🔑 Demo Credentials Summary

- **Admin Account**: `admin@slicecraft.com` / `admin123`
- **Customer Account**: `customer@slicecraft.com` / `customer123` (`Alex Mercer`)
- **Storefront URL**: `http://localhost:3000/`
- **Admin Portal URL**: `http://localhost:3000/admin`
- **Backend API Base**: `http://localhost:3001/api`
