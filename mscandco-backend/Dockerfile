# Multi-stage Dockerfile for MSC & Co Backend (Strapi)
# Development and Production optimized

# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    make \
    python3 \
    pkgconfig \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && rm -rf /var/cache/apk/*

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
# Install all dependencies including devDependencies
RUN npm ci
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S strapi -u 1001

# Create necessary directories with proper permissions
RUN mkdir -p /app/build /app/.tmp /app/.cache && \
    chown -R strapi:nodejs /app

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:1337/api/health || exit 1

# Development command
CMD ["npm", "run", "develop"]

# Build stage
FROM base AS builder
# Install all dependencies
RUN npm ci
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    make \
    python3 \
    pkgconfig \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S strapi -u 1001

# Copy built application
COPY --from=builder --chown=strapi:nodejs /app/build ./build
COPY --from=builder --chown=strapi:nodejs /app/package*.json ./
COPY --from=builder --chown=strapi:nodejs /app/public ./public
COPY --from=builder --chown=strapi:nodejs /app/src ./src
COPY --from=builder --chown=strapi:nodejs /app/config ./config
COPY --from=builder --chown=strapi:nodejs /app/database ./database
COPY --from=builder --chown=strapi:nodejs /app/extensions ./extensions
COPY --from=builder --chown=strapi:nodejs /app/favicon.png ./favicon.png

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:1337/api/health || exit 1

# Production command
CMD ["npm", "start"]
