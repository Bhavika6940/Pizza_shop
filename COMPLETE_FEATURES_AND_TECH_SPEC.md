# 🚀 SliceCraft Artisan Pizzeria — Complete Feature & Technical Specification

This document provides a detailed breakdown of all features implemented across **Next.js 16**, **NestJS 11**, and **Prisma ORM v7**, including page refresh state persistence, route parameters, API endpoints, DTO validations, database models, and architectural patterns.

---

## ⚡ 1. Next.js 16 (Frontend Features)

### 🔄 A. Page Refresh & State Persistence System
The application maintains full state continuity across browser refreshes ($F5$) using `localStorage` synchronization:

| Feature / View State | Storage Key | Behavior on Page Refresh |
| :--- | :--- | :--- |
| **Active Customer Navigation Tab** | `slicecraft_active_tab` | Restores customer tab (`'builder'`, `'presets'`, or `'track'`). Refreshing never resets the user back to the home view. |
| **Cart Items & Quantities** | `slicecraft_cart` | Restores all pizzas, selected toppings, and quantities in the cart drawer. |
| **Active Tracked Order Code** | `slicecraft_last_tracked_code` | Restores the active order being tracked in `OrderTracker.tsx`, automatically re-fetching and populating the live preparation timeline stepper. |
| **Admin Portal Active View** | `slicecraft_admin_tab` | Restores `'orders'` vs `'ingredients'` view when refreshing `/admin`. |
| **Checkout Order Modal State** | `slicecraft_checkout_open` | If the customer has opened the checkout modal form to place an order, refreshing the browser re-opens the checkout form modal on top of the page. |
| **Cart Drawer Modal State** | `slicecraft_cart_open` | Restores cart drawer visibility if open prior to refresh. |
| **Checkout Form Draft Inputs** | `slicecraft_checkout_form_draft` | Restores typed input values (`customerName`, `customerPhone`, `deliveryAddress`, `orderType`, `paymentMethod`, `specialInstructions`) if the user refreshes mid-form. Automatically purged upon order completion. |

---

### 🌐 B. Routing & Page Architecture
- **App Router Architecture**: Next.js 16 App Router structure:
  - `src/app/page.tsx`: Customer storefront (Custom Builder, Presets Menu, Track Order).
  - `src/app/admin/page.tsx`: Dedicated standalone route for the Admin Portal (`/admin`).
- **Deep-Linking & Tab Switching**: Programmatic navigation between Presets ("Customize Preset" ➔ Builder) and Order Checkout ("Order Success" ➔ Live Tracker).

---

### 🎨 C. UI Components & Context System
- **React Context Providers**:
  - `AuthContext`: Isolated `customerUser` and `adminUser` authentication states with `localStorage` fallback.
  - `ToastProvider`: Custom glassmorphism notification system (`useToast()`) supporting `success`, `error`, and `info` toasts with auto-dismissal (4s).
