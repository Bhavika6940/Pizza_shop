FROM node:20-alpine AS builder

WORKDIR /app

# Copy root prisma schema and backend package files
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY backend/package.json backend/package-lock.json ./backend/

# Install dependencies in backend
WORKDIR /app/backend
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Copy root prisma directory so prisma can generate client
COPY prisma /app/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=/app/prisma/schema.prisma

# Build NestJS app
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/prisma /app/prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
