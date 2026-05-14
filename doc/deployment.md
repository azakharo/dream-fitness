# DreamFitness Deployment Guide

This guide covers the complete deployment process for DreamFitness using Docker Compose on a VPS.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Server Setup](#4-server-setup)
4. [Application Deployment](#5-application-deployment)
5. [SSL Certificate Configuration](#6-ssl-certificate-configuration)
6. [Environment Variables Reference](#7-environment-variables-reference)
7. [Database Management](#8-database-management)
8. [Monitoring and Logging](#9-monitoring-and-logging)
9. [Update Procedures](#10-update-procedures)
10. [Troubleshooting Guide](#11-troubleshooting-guide)
11. [Architecture Overview](#12-architecture-overview)

---

## 1. Overview

### Application Components

| Component        | Technology   | Description                                     |
| :--------------- | :----------- | :---------------------------------------------- |
| Frontend         | React + Vite | SPA for fitness club management                 |
| API Gateway      | NestJS       | Routes requests to microservices                |
| Auth Service     | NestJS       | Authentication and user management              |
| Training Service | NestJS       | Training sessions management                    |
| Booking Service  | NestJS       | Booking and waitlist management                 |
| Notification Svc | NestJS       | Email notifications                             |
| Database         | PostgreSQL   | Persistent storage                              |
| Message Broker   | RabbitMQ     | Async communication between services            |
| Nginx            | Nginx        | Serves frontend, reverse proxy, SSL termination |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              VPS                                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                  Docker Network (dreamfitness-network)             │  │
│  │                                                                    │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │                     nginx (:80/443)                          │  │  │
│  │   │  • Serves frontend static files                              │  │  │
│  │   │  • Reverse proxy /api/* → api-gateway:3000                  │  │  │
│  │   │  • SSL termination (Let's Encrypt)                          │  │  │
│  │   │  • Static file caching                                       │  │  │
│  │   └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                     │  │
│  │                              ▼                                     │  │
│  │   ┌─────────────────────────────────────────────────────────────┐  │  │
│  │   │              api-gateway (:3000 internal)                    │  │  │
│  │   │  • Routes requests to microservices                         │  │  │
│  │   │  • JWT authentication                                        │  │  │
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
│  │  • rabbitmq_data - RabbitMQ data                                   │  │
│  │  • certbot/www - ACME challenge files                               │  │
│  │  • certbot/conf - Let's Encrypt certificates                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Request** → Nginx (port 80/443)
2. **Static Files** → Served directly from nginx (frontend bundle)
3. **API Requests** → Proxied to api-gateway (port 3000 internal)
4. **Microservices** → api-gateway routes to appropriate service
5. **Database Queries** → Services connect to postgres (port 5432 internal)
6. **Messages** → Services publish/subscribe via rabbitmq (port 5672 internal)

---

## 2. Prerequisites

### VPS Requirements

| Resource | Minimum          | Recommended      |
| :------- | :--------------- | :--------------- |
| RAM      | 4 GB             | 8 GB             |
| CPU      | 2 vCPU           | 4 vCPU           |
| Storage  | 40 GB SSD        | 80 GB SSD        |
| OS       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Required Software

- Docker Engine 24.0+
- Docker Compose v2.0+

### Domain Name

A domain name configured via noip.com (or similar) pointing to your server IP.

**Example:** `fitness.ddns.net` → Your VPS IP address

---

## 3. Server Setup

### Initial Server Security

#### SSH Key Authentication

1. Generate SSH keys on your local machine:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy the public key to your server:

```bash
ssh-copy-id root@your_server_ip
```

3. Test SSH key login:

```bash
ssh root@your_server_ip
```

4. Disable password authentication by editing `/etc/ssh/sshd_config`:

```bash
# Set these options
PasswordAuthentication no
PubkeyAuthentication yes
```

5. Restart SSH service:

```bash
sudo systemctl restart sshd
```

#### Firewall Setup

1. Update package lists:

```bash
sudo apt update
```

2. Install UFW (Uncomplicated Firewall):

```bash
sudo apt install ufw
```

3. Allow necessary ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

4. Enable the firewall:

```bash
sudo ufw enable
```

5. Verify status:

```bash
sudo ufw status
```

### Docker Installation

1. Install required packages:

```bash
sudo apt install -y ca-certificates curl gnupg
```

2. Add Docker's official GPG key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

3. Set up the Docker repository:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. Install Docker Engine:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5. Start and enable Docker:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

6. Add your user to the docker group (optional, for non-root access):

> **Note:** Skip this step if you're logged in as `root`. Root already has full Docker access.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

7. Verify Docker installation:

```bash
docker --version
docker compose version
```

---

## 4. Application Deployment

### Clone Repository

1. Clone the DreamFitness repository:

```bash
git clone <your-repository-url> dreamfitness
cd dreamfitness
```

### Environment Configuration

The `.env.production` file is already in the repository with default values.

### Initial SSL Certificate Setup

Before starting the application, obtain initial SSL certificates:

```bash
# Create directories for certbot
mkdir -p certbot/www certbot/conf

# Request initial certificate (replace with your email)
sudo docker run --rm -v ./certbot/www:/var/www/certbot -v ./certbot/conf:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot --email your-email@example.com -d fitness.ddns.net --agree-tos --no-eff-email
```

### Build and Start Containers

1. Build and start all services:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

2. Wait for all services to become healthy:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

All services should show `healthy` in the status column.

### Run Database Migrations

After all services are healthy, run migrations:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api-gateway npm run migration:run:prod
```

Create admin and test users (optional):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api-gateway npm run db:seed:prod
```

### Verify Deployment

1. Check container logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

2. Test the health endpoint:

```bash
# HTTP test (should redirect to HTTPS)
curl -I http://fitness.ddns.net/health

# HTTPS test
curl https://fitness.ddns.net/health
```

3. Access the application:
   - Open `https://fitness.ddns.net` in your browser
   - Verify the frontend loads correctly
   - Test API endpoints at `https://fitness.ddns.net/api/docs`

---

## 5. SSL Certificate Configuration

### Let's Encrypt Certificates

DreamFitness uses Let's Encrypt for trusted SSL certificates via Certbot container.

#### Initial Certificate Request

```bash
# Create directories
mkdir -p certbot/www certbot/conf

# Request certificate
sudo docker run --rm -v ./certbot/www:/var/www/certbot -v ./certbot/conf:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot --email your-email@example.com -d fitness.ddns.net --agree-tos --no-eff-email
```

#### Auto-Renewal

The Certbot container automatically handles certificate renewal. It checks every 12 hours and renews certificates that expire within 30 days.

Certificates are stored in:

- `certbot/conf/live/fitness.ddns.net/fullchain.pem` - Certificate chain
- `certbot/conf/live/fitness.ddns.net/privkey.pem` - Private key

---

## 6. Environment Variables Reference

| Variable            | Required | Default        | Description                                  |
| :------------------ | :------- | :------------- | :------------------------------------------- |
| `DATABASE_USER`     | No       | `dreamfitness` | PostgreSQL database username                 |
| `DATABASE_PASSWORD` | **Yes**  | -              | PostgreSQL database password (required)      |
| `DATABASE_NAME`     | No       | `dreamfitness` | PostgreSQL database name                     |
| `RABBITMQ_USER`     | No       | `dreamfitness` | RabbitMQ username                            |
| `RABBITMQ_PASSWORD` | **Yes**  | -              | RabbitMQ password (required)                 |
| `VITE_API_URL`      | No       | ``             | API URL for frontend (empty for same-origin) |

### Configuration Examples

#### Same-Origin Deployment (Recommended)

Frontend and backend served from the same domain:

```env
VITE_API_URL=
```

#### Cross-Origin Deployment

Frontend and backend on different domains:

```env
VITE_API_URL=https://api.yourdomain.com
```

### Important: Changing RabbitMQ Password

If you need to change the RabbitMQ password, you must update it in **3 files**:

1. **`.env.production`** (root) - Docker Compose uses this for container configuration:

   ```env
   RABBITMQ_PASSWORD=<new-password>
   ```

2. **`backend/.env.production`** - Backend services use this for local connections:

   ```env
   RABBITMQ_URL=amqp://dreamfitness:<new-password>@localhost:5672
   ```

3. **`backend/.env.docker`** - Backend services use this for Docker network connections:
   ```env
   RABBITMQ_URL=amqp://dreamfitness:<new-password>@rabbitmq:5672
   ```

> **Note:** This inconsistency exists because NestJS loads environment files at runtime, and variable substitution in `RABBITMQ_URL` is not supported. All three files must have matching credentials.

---

## 8. Database Management

### Database Migrations

Migrations should be run manually after deployment.

#### Running Migrations

Run migrations inside the api-gateway container:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api-gateway npm run migration:run:prod
```

#### Checking Migration Status

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api-gateway npm run migration:show:prod
```

#### Reverting Migrations

If you need to revert the last migration:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api-gateway npm run migration:revert:prod
```

### Backup Considerations

For manual backups:

```bash
# Create a backup
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_dump -U dreamfitness dreamfitness > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20260320.sql | docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres psql -U dreamfitness dreamfitness
```

---

## 9. Monitoring and Logging

### Viewing Container Logs

View all service logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

View logs for a specific service:

```bash
# Nginx logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f nginx

# API Gateway logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api-gateway

# Auth service logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f auth-service
```

View last 100 lines:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 api-gateway
```

### Health Check Endpoints

| Service           | Endpoint    | Description                      |
| :---------------- | :---------- | :------------------------------- |
| Nginx             | `/health`   | Returns `ok` if nginx is running |
| API Gateway       | `/health`   | Health check endpoint            |
| API Documentation | `/api/docs` | Swagger UI for API documentation |

Test health endpoints:

```bash
# Nginx health
curl https://fitness.ddns.net/health

# API documentation
curl https://fitness.ddns.net/api/docs
```

### Container Status

Check container health status:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Expected output shows all services as `healthy`.

### Resource Usage

Monitor container resource usage:

```bash
docker stats
```

---

## 10. Update Procedures

### Standard Update

1. SSH into your server:

```bash
ssh user@fitness.ddns.net
cd dreamfitness
```

2. Pull the latest changes:

```bash
git pull origin master
```

3. Rebuild and restart containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. Verify the update:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=50
```

### Quick Restart (No Code Changes)

If you only changed environment variables:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Rollback Procedure

If an update causes issues:

1. Stop the current containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

2. Checkout the previous version:

```bash
git log --oneline -5  # Find the previous commit
git checkout <previous-commit-hash>
```

3. Rebuild and start:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. After verifying, return to the latest commit and fix issues:

```bash
git checkout main
```

---

## 11. Troubleshooting Guide

### Container Won't Start

**Symptoms:** Container exits immediately or keeps restarting.

**Diagnosis:**

```bash
# Check container status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# View container logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs api-gateway
```

**Common Causes:**

1. Missing environment variables:

```bash
# Verify .env.production exists
cat .env.production
```

2. Port conflicts:

```bash
# Check if ports are in use
sudo lsof -i :80
sudo lsof -i :443
```

3. Docker resource limits exceeded:

```bash
# Check Docker disk usage
docker system df
```

### Database Connection Issues

**Symptoms:** Backend logs show "Connection refused" or "ECONNREFUSED".

**Diagnosis:**

```bash
# Check if postgres is healthy
docker compose -f docker-compose.prod.yml --env-file .env.production ps postgres

# Check postgres logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs postgres
```

**Solutions:**

1. Verify database credentials in `.env.production`:

```bash
cat .env.production | grep DATABASE_
```

2. Ensure postgres container is running:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart postgres
```

### SSL Certificate Problems

**Symptoms:** Browser shows SSL errors or warnings.

**Diagnosis:**

1. Verify certificate files exist:

```bash
ls -la certbot/conf/live/fitness.ddns.net/
```

2. Check certificate validity:

```bash
openssl x509 -in certbot/conf/live/fitness.ddns.net/fullchain.pem -text -noout
```

3. Verify certificate matches domain:

```bash
echo | openssl s_client -connect fitness.ddns.net:443 2>/dev/null | openssl x509 -noout -dates
```

### Nginx Configuration Errors

**Symptoms:** Nginx container fails health check or won't start.

**Diagnosis:**

```bash
# Test nginx configuration
docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t
```

**Common Issues:**

1. Missing SSL certificates:

```bash
# Check if certificates exist
ls -la certbot/conf/live/fitness.ddns.net/
```

2. Configuration syntax error:

```bash
# Validate configuration
docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -t
```

---

## 12. Architecture Overview

### Container Responsibilities

| Container          | Image                 | Purpose                                                                 |
| :----------------- | :-------------------- | :---------------------------------------------------------------------- |
| `nginx`            | Custom (nginx-alpine) | Serves frontend static files, reverse proxy to backend, SSL termination |
| `api-gateway`      | Custom (node-alpine)  | Routes requests to microservices, JWT authentication                    |
| `auth-service`     | Custom (node-alpine)  | User authentication, profile management, balance operations             |
| `training-service` | Custom (node-alpine)  | Training sessions management                                            |
| `booking-service`  | Custom (node-alpine)  | Booking and waitlist management                                         |
| `notification-svc` | Custom (node-alpine)  | Email notifications                                                     |
| `postgres`         | postgres:16-alpine    | PostgreSQL database                                                     |
| `rabbitmq`         | rabbitmq:3-alpine     | Message broker for async communication                                  |
| `certbot`          | certbot/certbot       | SSL certificate management                                              |

### Network Configuration

All containers communicate through the `dreamfitness-network` bridge network. Only the nginx container exposes ports to the host.

### Volume Configuration

| Volume          | Purpose                    | Persistence                       |
| :-------------- | :------------------------- | :-------------------------------- |
| `postgres_data` | PostgreSQL data files      | Persists database across restarts |
| `rabbitmq_data` | RabbitMQ data files        | Persists messages across restarts |
| `certbot/www`   | ACME challenge files       | Let's Encrypt validation          |
| `certbot/conf`  | Let's Encrypt certificates | SSL certificates                  |

### Static File Caching Strategy

| Asset Type             | Cache Duration | Cache-Control Header                  |
| :--------------------- | :------------- | :------------------------------------ |
| JS/CSS with hash       | 1 year         | `public, immutable`                   |
| Images (PNG, JPG, SVG) | 1 year         | `public, immutable`                   |
| Fonts (WOFF, WOFF2)    | 1 year         | `public, immutable`                   |
| index.html             | No cache       | `no-store, no-cache, must-revalidate` |

---

## Quick Reference

### Common Commands

```bash
# Start all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Stop all services
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# View logs
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Check status
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Restart a single service
docker compose -f docker-compose.prod.yml --env-file .env.production restart nginx
```

### File Locations

| File                                                    | Purpose                                 |
| :------------------------------------------------------ | :-------------------------------------- |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | Production Docker Compose configuration |
| [`.env.production`](../.env.production)                 | Production environment variables        |
| [`nginx/Dockerfile`](../nginx/Dockerfile)               | Nginx + frontend container definition   |
| [`nginx/nginx.conf`](../nginx/nginx.conf)               | Nginx configuration                     |
| [`backend/Dockerfile`](../backend/Dockerfile)           | Backend container definition            |
