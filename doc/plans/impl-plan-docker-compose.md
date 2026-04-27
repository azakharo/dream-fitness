# Implementation Plan: Docker Compose for Backend Services

## Overview

Запуск всех backend-сервисов одной командой с единой системой логирования для development и production.

## Current State

- 5 NestJS сервисов в монорепозитории: api-gateway, auth-service, training-service, booking-service, notification-service
- PostgreSQL и RabbitMQ запускаются через docker-compose.base.yml
- Каждый сервис запускается вручную в отдельном терминале

## Target State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Environment                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   PostgreSQL    │  │    RabbitMQ     │  │  API Gateway    │              │
│  │   (port 5432)   │  │  (ports 5672,   │  │  (port 3000)    │              │
│  │                 │  │   15672)        │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └────────┬────────┘              │
│                                                     │                        │
│         ┌───────────────────────────────────────────┼───────────────────┐   │
│         │                                           │                   │   │
│         ▼                                           ▼                   ▼   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────┐ │
│  │  Auth Service   │  │Training Service │  │Booking Service  │  │Notif.  │ │
│  │  (port 3001)    │  │  (port 3002)    │  │  (port 3003)    │  │Service │ │
│  │                 │  │                 │  │                 │  │(3004)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └────────┘ │
│                                                                              │
│  Unified Logs: docker-compose logs -f                                       │
│  Single Command: docker-compose up (or npm run start:dev:all)               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 0: Update SharedConfigModule for Multiple Env Files

**Problem:** Current `SharedConfigModule` loads only one env file (`.env.development` or `.env.production`). After splitting variables into `.env` and `.env.{environment}`, the base `.env` file won't be loaded.

**File to update:** `backend/libs/shared/src/config/shared-config.module.ts`

**Current code:**

```typescript
NestConfigModule.forRoot({
  envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
  isGlobal: true,
});
```

**Updated code:**

```typescript
NestConfigModule.forRoot({
  envFilePath: [
    `.env`, // Base configuration (loaded first)
    `.env.${process.env.NODE_ENV || "development"}`, // Environment-specific (overrides base)
  ],
  isGlobal: true,
});
```

**Why this works:**

- NestJS ConfigModule supports array of file paths
- Files are loaded in order, later files override earlier ones
- Development commands (`npm run start:dev:*`) will load both `.env` and `.env.development`
- Production Docker containers will load both `.env` and `.env.production`

---

### Step 1: Create Environment Files Structure

**Files to create:**

1. `.env` - Shared configuration (ports, URLs, exchange name)
2. `.env.development` - Development-specific (JWT secret, SMTP credentials)
3. `.env.production` - Production-specific (production secrets, SMTP)
4. Update `.env.example` - Template for documentation

**File content:**

```env
# .env - Shared between development and production

# Service Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
TRAINING_SERVICE_PORT=3002
BOOKING_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004

# Service URLs (localhost for both environments)
AUTH_SERVICE_URL=http://localhost:3001
TRAINING_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004

# Database
DATABASE_NAME=dreamfitness

# RabbitMQ
RABBITMQ_EXCHANGE=dreamfitness.exchange
```

```env
# .env.development - Development-only settings

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dreamfitness
DATABASE_PASSWORD=dreamfitness123

# RabbitMQ
RABBITMQ_URL=amqp://dreamfitness:dreamfitness123@localhost:5672

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TTL=15h
JWT_REFRESH_TTL=7d

# Email (SMTP) - Ethereal Email for development
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mathew5@ethereal.email
SMTP_PASSWORD=3rnyPsPHXs8H4bDTXY
SMTP_FROM="DreamFitness <noreply@dreamfitness.club>"

# Migrations
RUN_MIGRATIONS=true
```

```env
# .env.production - Production-only settings

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dreamfitness
DATABASE_PASSWORD=dreamfitness123

# RabbitMQ
RABBITMQ_URL=amqp://dreamfitness:dreamfitness123@localhost:5672

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TTL=15h
JWT_REFRESH_TTL=7d

# Email (SMTP) - Ethereal Email for development
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mathew5@ethereal.email
SMTP_PASSWORD=3rnyPsPHXs8H4bDTXY
SMTP_FROM="DreamFitness <noreply@dreamfitness.club>"

# Migrations
RUN_MIGRATIONS=false
```

---

### Step 2: Create Dockerfile for Services

**File: `backend/Dockerfile`**

Multi-stage Dockerfile для всех сервисов:

```dockerfile
# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:20-alpine AS base

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
RUN npm run build:all

# Default command (overridden by docker-compose)
CMD ["npm", "run", "start:dev:api-gateway"]

# ============================================
# Stage 3: Production - Minimal image
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/nest-cli.json ./nest-cli.json

# Production command set per service in docker-compose
```

