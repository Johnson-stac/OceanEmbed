# =============================================================================
# Stage 1: Build the Vite frontend
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for the build)
RUN npm ci

# Copy source code
COPY . .

# Build the Vite frontend → outputs to /app/dist
RUN npm run build

# =============================================================================
# Stage 2: Production image
# =============================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create a non-root user for security
RUN addgroup -g 1001 -S oceanembed && \
    adduser -S oceanembed -u 1001 -G oceanembed

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies + tsx for TS execution
RUN npm ci --omit=dev && npm install tsx && npm cache clean --force

# Copy the production server
COPY server/ ./server/

# Copy the built frontend from Stage 1
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
RUN chown -R oceanembed:oceanembed /app

USER oceanembed

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]

# Start the production server
CMD ["npx", "tsx", "server/index.ts"]
