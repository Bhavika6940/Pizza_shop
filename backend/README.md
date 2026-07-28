<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🍕 SliceCraft — NestJS Backend API

The backend server for the SliceCraft Pizza Shop application. Built on **NestJS 11**, using **Prisma ORM v7** with a **PostgreSQL** database, it provides RESTful endpoints to manage ingredients inventory, configure customizable pizzas, process customer orders, and track order fulfillment statuses in real time.

---

## 🛠️ Tech Stack & Features

- **NestJS v11**: Structured TypeScript framework using standard controllers, services, and modules.
- **Prisma ORM v7**: Type-safe database queries integrated via `@prisma/client` and utilizing `@prisma/adapter-pg` driver adapter.
- **PostgreSQL**: Relational database storage.
- **Validation**: Data Transfer Objects (DTOs) with automatic request payload validation using `class-validator` and `class-transformer`.
- **CORS Enabled**: Configured to connect seamlessly with the Next.js frontend application.

---

## 📂 Backend Project Structure

```text
backend/
├── src/
│   ├── main.ts               # Application entry point, global filters, and CORS settings
│   ├── app.module.ts         # Main root module importing submodules
│   ├── app.controller.ts     # Health-check endpoints
│   ├── app.service.ts        # App logic
│   │
│   ├── ingredients/          # Ingredients Module
│   │   ├── ingredients.controller.ts  # Handles GET/POST/PATCH/DELETE for menu ingredients
│   │   ├── ingredients.service.ts     # Business logic for stock status & pricing
│   │   └── dto/                       # Request body schemas
│   │
│   ├── orders/               # Orders & Tracking Module
│   │   ├── orders.controller.ts       # Handles order submission, tracking, status updates
│   │   ├── orders.service.ts          # Business logic for custom pricing & order flows
│   │   └── dto/                       # DTOs validating customer & pizza order fields
│   │
│   └── prisma/               # Prisma Database Module
│       ├── prisma.module.ts           # Exports PrismaService for injection
│       └── prisma.service.ts          # Extends PrismaClient for database connection
├── test/                     # E2E test suites
├── Dockerfile                # Multi-stage Docker build configuration
└── package.json              # Backend dependencies & script tasks
```

---

## ⚙️ Project Setup

### 1. Installation

From the `backend` directory, run:

```bash
npm install
```

### 2. Configuration
Ensure the parent folder has a `.env` file containing:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pizzashop?schema=public"
PORT=3001
```

---

## 🚀 Running the Server

```bash
# Development mode with watch compile
npm run start:dev

# Production mode
npm run start:prod
```

Once running, the API base URL will be: `http://localhost:3001/api`.

---

## 📡 REST API Specifications

### 1. Ingredients (`/api/ingredients`)
Manage ingredients (Sizes, Crusts, Sauces, Cheeses, Meats, Veggies, Dips).

- **`GET /api/ingredients`**: Fetch all ingredients list.
- **`POST /api/ingredients`**: Create a new ingredient entry.
- **`PATCH /api/ingredients/:id`**: Update details, price, or toggle stock availability (`inStock: boolean`).
- **`DELETE /api/ingredients/:id`**: Delete an ingredient.

### 2. Orders (`/api/orders`)
Submit and track customer orders.

- **`POST /api/orders`**: Create a new order. Automatically validates pricing, custom ingredients, and builds order-item relations.
- **`GET /api/orders`**: Retrieve all historical and active orders (used in Admin dashboard).
- **`GET /api/orders/track/:orderCode`**: Get real-time status of an order using its unique code.
- **`PATCH /api/orders/:id/status`**: Update the stage of an order (Admin control).
  - Valid statuses: `PENDING`, `PREPARING`, `BAKING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```
