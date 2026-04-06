# ADR (Architecture Decision Record)

## Контекст

Смотри ./PRD.md.

## Решения

### 1. Технологический стек

- **Язык:** TypeScript
- **Фреймворк:** NestJS
- **База данных:** PostgreSQL
- **ORM:** TypeORM
- **Брокер сообщений:** RabbitMQ

### 2. Организация кода

- **Подход:** Monorepo (монорепозиторий)
- **Инструментарий:** Встроенный NestJS **monorepo mode**

### 3. Архитектурные паттерны и концепции

В учебных целях в проекте должны быть реализованы следующие паттерны и подходы:

- Microservices (Микросервисы)
- API Gateway
- Event-Driven Architecture (EDA)
- Saga Pattern (Orchestration)
- CQRS (Command Query Responsibility Segregation)
- Pub/Sub и Work Queues (RabbitMQ)
- Request-Response & Event-based communication

---

## 4. Стратегия базы данных

### Решение

**Shared Database** — единая база данных PostgreSQL для всех микросервисов.

### Обоснование

| Аргумент                 | Обоснование                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| Фокус на паттернах       | Основная цель — отработать RabbitMQ, EDA, API Gateway, Saga              |
| Консистентность          | PRD требует согласованного обновления баланса и мест — ACID упрощает это |
| Saga для бизнес-операций | Saga применяется к бронированию → списанию → уведомлению                 |
| Простота разработки      | Одна PostgreSQL вместо 5+ отдельных БД                                   |

---

## 5. Схема базы данных

### 5.1. Сущности и отношения

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │   Trainer   │     │   Training  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ name        │     │ title       │
│ password    │     │ bio         │     │ type (enum) │
│ name        │     │ avatarUrl   │     │ trainerId   │──┐
│ phone       │     │ isActive    │     │ datetime    │  │
│ birthDate   │     └─────────────┘     │ duration    │  │
│ gender      │                         │ capacity    │  │
│ role (enum) │                         │ price       │  │
│ balance     │                         │ createdAt   │  │
│ status      │                         └─────────────┘  │
│ createdAt   │                                          │
└─────────────┘                                          │
       │                                                 │
       │                                                 │
       ▼                                                 │
┌─────────────┐     ┌─────────────┐                     │
│   Booking   │     │  Waitlist   │                     │
├─────────────┤     ├─────────────┤                     │
│ id          │     │ id          │                     │
│ userId      │──┐  │ userId      │──┐                  │
│ trainingId  │◄─┼──┤ trainingId  │◄─┼──────────────────┘
│ status      │  │  │ createdAt   │  │
│ createdAt   │  │  └─────────────┘  │
└─────────────┘  │                   │
       │         │                   │
       │         └───────────────────┘
       ▼
┌─────────────┐
│ Transaction │
├─────────────┤
│ id          │
│ userId      │
│ type (enum) │
│ amount      │
│ bookingId   │ (nullable)
│ createdAt   │
└─────────────┘

