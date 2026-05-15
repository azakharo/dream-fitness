# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies only (for better caching)
COPY package*.json ./
RUN npm ci

# ============================================
# Stage 2: Development - Build and dev tools
# ============================================
FROM base AS development

# Copy source code
COPY . .

# Build all services
RUN npm run build

# Default command (overridden by docker-compose)
CMD ["npm", "run", "start:dev:api-gateway"]

# ============================================
# Stage 3: Production - Minimal image
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/nest-cli.json ./nest-cli.json
COPY --from=development /app/scripts ./scripts

# Make entrypoint script executable
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Production command set per service in docker-compose