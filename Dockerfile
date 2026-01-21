# ==========================================
# HabitFlow - Dockerfile for EasyPanel
# Multi-stage build for React/Vite PWA + Nginx
# ==========================================

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (use npm install as fallback if ci fails)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application (includes PWA assets generation)
RUN npm run build

# ==========================================
# Stage 2: Production image with Nginx
# ==========================================
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx static files and config
RUN rm -rf /usr/share/nginx/html/* && rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage (includes sw.js, manifest.webmanifest)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy PWA icons from public folder
COPY --from=builder /app/public /usr/share/nginx/html

# Create a simple healthcheck file
RUN echo "OK" > /usr/share/nginx/html/health.txt

# Add healthcheck for EasyPanel
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
