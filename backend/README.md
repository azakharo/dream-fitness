# Minimal backend starter which uses Nest, TypeORM, Postgres

Postgres runs in Docker container.
The backend runs locally for development.

## Install deps

```bash
$ npm install
```

## Run Postgres

```bash
$ docker-compose up -d
```

## Start dev server

```bash
# watch mode
$ npm run start:dev
```

API is available on:
`http://localhost:3000`

API documentation is available on:
`http://localhost:3000/api/docs`

## Shuting down

First stop the dev server.

```bash
$ docker-compose down
```

## Other useful npm scripts

- working with migrations: create, generate, show, run, revert
- ts - run type-checking
- lint - run eslint + prettier
- db seed and reset (truncate all tables)

## Configuring project

- Change package name in package.json
- Configure db access in `src/data-source.ts`
- Modify `src/database/run-seed.ts` file to fill in the db with test data
- Change container and db names in `docker-compose.base.yml`

---

## 🧪 Testing

### Running Tests Locally

The project has two types of tests: **unit tests** (no database required) and **E2E tests** (require PostgreSQL).

#### Prerequisites

- Docker Desktop (for PostgreSQL)
- Node.js dependencies installed (`npm install` in `backend/`)

#### Step 1: Start Infrastructure

```bash
cd backend
docker compose --env-file .env --env-file .env.test -f docker-compose.base.yml up -d
```

Wait until PostgreSQL is healthy (`docker compose ps` should show `healthy`).

#### Step 2: Create Test Database and Run Migrations

```bash
npm run test:setup
```

This command runs two scripts sequentially:

- `test:db:create` — creates the `dreamfitness_test` database (using `.env.test` config)
- `test:db:migrate` — runs TypeORM migrations against the test database

> If the database already exists, the create script will report it and continue safely.

#### Step 3: Run Unit Tests

```bash
npm test:unit
```

Unit tests mock all external dependencies (database, RabbitMQ, JWT) and do not require a running database.

#### Step 4: Run E2E Tests

```bash
npm run test:e2e
```

E2E tests start a real NestJS application, connect to the test database (`dreamfitness_test`), and execute HTTP requests via `supertest`. RabbitMQ is mocked automatically — no live connection needed.

> E2E tests clean the database before each test (`TRUNCATE`), so the database remains empty after the test run.

#### Available NPM Scripts

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `npm test`                | Run all tests                        |
| `npm run test:watch`      | Run unit tests in watch mode         |
| `npm run test:cov`        | Run unit tests with coverage report  |
| `npm run test:setup`      | Create test DB + run migrations      |
| `npm run test:db:create`  | Create `dreamfitness_test` database  |
| `npm run test:db:migrate` | Run migrations against test database |
| `npm run test:db:seed`    | Seed test database with fixture data |
| `npm run test:e2e`        | Run E2E tests                        |
