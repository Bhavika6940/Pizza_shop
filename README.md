# 🍕 SliceCraft Artisan Pizzeria

SliceCraft is a modern, high-performance, full-stack web application designed for a premium artisan pizzeria. It features a real-time custom pizza builder, preset artisan menus, a live step-by-step order tracking system with customer track record history, a dual-role authentication system (Customer & Admin), and a full-featured Admin Portal for kitchen order management and ingredient CRUD operations.

---

## 🚀 Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Vanilla CSS + Tailwind CSS (Glassmorphism design aesthetic, vibrant gradients, micro-animations)
- **Icons & Effects**: Lucide React, Canvas Confetti
- **State & Auth**: React Context API (`AuthContext`, `ToastProvider`) with `localStorage` persistence

### **Backend**
- **Framework**: NestJS 11 (Modular REST API)
- **ORM**: Prisma ORM v7 (`@prisma/adapter-pg`)
- **Validation**: Class Validator & Class Transformer (whitelist & sanitization)

### **Database**
- **DBMS**: PostgreSQL 16 (running via Docker container on port `5432`)
- **Schema**: Strongly typed Prisma Schema (`User`, `Ingredient`, `Order`, `OrderItem`, `OrderItemIngredient`, `Role`, `IngredientCategory`, `OrderStatus`, `OrderType`, `PaymentMethod`)

---

## ✨ Key Features & Development Highlights

### 1. 🍕 Custom Pizza Builder & Presets Menu
- **Interactive Builder**: Real-time selection of Pizza Sizes, Crusts, Sauces, Cheeses, Meats, Veggies, and Dips.
- **Dynamic Pricing**: Instant item price recalculation as toppings are selected or modified.
- **Presets Menu**: Pre-configured artisan pizzas (e.g. *Supreme Overload*, *Truffle Mushroom Bliss*, *BBQ Chicken Feast*) with 1-click ordering and "Customize Preset" capabilities.

### 2. 🔐 Dual-Role Authentication System
- **Customer Authentication**:
  - Dedicated Customer Sign-In and Registration modals.
  - Session persistence in `localStorage`.
  - **Auto-Fill Checkout**: Automatically pre-fills logged-in customer's name, phone number, and delivery address during checkout.
  - **Quick Demo Customer Login**: 1-click login as demo customer `Alex Mercer`.
- **Admin Authentication Gate**:
  - Protected standalone route at `/admin`.
  - Admin login screen guarding kitchen operations (`admin@slicecraft.com` / `admin123`).
  - **Quick Demo Admin Login**: 1-click login as `Master Pizzaiolo Admin`.

### 3. 🛵 Live Order Tracking & Customer Track Record
- **Real-Time Stepper Timeline**: Step-by-step preparation progress (`PENDING` ➔ `PREPARING` ➔ `BAKING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **Customer Track Record**: Dedicated order history list displaying all past orders placed by the customer.
- **Admin Status Synchronization**: Customer track record cards reflect the exact live kitchen status currently set by store admins, updating automatically in real time.
- **1-Click Live Inspection**: Click "Track Live →" on any past order to load its interactive preparation timeline.

### 4. 🛡️ Admin Portal & Ingredient CRUD Operations
- **Live Orders Manager**: View incoming orders, filter by status, and update kitchen statuses in real time.
- **Ingredient Inventory CRUD**:
  - Add new ingredients with categories, pricing, descriptions, images, and default category flags.
  - Edit existing ingredient details via a glassmorphic modal.
  - Delete ingredients with confirmation dialogs.
  - Toggle stock availability instantly (`In Stock` / `Out of Stock`).
  - Inline price editing directly within the inventory table.
  - Automatic `isDefault` state management (unsetting previous category defaults when a new default is assigned).

### 5. 🔔 Glassmorphism Toast Notification System
- Custom animated notification toasts (`success`, `error`, `info`) with auto-dismissal (4s) and smooth slide-in transitions.
- Integrated across cart actions, order placements, auth events, and admin CRUD operations.

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@slicecraft.com` | `admin123` | Master Pizzaiolo Admin (Full Admin Portal Access) |
| **Customer** | `customer@slicecraft.com` | `customer123` | Alex Mercer (Saved Address & Order History) |

---

## 📁 Project Structure

```
Pizza_shop/
├── backend/                  # NestJS 11 REST API Service
│   ├── src/
│   │   ├── auth/             # Auth Module (Login, Register, DTOs)
│   │   ├── ingredients/      # Ingredients Module (CRUD & Stock Service)
│   │   ├── orders/           # Orders Module (Order Processing & Status Updates)
│   │   ├── prisma/           # Prisma Service & Database Connection
│   │   ├── app.module.ts     # Root Module Configuration
│   │   └── main.ts           # Entrypoint & Validation Pipe Setup
│   └── package.json
├── frontend/                 # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Main Storefront (Builder, Presets, Tracker)
│   │   │   └── admin/        # Dedicated Admin Portal Route (/admin)
│   │   ├── components/       # UI Components (PizzaBuilder, PresetPizzas, OrderTracker, AdminDashboard, AuthModal, CheckoutModal, ToastProvider, Navbar, CartDrawer)
│   │   ├── context/          # AuthContext (Customer & Admin Session Management)
│   │   ├── lib/              # API Client & Fallback Local Storage Simulation
│   │   └── types/            # TypeScript Interface Definitions
│   └── package.json
├── prisma/
│   ├── schema.prisma         # PostgreSQL Models (User, Ingredient, Order, etc.)
│   └── seed.ts               # Database Seeding Script (35 Ingredients + Admin/Customer Users)
└── README.md
```

---

## ⚙️ Setup & Running Instructions

### **1. Prerequisites**
- **Node.js**: `v18+` or `v20+`
- **npm**: `v9+`
- **PostgreSQL**: Docker container running on port `5432` (`postgresql://postgres:postgres@localhost:5432/pizzashop?schema=public`)

---

### **2. Database Migration & Seeding**

Run the following commands in the root directory to sync the database schema and populate initial ingredients & default user accounts:

```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial 35 ingredients and Admin/Customer accounts
npx tsx prisma/seed.ts
```

---

### **3. Running Backend (NestJS)**

```bash
cd backend
npm install
npm run start:dev
```
The NestJS API server will run at: `http://localhost:3001/api`

---

### **4. Running Frontend (Next.js)**

```bash
cd frontend
npm install
npm run dev
```
The web application will be accessible at:
- **Storefront**: `http://localhost:3000/`
- **Admin Portal**: `http://localhost:3000/admin`

---

### **5. Building for Production**

To build both services for production deployment:

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd frontend
npm run build
```

---

## 📄 License
This project is open-source under the MIT License.
