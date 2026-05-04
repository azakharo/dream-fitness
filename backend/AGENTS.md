# AGENTS.md

## Описание проекта

Backend для системы управления фитнес-клубом DreamFitness. Микросервисная архитектура.

## Основные документы по проекту

- [PRD](../doc/PRD.md) — требования к продукту
- [ADR](../doc/ADR.md) — архитектурные решения
- [OpenAPI 3.0 спецификация](../doc/openapi.json) — полное описание API
- [Краткое описание API](../doc/API.md)

## Технологический стек

- **Язык:** TypeScript
- **Фреймворк:** NestJS (monorepo mode)
- **ORM:** TypeORM
- **База данных:** PostgreSQL
- **Брокер сообщений:** RabbitMQ
- **Документация API:** Swagger (OpenAPI)

## Структура папок

```
backend/
├── apps/                   # Микросервисы
│   ├── api-gateway/        # Точка входа, маршрутизация, JWT auth, proxy
│   ├── auth-service/       # Аутентификация, пользователи, баланс
│   ├── booking-service/    # Бронирования, лист ожидания (CQRS)
│   ├── notification-service/ # Email уведомления, RabbitMQ consumers
│   └── training-service/   # Тренировки, тренеры, расписание
├── libs/                   # Общие библиотеки
│   ├── contracts/          # DTO и события для межсервисной коммуникации
│   └── shared/             # Утилиты, guards, filters, decorators
├── src/                    # База данных
│   ├── data-source.ts      # Конфигурация TypeORM
│   ├── database/           # Скрипты сброса и заполнения БД
│   └── migrations/         # Файлы миграций
├── scripts/                # Вспомогательные скрипты
└── test/                   # E2E тесты (Playwright)
```

Каждый микросервис следует соглашениям NestJS: `controllers/`, `services/`, `entities/`, `repositories/`, `dto/`, `modules/`.

## Как запускать проект

Подробные инструкции по запуску development-окружения, тестированию и production-режиму см. в соответствующих разделах [README.md](./README.md):

- [Development mode](./README.md#development-mode) — запуск инфраструктуры и микросервисов
- [Testing](./README.md#-testing) — запуск unit и E2E тестов
- [Production mode](./README.md#run-in-production-mode) — запуск через Docker

## Основные npm команды

| Команда        | Описание                          |
| -------------- | --------------------------------- |
| `npm run ts`   | Проверка TypeScript ошибок        |
| `npm run lint` | Линтинг и автоформатирование кода |

## Правила по работе с кодом

- Если во время выполнения задачи изменялись TypeScript или JavaScript файлы исходного кода, то после выполнения задачи (в самом конце), нужно проверить, нет ли ошибок TypeScript (`npm run ts`) и других принятых правил кодирования (`npm run lint`). Обнаруженные проблемы необходимо исправить.
- Если во время выполнения задачи изменился backend API, то нужно напомнить пользователю выполнить авто-генерацию типов данных для фронтенда: `cd ../frontend && npm run gen:types`.

## Архитектурные особенности

- **API Gateway** — единая точка входа, валидация JWT, маршрутизация запросов к микросервисам
- **Saga Pattern** — оркестрация в booking-service для операций бронирования
- **CQRS** — применяется только в booking-service для разделения команд и запросов
- **RabbitMQ** — асинхронная коммуникация между сервисами (события бронирования, уведомления)
- **Shared Database** — единая PostgreSQL для всех микросервисов
