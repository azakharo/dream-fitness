# AGENTS.md

## Описание проекта

Backend starter which uses Nest.js, TypeORM, Postgres.

## Основные документы по проекту

- [PRD](../doc/PRD.md)
- [ADR](../doc/ADR.md)
- [OpenAPI 3.0 спецификация API бекенда](../doc/openapi.json)
- [Краткое описание API бекенда](../doc/API.md)

## Технологический стек

- [TypeScript](https://www.typescriptlang.org/)
- **Framework:** Nest.js
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Docs:** Swagger (OpenAPI)

## Структура папок

```
backend/
├── apps/                   # Microservices
│   ├── api-gateway/        # Entry point, routing, JWT auth, proxy
│   ├── auth-service/       # Authentication, users, balance/transactions
│   ├── booking-service/    # Training bookings, waitlist (CQRS)
│   ├── notification-service/ # Email notifications, RabbitMQ consumers
│   └── training-service/   # Trainings, trainers, schedule
├── libs/                   # Shared libraries
│   ├── contracts/          # DTOs and events for inter-service communication
│   └── shared/             # Common utilities, guards, filters, RabbitMQ config, decorators, interceptors
├── src/                    # Database
│   ├── data-source.ts      # TypeORM configuration
│   ├── database/           # Reset and seed scripts
│   └── migrations/         # Database migration files
├── scripts/                # Utility scripts (Docker entrypoints, DB setup)
└── test/                   # E2E tests (Playwright)
```

Each microservice follows Nest.js conventions: `controllers/`, `services/`, `entities/`, `repositories/`, `dto/`, `modules/`.

## Основные npm команды

- Установка зависимостей: `npm install`
- Проверка кода на наличие ошибок Typescript: `npm run ts`
- Линтинг и автоформатирование кода: `npm run lint`

## Правила по работе с кодом

- Если по ходу выполнения задания изменялись Typescript или Javascript файлы исходного кода, то после выполнения задания, перед тем, как сообщить, что Task Completed, нужно проверить, нет ли ошибок Typescript в изменённых файлах. Для этого нужно вызвать команду `npm run ts`. Найденные ошибки и warnings необходимо исправить. Затем нужно вызвать `npm run lint`. Проблемы, которые нашёл eslint и не смог сам устранить, необходимо исправить.