**File: `backend/Dockerfile.dev`** (Alternative for development with hot-reload)

```dockerfile
# Development-only Dockerfile with hot-reload support
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (will be mounted as volume for hot-reload)
COPY . .

# Build all services
RUN npm run build:all

# Keep container running (command set in docker-compose)
CMD ["tail", "-f", "/dev/null"]
```

---

### Step 3: Create docker-compose.dev.yml

**File: `backend/docker-compose.dev.yml`**

```yaml
# Development override - extends docker-compose.base.yml
# Usage: docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up

services:
  # ============================================
  # Infrastructure (from docker-compose.base.yml)
  # ============================================
  postgres:
    extends:
      file: docker-compose.base.yml
      service: postgres

  rabbitmq:
    extends:
      file: docker-compose.base.yml
      service: rabbitmq

  # ============================================
  # Application Services
  # ============================================
  api-gateway:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dreamfitness-api-gateway
    volumes:
      - ./apps:/app/apps:cached
      - ./libs:/app/libs:cached
      - ./node_modules:/app/node_modules:delegated
    ports:
      - "${API_GATEWAY_PORT:-3000}:${API_GATEWAY_PORT:-3000}"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: npm run start:dev:api-gateway
    networks:
      - dreamfitness-network

  auth-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dreamfitness-auth-service
    volumes:
      - ./apps:/app/apps:cached
      - ./libs:/app/libs:cached
      - ./node_modules:/app/node_modules:delegated
    ports:
      - "${AUTH_SERVICE_PORT:-3001}:${AUTH_SERVICE_PORT:-3001}"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: npm run start:dev:auth-service
    networks:
      - dreamfitness-network

  training-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dreamfitness-training-service
    volumes:
      - ./apps:/app/apps:cached
      - ./libs:/app/libs:cached
      - ./node_modules:/app/node_modules:delegated
    ports:
      - "${TRAINING_SERVICE_PORT:-3002}:${TRAINING_SERVICE_PORT:-3002}"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: npm run start:dev:training-service
    networks:
      - dreamfitness-network

  booking-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dreamfitness-booking-service
    volumes:
      - ./apps:/app/apps:cached
      - ./libs:/app/libs:cached
      - ./node_modules:/app/node_modules:delegated
    ports:
      - "${BOOKING_SERVICE_PORT:-3003}:${BOOKING_SERVICE_PORT:-3003}"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: npm run start:dev:booking-service
    networks:
      - dreamfitness-network

  notification-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dreamfitness-notification-service
    volumes:
      - ./apps:/app/apps:cached
      - ./libs:/app/libs:cached
      - ./node_modules:/app/node_modules:delegated
    ports:
      - "${NOTIFICATION_SERVICE_PORT:-3004}:${NOTIFICATION_SERVICE_PORT:-3004}"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
      - .env.development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: npm run start:dev:notification-service
    networks:
      - dreamfitness-network

networks:
  dreamfitness-network:
    driver: bridge
```

---

### Step 4: Create docker-compose.prod.yml

**File: `backend/docker-compose.prod.yml`**

```yaml
# Production override - extends docker-compose.base.yml
# Usage: docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d

services:
  # ============================================
  # Infrastructure (from docker-compose.base.yml)
  # ============================================
  postgres:
    extends:
      file: docker-compose.base.yml
      service: postgres
    restart: always

  rabbitmq:
    extends:
      file: docker-compose.base.yml
      service: rabbitmq
    restart: always

  # ============================================
  # Application Services
  # ============================================
  api-gateway:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: dreamfitness-api-gateway
    ports:
      - "${API_GATEWAY_PORT:-3000}:${API_GATEWAY_PORT:-3000}"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: always
    command: node dist/apps/api-gateway/main.js
    networks:
      - dreamfitness-network

  auth-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: dreamfitness-auth-service
    ports:
      - "${AUTH_SERVICE_PORT:-3001}:${AUTH_SERVICE_PORT:-3001}"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: always
    command: node dist/apps/auth-service/main.js
    networks:
      - dreamfitness-network

  training-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: dreamfitness-training-service
    ports:
      - "${TRAINING_SERVICE_PORT:-3002}:${TRAINING_SERVICE_PORT:-3002}"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: always
    command: node dist/apps/training-service/main.js
    networks:
      - dreamfitness-network

  booking-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: dreamfitness-booking-service
    ports:
      - "${BOOKING_SERVICE_PORT:-3003}:${BOOKING_SERVICE_PORT:-3003}"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: always
    command: node dist/apps/booking-service/main.js
    networks:
      - dreamfitness-network

  notification-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: dreamfitness-notification-service
    ports:
      - "${NOTIFICATION_SERVICE_PORT:-3004}:${NOTIFICATION_SERVICE_PORT:-3004}"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: always
    command: node dist/apps/notification-service/main.js
    networks:
      - dreamfitness-network

networks:
  dreamfitness-network:
    driver: bridge
```

