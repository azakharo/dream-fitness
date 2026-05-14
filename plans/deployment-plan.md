# DreamFitness Deployment Plan

## Overview

Prepare DreamFitness application for production deployment on VPS using Docker Compose.

**Domain:** `fitness.ddns.net`
**SSL:** Let's Encrypt via Certbot
**Architecture:** All services in Docker containers, nginx as reverse proxy

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              VPS                                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Docker Network (dreamfitness-network)           │  │
│  │                                                                    │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │                     nginx (:80/443)                         │  │  │
│  │   │  • Serves frontend static files                            │  │  │
│  │   │  • Reverse proxy /api/* → api-gateway:3000                 │  │  │
│  │   │  • SSL termination (Let's Encrypt)                         │  │  │
│  │   │  • Static file caching                                     │  │  │
│  │   └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                     │  │
│  │                              ▼                                     │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │              api-gateway (:3000 internal)                   │  │  │
│  │   │  • Routes requests to microservices                         │  │  │
│  │   │  • JWT authentication                                       │  │  │
│  │   └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                     │  │
│  │         ┌────────────────────┼────────────────────┐               │  │
│  │         ▼                    ▼                    ▼               │  │
│  │   ┌───────────┐        ┌───────────┐        ┌───────────┐        │  │
│  │   │   auth    │        │ training  │        │  booking  │        │  │
│  │   │ service   │        │ service   │        │ service   │        │  │
│  │   │  :3001    │        │  :3002    │        │  :3003    │        │  │
│  │   └───────────┘        └───────────┘        └───────────┘        │  │
│  │         │                    │                    │              │  │
│  │         └────────────────────┼────────────────────┘              │  │
│  │                              ▼                                     │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │              notification-service (:3004)                    │  │  │
│  │   └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │   ┌─────────────┐              ┌─────────────┐                   │  │
│  │   │  postgres   │              │  rabbitmq   │                   │  │
│  │   │   :5432     │              │   :5672     │                   │  │
│  │   └─────────────┘              └─────────────┘                   │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        Docker Volumes                               │  │
│  │  • postgres_data - PostgreSQL data                                 │  │
│  │  • rabbitmq_data - RabbitMQ data                                    │  │
│  │  • certbot/www - ACME challenge files                               │  │
│  │  • certbot/conf - Let's Encrypt certificates                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Create

### 1. `nginx/Dockerfile`

Multi-stage build:

- Stage 1: Build frontend with Node.js
- Stage 2: nginx-alpine with static files

### 2. `nginx/nginx.conf`

Configuration for:

- HTTP to HTTPS redirect
- Let's Encrypt ACME challenge location
- Reverse proxy `/api/*` to api-gateway:3000
- Static file serving with caching
- Security headers

### 3. `docker-compose.prod.yml` (root)

Combines:

- Backend services (extends backend/docker-compose.prod.yml)
- Nginx container
- Certbot container for SSL renewal

### 4. `.env.production` (root)

Production environment file with real values for VPS deployment.

### 5. `doc/deployment.md`

Complete deployment guide.

---

## Key Configuration Decisions

| Decision            | Choice                   | Reason                                |
| :------------------ | :----------------------- | :------------------------------------ |
| Frontend build      | Multi-stage Dockerfile   | Single container for frontend + nginx |
| API access          | nginx reverse proxy only | Security - no direct backend exposure |
| SSL                 | Let's Encrypt + Certbot  | Production-ready, free certificates   |
| Certificate renewal | Certbot container + cron | Automatic renewal                     |
| Static caching      | 1 year for hashed assets | Performance optimization              |
| index.html caching  | No cache                 | SPA - always fetch latest             |

---

## Request Flow

1. **User** → `https://fitness.ddns.net/` → nginx
2. **Static files** → nginx serves from `/usr/share/nginx/html`
3. **API requests** → `https://fitness.ddns.net/api/*` → nginx → api-gateway:3000
4. **Microservices** → api-gateway routes to appropriate service
5. **Database** → Services connect to postgres:5432
6. **Messages** → Services publish/subscribe via rabbitmq:5672

---

## Next Steps

1. Create `nginx/Dockerfile`
2. Create `nginx/nginx.conf`
3. Create `docker-compose.prod.yml`
4. Create `.env.production.example`
5. Create `doc/deployment.md`