┌─────────────┐
│Notification │
├─────────────┤
│ id          │
│ userId      │
│ type (enum) │
│ title       │
│ content     │
│ isRead      │
│ createdAt   │
└─────────────┘
```

### 5.2. Детали таблиц

#### User

| Поле      | Тип                 | Описание                                 |
| --------- | ------------------- | ---------------------------------------- |
| id        | UUID                | Primary key                              |
| email     | VARCHAR(255) UNIQUE | Email для входа                          |
| password  | VARCHAR(255)        | Хэшированный пароль                      |
| name      | VARCHAR(255)        | Имя пользователя                         |
| phone     | VARCHAR(20)         | Телефон                                  |
| birthDate | DATE                | Дата рождения                            |
| gender    | ENUM                | male, female                             |
| role      | ENUM                | client, admin                            |
| balance   | INTEGER             | Баланс баллов (в поле User для простоты) |
| status    | ENUM                | active, blocked                          |
| createdAt | TIMESTAMP           | Дата создания                            |

#### Trainer

| Поле      | Тип          | Описание          |
| --------- | ------------ | ----------------- |
| id        | UUID         | Primary key       |
| name      | VARCHAR(255) | Имя тренера       |
| bio       | TEXT         | Описание          |
| avatarUrl | VARCHAR(500) | Ссылка на аватар  |
| isActive  | BOOLEAN      | Активен ли тренер |

#### Training

| Поле      | Тип          | Описание                              |
| --------- | ------------ | ------------------------------------- |
| id        | UUID         | Primary key                           |
| title     | VARCHAR(255) | Название тренировки                   |
| type      | ENUM         | yoga, pilates, crossfit, boxing, etc. |
| trainerId | UUID FK      | Ссылка на тренера                     |
| datetime  | TIMESTAMP    | Дата и время начала                   |
| duration  | INTEGER      | Длительность в минутах                |
| capacity  | INTEGER      | Максимальное количество мест          |
| price     | INTEGER      | Стоимость в баллах                    |

#### Booking

| Поле       | Тип       | Описание               |
| ---------- | --------- | ---------------------- |
| id         | UUID      | Primary key            |
| userId     | UUID FK   | Ссылка на пользователя |
| trainingId | UUID FK   | Ссылка на тренировку   |
| status     | ENUM      | confirmed, cancelled   |
| createdAt  | TIMESTAMP | Дата создания          |

#### Waitlist

| Поле       | Тип       | Описание                  |
| ---------- | --------- | ------------------------- |
| id         | UUID      | Primary key               |
| userId     | UUID FK   | Ссылка на пользователя    |
| trainingId | UUID FK   | Ссылка на тренировку      |
| createdAt  | TIMESTAMP | Дата добавления в очередь |

> Позиция в очереди вычисляется через `RANK() OVER (ORDER BY createdAt)`

#### Transaction

| Поле      | Тип       | Описание                          |
| --------- | --------- | --------------------------------- |
| id        | UUID      | Primary key                       |
| userId    | UUID FK   | Ссылка на пользователя            |
| type      | ENUM      | deposit, withdraw, refund         |
| amount    | INTEGER   | Сумма в баллах                    |
| bookingId | UUID FK   | Ссылка на бронирование (nullable) |
| createdAt | TIMESTAMP | Дата транзакции                   |

#### Notification

| Поле      | Тип          | Описание                                     |
| --------- | ------------ | -------------------------------------------- |
| id        | UUID         | Primary key                                  |
| userId    | UUID FK      | Ссылка на пользователя                       |
| type      | ENUM         | booking, cancellation, transaction, reminder |
| title     | VARCHAR(255) | Заголовок                                    |
| content   | TEXT         | Содержимое                                   |
| isRead    | BOOLEAN      | Прочитано ли                                 |
| createdAt | TIMESTAMP    | Дата создания                                |

---

## 6. Границы микросервисов

### 6.1. Декомпозиция сервисов

```
┌──────────────────────────────────────────────────────────────────┐
│                         API Gateway                               │
│  (Routing, Auth, Rate Limiting, Request Aggregation)             │
└────────┬─────────┬─────────┬────────────┬────────────────────────┘
         │         │         │            │
         ▼         ▼         ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Auth Service│ │ Training    │ │ Booking     │ │ Notification│
│             │ │ Service     │ │ Service     │ │ Service     │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ • Login     │ │ • CRUD      │ │ • Book      │ │ • Email     │
│ • Register  │ │   Trainings │ │ • Cancel    │ │ • Push      │
│ • JWT       │ │ • CRUD      │ │ • Waitlist  │ │ • In-app    │
│ • Profile   │ │   Trainers  │ │ • Check-in  │ │             │
│ • Balance   │ │ • Schedule  │ │             │ │             │
│             │ │             │ │             │ │             │
│ Tables:     │ │ Tables:     │ │ Tables:     │ │ Tables:     │
│ • User      │ │ • Trainer   │ │ • Booking   │ │ • Notification│
│ • Transaction│ │ • Training  │ │ • Waitlist  │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     RabbitMQ        │
                    │ (Event Bus, Queues) │
                    └─────────────────────┘
```

### 6.2. Обязанности сервисов

| Сервис                   | Ответственность                          | Таблицы           |
| ------------------------ | ---------------------------------------- | ----------------- |
| **API Gateway**          | Маршрутизация, аутентификация, агрегация | —                 |
| **Auth Service**         | Users, баланс, транзакции                | User, Transaction |
| **Training Service**     | Расписание, тренеры                      | Trainer, Training |
| **Booking Service**      | Бронирование, waitlist                   | Booking, Waitlist |
| **Notification Service** | Уведомления                              | Notification      |

---

## 7. Коммуникация между сервисами

### 7.1. Подход

**Гибридная модель** — HTTP для синхронных операций, RabbitMQ для асинхронных событий.

### 7.2. Коммуникационная матрица

| Операция                               | Тип   | Протокол | Обоснование                      |
| -------------------------------------- | ----- | -------- | -------------------------------- |
| Booking → Auth: Check balance          | Sync  | HTTP     | Нужен немедленный ответ          |
| Booking → Auth: Reserve points         | Sync  | HTTP     | Транзакция требует подтверждения |
| Booking → Training: Check availability | Sync  | HTTP     | Актуальный статус                |
| Booking → Notification: Send event     | Async | RabbitMQ | Не блокирует бронирование        |
| Auth → Notification: Balance change    | Async | RabbitMQ | Уведомление позже                |
| Waitlist → Booking: Auto-promote       | Async | RabbitMQ | Фоновый процесс                  |

### 7.3. Структура RabbitMQ

```
Exchange: events.topic (Topic)
├── booking.created    → notification.queue
├── booking.cancelled  → notification.queue
├── balance.changed    → notification.queue
└── training.reminder  → notification.queue