---

### Step 5: Update docker-compose.base.yml

**File: `backend/docker-compose.base.yml`** (update existing)

```yaml
# Base infrastructure configuration
# Extended by docker-compose.dev.yml and docker-compose.prod.yml

services:
  postgres:
    image: postgres:16-alpine
    container_name: dreamfitness-postgres
    environment:
      POSTGRES_USER: ${DATABASE_USER:-dreamfitness}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-dreamfitness123}
      POSTGRES_DB: ${DATABASE_NAME:-dreamfitness}
    ports:
      - "${DATABASE_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER:-dreamfitness}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - dreamfitness-network

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: dreamfitness-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-dreamfitness}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD:-dreamfitness123}
    ports:
      - "5672:5672" # AMQP
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - dreamfitness-network

volumes:
  postgres_data:
  rabbitmq_data:

networks:
  dreamfitness-network:
    driver: bridge
```

---

### Step 6: Add npm Scripts

**Update `backend/package.json`:**

```json
{
  "scripts": {
    "docker:dev": "docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up",
    "docker:dev:build": "docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml build",
    "docker:dev:down": "docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down",
    "docker:dev:logs": "docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f",
    "docker:prod": "docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d",
    "docker:prod:build": "docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml build",
    "docker:prod:down": "docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down",
    "docker:prod:logs": "docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml logs -f"
  }
}
```

---

### Step 7: Create .dockerignore

**File: `backend/.dockerignore`**

```
node_modules
dist
.git
.gitignore
*.md
.env
.env.*
!.env.example
test
coverage
.vscode
.idea
*.log
npm-debug.log*
Dockerfile
docker-compose*.yml
.dockerignore
```

---

### Step 8: Update Service Configurations

Services need to listen on `0.0.0.0` instead of `localhost` when running in Docker.

**Update each `main.ts` file:**

```typescript
// apps/api-gateway/src/main.ts (and similar for other services)
await app.listen(process.env.API_GATEWAY_PORT ?? 3000, "0.0.0.0");
```

---

## Usage Commands

### Development

```bash
# Start all services with hot-reload
npm run docker:dev

# View logs (all services)
npm run docker:dev:logs

# View logs (specific service)
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f api-gateway

# Stop all services
npm run docker:dev:down

# Rebuild images
npm run docker:dev:build
```

### Production

```bash
# Build production images
npm run docker:prod:build

# Start all services
npm run docker:prod

# View logs
npm run docker:prod:logs

# Stop all services
npm run docker:prod:down
```

### Database Migrations

```bash
# Run migrations manually (production)
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml exec api-gateway npm run db:migrate

# Or locally (if services not running)
npm run db:migrate
```

---

## Log Output Example

```
dreamfitness-postgres   | LOG:  database system is ready to accept connections
dreamfitness-rabbitmq   | Server startup complete; 0 plugins started.
dreamfitness-api-gateway | [Nest] LOG [NestApplication] Nest application successfully started
dreamfitness-auth-service | [Nest] LOG [InstanceLoader] AuthModule dependencies initialized
dreamfitness-training-service | [Nest] LOG [InstanceLoader] TrainingModule dependencies initialized
dreamfitness-booking-service | [Nest] LOG [InstanceLoader] BookingModule dependencies initialized
dreamfitness-notification-service | [Nest] LOG [InstanceLoader] NotificationModule dependencies initialized
```

---

## Files Summary

| File                                             | Purpose                              |
| ------------------------------------------------ | ------------------------------------ |
| `libs/shared/src/config/shared-config.module.ts` | Update to support multiple env files |
| `.env`                                           | Shared configuration (ports, URLs)   |
| `.env.development`                               | Development-only settings            |
| `.env.production`                                | Production-only settings             |
| `Dockerfile`                                     | Multi-stage production build         |
| `Dockerfile.dev`                                 | Development build with hot-reload    |
| `docker-compose.base.yml`                        | Base infrastructure                  |
| `docker-compose.dev.yml`                         | Development override                 |
| `docker-compose.prod.yml`                        | Production override                  |
| `.dockerignore`                                  | Exclude files from Docker build      |

---

## Next Steps After Approval

1. **Update SharedConfigModule** to support multiple env files
2. Create all configuration files (`.env`, `.env.development`, `.env.production`)
3. Update `main.ts` files to listen on `0.0.0.0`
4. Test development setup (`npm run docker:dev`)
5. Test production build (`npm run docker:prod`)
6. Update documentation
