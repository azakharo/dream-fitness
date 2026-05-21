# DreamFitness

**DreamFitness** — internal fitness club management system. Platform allows clients manage subscriptions, book group and individual training sessions. Administrators can control training occupancy and user account status.

---

## ✨ Features

### Client

- View and manage personal profile
- Browse training schedule with filters
- Book training sessions (pay for them)
- Cancel bookings with automatic refund
- Join waitlist when no slots available
- Receive notifications about bookings and reminders
- Top up balance via payment integration (only Tinkoff Kassa is supported currently)

### Administrator

- Manage trainers (fitness instructors)
- Create and manage training sessions
- View booked users per training
- Manage user accounts
- View reports and statistics

---

## System Architecture

**Microservices architecture** with API Gateway pattern.

- **API Gateway** — routing, authentication, request aggregation
- **Auth Service** — users, authentication, balance, transactions
- **Training Service** — trainers, training sessions, schedule
- **Booking Service** — bookings, waitlist, CQRS implementation
- **Notification Service** — email, push, in-app notifications

Services communicate via HTTP (sync) and RabbitMQ (async events).

See [ADR](doc/ADR.md) for detailed architecture decisions.

---

## 🛠️ Technology Stack

### Backend

| Component      | Technology      |
| -------------- | --------------- |
| Language       | TypeScript      |
| Framework      | NestJS          |
| Database       | PostgreSQL      |
| ORM            | TypeORM         |
| Message Broker | RabbitMQ        |
| API Docs       | Swagger/OpenAPI |

### Frontend

| Component    | Technology      |
| ------------ | --------------- |
| Language     | TypeScript      |
| Framework    | React 19        |
| Build Tool   | Vite            |
| UI Kit       | shadcn/ui       |
| Styling      | Tailwind CSS 4  |
| Routing      | TanStack Router |
| State        | Zustand         |
| Server State | TanStack Query  |
| Forms        | React Hook Form |
| Validation   | Zod             |

See [Frontend ADR](doc/Frontend-ADR.md) for details.

---

## 📁 Project Structure

```
DreamFitness/
├── backend/          # NestJS monorepo (microservices)
│   ├── apps/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── training-service/
│   │   ├── booking-service/
│   │   └── notification-service/
│   └── libs/         # Shared libraries
├── frontend/         # React application
└── doc/              # Documentation
```

---

## API

REST API with Swagger documentation.

- Development: `http://localhost:3000/api/docs`
- OpenAPI spec available at `/api/docs-json`

---

## ⚙️ Technical Features

MVP project implementing distributed systems patterns:

- **Microservices** — service boundaries, independent deployment
- **API Gateway** — routing, auth, rate limiting
- **Event-Driven Architecture** — RabbitMQ pub/sub
- **Saga Pattern** — distributed transactions (booking flow)
- **CQRS** — command/query separation in Booking Service

---

## 🚀 Quick Start

### Prerequisites

- Node.js v24.x
- Docker Desktop
- npm

### Installation

See [Backend Installation Guide](backend/README.md) for detailed instructions.

Quick start:

```bash
# Install dependencies
cd backend && npm install

# Start infrastructure and services
npm run dev

# Run migrations (separate terminal)
npm run migration:run
```

API available at `http://localhost:3000`

---

## 📚 Documentation

| Document                            | Description                     |
| ----------------------------------- | ------------------------------- |
| [PRD](doc/PRD.md)                   | Product requirements            |
| [ADR](doc/ADR.md)                   | Backend architecture decisions  |
| [UI Requirements](doc/UI.md)        | UI/UX requirements              |
| [Frontend ADR](doc/Frontend-ADR.md) | Frontend architecture decisions |
| [Backend README](backend/README.md) | Backend setup and development   |