Exchange: notifications.direct (Direct)
└── notification.send   → email.queue, push.queue
```

---

## 8. Saga Pattern

### 8.1. Подход

**Orchestration** — Booking Service координирует все операции.

### 8.2. Booking Saga

```
Step 1: Check availability (Training Service) — HTTP
Step 2: Reserve points (Auth Service) — HTTP
Step 3: Create booking (Booking Service DB)
Step 4: Emit BookingCreated event — RabbitMQ

Compensating Actions:
- Step 2 fail: Return error to user
- Step 3 fail: Release points (Auth Service)
```

### 8.3. Cancellation Saga

```
Step 1: Update booking status → cancelled
Step 2: Refund points (Auth Service) — HTTP
Step 3: Promote from waitlist (if exists)
Step 4: Emit BookingCancelled event — RabbitMQ

Compensating Actions:
- Step 2 fail: Restore booking status
- Step 3 fail: Points already refunded, log error
```

### 8.4. Waitlist Promotion Saga

```
Step 1: Find first in waitlist
Step 2: Reserve points (Auth Service) — HTTP
Step 3: Create booking from waitlist
Step 4: Remove from waitlist
Step 5: Emit BookingCreated event — RabbitMQ

Compensating Actions:
- Step 2 fail: Skip this user, try next
- Step 3 fail: Release points
```

---

## 9. CQRS

### 9.1. Применение

**Только в Booking Service** — для разделения команд и запросов.

### 9.2. Структура

```
┌─────────────────────────────────────────────────────────────┐
│                    Booking Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Command Side      │    │    Query Side       │        │
│  ├─────────────────────┤    ├─────────────────────┤        │
│  │ • BookTrainingCmd   │    │ • GetAvailability   │        │
│  │ • CancelBookingCmd  │    │ • GetUserBookings   │        │
│  │ • JoinWaitlistCmd   │    │ • GetWaitlistPos    │        │
│  └──────────┬──────────┘    └──────────┬──────────┘        │
│             │                          │                    │
│             ▼                          ▼                    │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Write Model       │    │    Read Model       │        │
│  ├─────────────────────┤    ├─────────────────────┤        │
│  │ • Booking (entity)  │    │ • BookingView       │        │
│  │ • Waitlist (entity) │    │ • AvailabilityView  │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. API Gateway

### 10.1. Реализация

**NestJS app** в монорепозитории.

### 10.2. Структура проекта

```
DreamFitness/
├── doc/                      # Документация
├── backend/                  # Backend (NestJS monorepo)
│   ├── apps/
│   │   ├── api-gateway/      # API Gateway
│   │   │   ├── src/
│   │   │   │   ├── auth/     # JWT validation guard
│   │   │   │   ├── routes/   # Proxy controllers
│   │   │   │   └── aggregator/ # Request aggregation
│   │   │   └── main.ts
│   │   │
│   │   ├── auth-service/
│   │   ├── training-service/
│   │   ├── booking-service/
│   │   └── notification-service/
│   │
│   ├── libs/
│   │   ├── shared/           # Shared utilities
│   │   └── contracts/        # DTOs, interfaces
│   │
│   └── nest-cli.json         # Monorepo config
│
└── frontend/                 # Frontend приложение
```

### 10.3. Обязанности

| Обязанность         | Реализация                        |
| ------------------- | --------------------------------- |
| Routing             | Proxy по path prefix              |
| Auth                | JWT validation, извлечение userId |
| Rate Limiting       | @nestjs/throttler                 |
| Request Aggregation | Комбинация данных из сервисов     |
| Error Handling      | Стандартизация ответов            |

### 10.4. Routing

```
/api/auth/*      → Auth Service      (localhost:3001)
/api/trainings/* → Training Service  (localhost:3002)
/api/bookings/*  → Booking Service   (localhost:3003)
```

---

## 11. Аутентификация и авторизация

### 11.1. Подход

**Centralized Auth** — валидация JWT в API Gateway.

### 11.2. Token Strategy

| Token         | Lifetime | Storage                 |
| ------------- | -------- | ----------------------- |
| Access Token  | 15 min   | Memory / Frontend state |
| Refresh Token | 7 days   | HTTP-only cookie        |

### 11.3. JWT Payload

```typescript
{
  sub: number,      // userId
  email: string,
  role: 'client' | 'admin',
  iat: number,
  exp: number
}
```

### 11.4. Flow

```
1. Gateway validates JWT signature
2. Extract userId, role from token
3. Add X-User-Id, X-User-Role headers
4. Forward to service
5. Services trust headers (internal network)
```

---

## Последствия

Выбранный стек и паттерны обеспечат полное погружение в разработку распределенных систем и позволят отработать навыки управления транзакциями и связями между сервисами.
