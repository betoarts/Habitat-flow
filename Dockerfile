# ==========================================
# HabitFlow - Fullstack Dockerfile
# Builds React Frontend + Node Backend
# ==========================================

# ------------------------------------------
# Stage 1: Build Frontend (Vite)
# ------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend with relative API URL (empty string means relative path)
# This allows the frontend to call /api/... on the same domain
ENV VITE_API_URL=""
RUN npm run build

# ------------------------------------------
# Stage 2: Build Backend (Node/Express)
# ------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/server

# Copy server package files
COPY server/package.json server/package-lock.json* ./

# Install server dependencies
RUN npm install

# Copy server source code
COPY server/ ./

# Build backend (TypeScript -> JavaScript)
RUN npm run build

# ------------------------------------------
# Stage 3: Production Runner
# ------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Install production dependencies for backend only
COPY server/package.json ./
RUN npm install --production

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./dist

# Copy built backend assets
COPY --from=backend-builder /app/server/dist ./server/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=80
# FRONTEND_PATH relative to server/dist/server.js -> ../../dist
ENV FRONTEND_PATH=/app/dist

# Create persistence directory
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose port
EXPOSE 80

# Start server
CMD ["node", "server/dist/server.js"]
