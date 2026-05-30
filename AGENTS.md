# AGENTS.md

**DreamFitness** — система управления фитнес-клубом (backend + frontend).

## Требования

- Node.js v24.x
- Docker Desktop

## Структура

Два независимых проекта (не npm workspaces):
- `backend/` — NestJS monorepo (5 микросервисов), отдельный `package.json`
- `frontend/` — React + Vite, отдельный `package.json`

## Ключевые правила

- После изменений TS/JS файлов: запускать `npm run ts` затем `npm run lint` в соответствующей папке
- После изменений backend API: напомнить пользователю выполнить `cd frontend && npm run gen:types`
- DTO для backend: сохранять в `backend/libs/contracts/src` по доменам
- Frontend файл `src/types/api.generated.ts` автогенерируется — не редактировать

## Быстрый старт

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

API: http://localhost:3000 (Swagger: /api/docs) | Frontend: http://localhost:5173

## Документация

- [PRD](./doc/PRD.md), [Backend ADR](./doc/ADR.md), [Frontend ADR](./doc/Frontend-ADR.md)
- [OpenAPI спецификация](./doc/openapi.json)
- Специфичные правила: [backend/AGENTS.md](./backend/AGENTS.md), [frontend/AGENTS.md](./frontend/AGENTS.md)
