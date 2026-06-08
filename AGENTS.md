# AGENTS.md

**DreamFitness** — система управления фитнес-клубом (backend + frontend).

## Requirements

- Node.js v24.x
- Docker Desktop

## Structure

Two independent projects (not npm workspaces), each with own `package.json`:
- `backend/` — NestJS monorepo: api-gateway, auth-service, training-service, booking-service, notification-service
- `frontend/` — React 19 + Vite

## Key Rules

- After TS/JS changes: run `npm run ts` then `npm run lint` in the corresponding directory
- After backend API changes: remind user to run `cd frontend && npm run gen:types`
- Backend DTOs: save in `backend/libs/contracts/src` organized by domain
- Frontend `src/types/api.generated.ts` is auto-generated — do not edit

## Quick Start

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

API: http://localhost:3000 | Swagger: http://localhost:3000/api/docs | Frontend: http://localhost:5173

## Testing (Backend)

```bash
npm run start:test:infra          # Start PostgreSQL container
npm run test:setup                 # Create test DB + run migrations
npm run test:unit                  # Unit tests (no DB needed)
npm run test:e2e                   # E2E tests (requires test DB)
npm run stop:test:infra            # Stop containers
```

## Documentation

- [PRD](./doc/PRD.md), [Backend ADR](./doc/ADR.md), [Frontend ADR](./doc/Frontend-ADR.md)
- Detailed rules: [backend/AGENTS.md](./backend/AGENTS.md), [frontend/AGENTS.md](./frontend/AGENTS.md)
