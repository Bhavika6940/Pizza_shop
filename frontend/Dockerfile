FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