- **Interactive Builders & Modals**:
  - `PizzaBuilder.tsx`: Dynamic topping category tabs, layout math calculations, and real-time total price updating.
  - `PresetPizzas.tsx`: Artisan preset cards with 1-click order and customization triggers.
  - `OrderTracker.tsx`: 5-stage preparation timeline stepper (`PENDING` ➔ `PREPARING` ➔ `BAKING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) and Customer Track Record order history grid.
  - `AdminDashboard.tsx`: Live orders manager, status filters, stock toggling, inline price editing, and full ingredient CRUD modals.
  - `AuthModal.tsx`: Customer sign-in & registration with 1-click demo access.
  - `CheckoutModal.tsx`: Customer checkout form with automatic profile pre-filling.

---

## 🛡️ 2. NestJS 11 (Backend Features)

### 📦 A. Modular Architecture
- **`AppModule`**: Main root module integrating `ConfigModule`, `PrismaModule`, `IngredientsModule`, `OrdersModule`, and `AuthModule`.
- **`AuthModule`**: Handles customer registration, credentials authentication, and role authorization.
- **`IngredientsModule`**: Manages ingredient queries, stock toggles, price updates, category defaults, and CRUD operations.
- **`OrdersModule`**: Handles order creation, code generation, status progression updates, and queries.
- **`PrismaModule`**: Provides global database connectivity via `PrismaService`.

---

### 🎯 B. REST API Endpoints & Controllers

#### **Auth Endpoints (`AuthController`)**
- `POST /api/auth/login`: Authenticates user credentials (`LoginDto`) with optional role verification (`ADMIN` / `CUSTOMER`).
- `POST /api/auth/register`: Registers a new customer account (`RegisterDto`).
- `GET /api/auth/user/:id`: Retrieves user profile by ID.

#### **Ingredients Endpoints (`IngredientsController`)**
- `GET /api/ingredients`: Retrieves ingredients (optionally filtered by `category`).
- `GET /api/ingredients/:id`: Retrieves a single ingredient by UUID.
- `POST /api/ingredients`: Creates a new ingredient (`CreateIngredientDto`).
- `PATCH /api/ingredients/:id`: Updates ingredient fields (`UpdateIngredientDto`).
- `PATCH /api/ingredients/:id/toggle-stock`: Toggles `inStock` availability status.
- `DELETE /api/ingredients/:id`: Deletes an ingredient by UUID.

#### **Orders Endpoints (`OrdersController`)**
- `GET /api/orders`: Retrieves all orders (optionally filtered by `status`).
- `GET /api/orders/:idOrCode`: Retrieves an order by UUID or readable order code (e.g. `SC-XXXX`).
- `POST /api/orders`: Submits a new pizza order (`CreateOrderDto`).
- `PATCH /api/orders/:id/status`: Updates kitchen status (`UpdateOrderStatusDto`).

---

### 🛡️ C. DTO Validation & Exception Handling
- **Class Validator & Transformer**: Enforces strict payload validation across all endpoints:
  - `LoginDto`: Validates `@IsEmail()`, `@IsString()`, `@IsNotEmpty()`, and `@IsEnum(Role)`.
  - `RegisterDto`: Validates `@IsEmail()`, `@IsString()`, `@MinLength(6)`, and optional `@IsString()` for phone/address.
  - `CreateIngredientDto`: Validates `@IsString()`, `@IsEnum(IngredientCategory)`, `@IsNumber()`, `@Min(0)`, `@IsBoolean()`, and optional `@IsString()` for description/image.
- **Validation Pipe Whitelisting**: `main.ts` sets `forbidNonWhitelisted: false` on NestJS `ValidationPipe` to sanitize incoming request bodies safely without throwing unexpected property errors.
- **HTTP Exception Filters**: Uses standard NestJS exceptions (`UnauthorizedException`, `BadRequestException`, `NotFoundException`).

---

## 🗄️ 3. Prisma ORM v7 (Database Features)

### 🐘 A. PostgreSQL Driver Adapter Integration
- **Driver Adapter**: Uses `@prisma/adapter-pg` with PostgreSQL 16 (`postgresql://postgres:postgres@localhost:5432/pizzashop?schema=public`).
- **Prisma Client Generation**: Clean compilation to `./node_modules/@prisma/client` via `npx prisma generate`.

---

### 📊 B. Data Models & Enums

#### **`User` Model**
```prisma
enum Role {
  ADMIN
  CUSTOMER
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
```

#### **`Ingredient` Model**
```prisma
enum IngredientCategory {
  SIZE
  CRUST
  SAUCE
  CHEESE
  MEAT
  VEGGIE
  DIP
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
```

#### **`Order`, `OrderItem` & `OrderItemIngredient` Models**
```prisma
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

### 🔄 C. Database Relational Behaviors
- **Cascade Deletion**: `OrderItem` and `OrderItemIngredient` configure `onDelete: Cascade` so deleting an order cleanly removes all child order items and topping snapshots.
- **Category Default Unsetting**: When creating or updating an ingredient with `isDefault: true`, `IngredientsService` executes a Prisma `updateMany` operation:
  ```typescript
  if (data.isDefault) {
    await this.prisma.ingredient.updateMany({
      where: { category: data.category },
      data: { isDefault: false },
    });
  }
  ```
- **Seeding Script (`prisma/seed.ts`)**: Seeds 35 initial ingredients across 7 categories and populates default user accounts:
  - Admin: `admin@slicecraft.com` / `admin123` (`Role.ADMIN`)
  - Customer: `customer@slicecraft.com` / `customer123` (`Role.CUSTOMER`)

---

## 🛠️ 4. Quick Execution Guide

```bash
# 1. Database Schema Sync & Seed
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts

# 2. Run NestJS API (Port 3001)
cd backend && npm run start:dev

# 3. Run Next.js App (Port 3000)
cd frontend && npm run dev

# 4. Verify Production Builds
cd backend && npm run build
cd frontend && npm run build
```
