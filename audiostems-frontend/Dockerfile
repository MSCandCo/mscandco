# Multi-stage Dockerfile for MSC & Co Frontend
# Development and Production optimized

# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Development stage
FROM base AS development
# Install all dependencies including devDependencies
RUN npm ci --legacy-peer-deps
COPY . .

# Expose port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
# Install all dependencies
RUN npm ci --legacy-peer-deps
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Production command
CMD ["node", "server.js"] 