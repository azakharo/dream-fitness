# DreamFitness backend

## Prerequisites

- Node.js (v24.x prefer)

## Install deps

```bash
$ npm install
```

## Development mode

### Start dev infrastructure (Postgres and RabbitMQ)

```bash
$ npm run start:dev:infra
```

### Run migrations (if required)

```bash
$ npm run migration:run
```

### Create users (if required)

```bash
$ npm run db:seed
```

## Start dev servers for the microservices in different consoles

```bash
npm run start:dev:auth-service
npm run start:dev:training-service
npm run start:dev:booking-service
npm run start:dev:notification-service
npm run start:dev:api-gateway
```

API is available on:
`http://localhost:3000`

API documentation is available on:
`http://localhost:3000/api/docs`

### Stop dev infrastructure

```bash
$ npm run start:dev:infra
```

If you want to clear the DB data, then run instead:

```bash
$ npm run start:dev:infra -- -v
```

---

## 🧪 Testing

### Running Tests Locally

The project has **unit tests** (no database required) and **E2E tests** (require PostgreSQL and RabbitMQ).

#### Prerequisites

- Docker Desktop (for PostgreSQL)
- Node.js dependencies installed (`npm install` in `backend/`)

#### Step 1: Start test infrastructure

```bash
npm run start:test:infra
```

#### Step 2: Create test database, run migrations and create test users

```bash
npm run test:setup
```

This command runs two scripts sequentially:

- `test:db:create` — creates the `dreamfitness_test` database (using `.env.test` config)
- `test:db:migrate` — runs TypeORM migrations against the test database

> If the database already exists, the create script will report it and continue safely.

#### Step 3: Run tests

```bash
npm test
```

Unit tests mock all external dependencies (database, RabbitMQ, JWT) and do not require a running database.

E2E tests start a real NestJS application, connect to the test database (`dreamfitness_test`), and execute HTTP requests via `supertest`. RabbitMQ is mocked automatically — no live connection needed.

> E2E tests clean the database before each test (`TRUNCATE`), so the database remains empty after the test run.

### Step 4: Stop test infrastructure

```bash
$ npm run start:test:infra
```

If you want to clear the DB data, then run instead:

```bash
$ npm run start:test:infra -- -v
```
