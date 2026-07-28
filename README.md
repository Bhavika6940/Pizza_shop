# 🍕 SliceCraft — Full-Stack Pizza Ordering & Management Platform

A modern, full-stack online pizza ordering system built with **Next.js 16**, **NestJS 11**, **Prisma ORM v7**, and **PostgreSQL**. Features an interactive custom pizza builder, preset signature pizzas, real-time order tracking, and a comprehensive admin dashboard.

---

## 🚀 Features

### 🛒 Customer Experience
- **Interactive Custom Pizza Builder**: Build customized pizzas with dynamic visual canvas representation, size selection, crust types, sauces, cheeses, meats, vegetables, and gourmet dips.
- **Real-Time Dynamic Pricing**: Instant updates to total item cost based on selected ingredients and sizes.
- **Preset Signature Pizzas**: Quick selection from artisan preset recipes (e.g., Margherita Supreme, Meat Lover's Feast, Veggie Deluxe).
- **Cart & Checkout Workflow**: Slide-over cart drawer supporting quantity adjustments, delivery vs. pickup preference, payment methods (Cash/Card), and special instructions.
- **Live Order Tracker**: Track active orders stage-by-stage (*Pending* ➔ *Preparing* ➔ *Baking* ➔ *Out for Delivery* ➔ *Delivered*) using unique order tracking codes.

### ⚙️ Admin Management Dashboard
- **Menu & Ingredient Control**: Manage stock availability (`inStock`), update ingredient pricing, and add/edit menu items.
- **Order Pipeline Management**: View incoming orders, filter by status, search by order code or customer details, and transition order statuses in real time.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Backend Framework** | [NestJS 11](https://nestjs.com/) (TypeScript / Node.js) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma ORM v7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **Validation** | `class-validator` + `class-transformer` |
| **Containerization** | [Docker](https://www.docker.com/) & Docker Compose |

---

## 📁 Project Structure

```text
Pizza_shop/
├── backend/                  # NestJS REST API Server
│   ├── src/
│   │   ├── ingredients/      # Ingredients module (CRUD & stock management)
│   │   ├── orders/           # Orders module (Creation, status pipeline, tracking)
│   │   ├── prisma/           # Prisma service integration module
│   │   ├── app.module.ts     # Main application root module
│   │   └── main.ts           # NestJS entry point & CORS configuration
│   └── Dockerfile            # Container configuration for backend
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Layouts, Pages, Globals CSS)
│   │   ├── components/       # UI Components (PizzaBuilder, AdminDashboard, OrderTracker, etc.)
│   │   ├── lib/              # API Client utilities & helper functions
│   │   └── types/            # TypeScript interfaces & Enums
│   └── Dockerfile            # Container configuration for frontend
├── prisma/                   # Prisma Schema & Database Utilities
│   ├── schema.prisma         # Database models, enums & PostgreSQL config
│   └── seed.ts               # Database seed script for initial ingredients & preset data
├── docker-compose.yml        # Orchestration for PostgreSQL, Backend, and Frontend
├── package.json              # Root dependencies (Prisma CLI & Drivers)
└── .env                      # Environment configuration variables
```

---

## ⚡ Quick Start with Docker (Recommended)

The easiest way to run the complete stack is using Docker Compose.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Run the Stack
Run the following command in the project root:

```bash
docker-compose up --build
```

This will launch:
- 🐘 **PostgreSQL**: `localhost:5432`
- ⚙️ **Backend API**: `http://localhost:3001`
- 💻 **Frontend App**: `http://localhost:3000`

---

## 🛠️ Manual Local Development Setup

If you prefer to run services manually for local development:

### 1. Environment Configuration
Ensure `.env` exists in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pizzashop?schema=public"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 2. Start PostgreSQL Container
Start only the PostgreSQL database:

```bash
docker-compose up postgres -d
```

### 3. Database Migration & Seeding
Push the Prisma schema to PostgreSQL and seed initial ingredients:

```bash
# Push schema changes to database
npx prisma db push

# Seed initial ingredient menu items
npx tsx prisma/seed.ts
```

### 4. Start Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```
Backend will start on `http://localhost:3001` (API base route: `http://localhost:3001/api`).

### 5. Start Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:3000`.

---

## 📡 REST API Summary

### Ingredients API (`/api/ingredients`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ingredients` | Retrieve all ingredients (or filter by category) |
| `POST` | `/api/ingredients` | Add a new ingredient (Admin) |
| `PATCH` | `/api/ingredients/:id` | Update ingredient details or stock availability |
| `DELETE` | `/api/ingredients/:id` | Remove an ingredient |

### Orders API (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Submit a new customer order |
| `GET` | `/api/orders` | Fetch all orders (Admin dashboard) |
| `GET` | `/api/orders/track/:orderCode` | Track single order by order code |
| `PATCH` | `/api/orders/:id/status` | Update order status (`PENDING`, `PREPARING`, `BAKING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) |

---

## 🗄️ Database Schema Overview

The database uses PostgreSQL with the following core entities:

- **`Ingredient`**: Stores available pizza components (`SIZE`, `CRUST`, `SAUCE`, `CHEESE`, `MEAT`, `VEGGIE`, `DIP`), prices, stock flags (`inStock`), and image URLs.
- **`Order`**: Stores customer details, delivery address, phone, `OrderType` (*DELIVERY* / *PICKUP*), `PaymentMethod` (*CASH* / *CARD*), `OrderStatus`, and total pricing.
- **`OrderItem`**: Individual items inside an order with custom specifications.
- **`OrderItemIngredient`**: Detailed snapshot of ingredient choices for each order item.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
