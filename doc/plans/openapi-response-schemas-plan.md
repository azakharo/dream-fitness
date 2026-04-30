# Plan: Adding Response Schemas to OpenAPI Spec

## Problem

The current OpenAPI spec (`frontend/doc/openapi.json`) lacks response body schemas. All responses only have `{"description": ""}` without defining the response structure. This prevents:

- Generating TypeScript types for frontend
- Auto-generating typed HTTP clients
- Proper API documentation in Swagger UI

## Current State Analysis

### Response DTOs Already Exist

The backend already has response DTOs defined in `backend/libs/contracts/`:

| Domain       | Response DTOs                                                                                  | File                                                  |
| ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Auth         | `LoginResponseBody`, `LogoutResponseBody`, `RegisterResponseBody`, `UserDto`, `UserProfileDto` | `libs/contracts/src/auth/auth.dto.ts`                 |
| Training     | `TrainingResponseDto`, `TrainerResponseDto`                                                    | `libs/contracts/src/training/training.dto.ts`         |
| Booking      | `BookingDto`, `WaitlistDto`                                                                    | `libs/contracts/src/booking/booking.dto.ts`           |
| Notification | `NotificationDto`                                                                              | `libs/contracts/src/notification/notification.dto.ts` |

### Missing: `@ApiResponse` Decorators

The API Gateway proxy controllers (`backend/apps/api-gateway/src/proxy/*.proxy.ts`) only have `@ApiBody` decorators for request bodies, but no `@ApiResponse` decorators for responses.

## Implementation Plan

### Phase 1: Add Missing Response DTOs

Some endpoints need additional response DTOs that don't exist yet:

1. **Balance endpoints** - Need:
   - `BalanceResponseDto` (for `GET /api/auth/balance`)
   - `TransactionListResponseDto` (for `GET /api/auth/transactions`)

2. **List endpoints** - Need wrapper DTOs:
   - `TrainerListResponseDto`
   - `TrainingListResponseDto`
   - `BookingListResponseDto`
   - `NotificationListResponseDto`
   - `WaitlistResponseDto`

3. **Count endpoints** - Need:
   - `UnreadCountResponseDto`

### Phase 2: Add `@ApiResponse` Decorators

For each proxy controller, add `@ApiResponse` decorator with appropriate status code and response type.

#### Example - Before:

```typescript
@Post('login')
@ApiBody({ type: LoginDto })
login(@Req() req: Request, @Body() body: LoginDto) {
  return this.proxyService.proxyRequest(...);
}
```

#### Example - After:

```typescript
@Post('login')
@ApiBody({ type: LoginDto })
@ApiResponse({ status: 201, description: 'Login successful', type: LoginResponseBody })
@ApiResponse({ status: 401, description: 'Invalid credentials' })
login(@Req() req: Request, @Body() body: LoginDto) {
  return this.proxyService.proxyRequest(...);
}
```

### Phase 3: Regenerate OpenAPI Spec

After adding decorators:

1. Start the API Gateway
2. Access `/api/docs-json` endpoint
3. Save the generated OpenAPI JSON to `frontend/doc/openapi.json`

## Files to Modify

### 1. Response DTOs (add missing ones)

| File                                                          | Add                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| `backend/libs/contracts/src/auth/auth.dto.ts`                 | `BalanceResponseDto`, `TransactionListResponseDto`      |
| `backend/libs/contracts/src/training/training.dto.ts`         | `TrainerListResponseDto`, `TrainingListResponseDto`     |
| `backend/libs/contracts/src/booking/booking.dto.ts`           | `BookingListResponseDto`, `WaitlistResponseDto`         |
| `backend/libs/contracts/src/notification/notification.dto.ts` | `NotificationListResponseDto`, `UnreadCountResponseDto` |

### 2. Proxy Controllers (add `@ApiResponse`)

| File                                                       | Endpoints to Update |
| ---------------------------------------------------------- | ------------------- |
| `backend/apps/api-gateway/src/proxy/auth.proxy.ts`         | All 11 endpoints    |
| `backend/apps/api-gateway/src/proxy/training.proxy.ts`     | All 10 endpoints    |
| `backend/apps/api-gateway/src/proxy/booking.proxy.ts`      | All 7 endpoints     |
| `backend/apps/api-gateway/src/proxy/notification.proxy.ts` | All 7 endpoints     |

## Detailed Endpoint Mapping

### Auth Endpoints

| Endpoint                    | Method | Response DTO                       |
| --------------------------- | ------ | ---------------------------------- |
| `/api/auth/register`        | POST   | `RegisterResponseBody`             |
| `/api/auth/login`           | POST   | `LoginResponseBody`                |
| `/api/auth/refresh`         | POST   | `LoginResponseBody`                |
| `/api/auth/logout`          | POST   | `LogoutResponseBody`               |
| `/api/auth/me`              | GET    | `UserProfileDto`                   |
| `/api/auth/me`              | PATCH  | `UserProfileDto`                   |
| `/api/auth/balance`         | GET    | `BalanceResponseDto` (new)         |
| `/api/auth/balance/deposit` | POST   | `BalanceResponseDto` (new)         |
| `/api/auth/balance/reserve` | POST   | `BalanceResponseDto` (new)         |
| `/api/auth/balance/release` | POST   | `BalanceResponseDto` (new)         |
| `/api/auth/balance/refund`  | POST   | `BalanceResponseDto` (new)         |
| `/api/auth/transactions`    | GET    | `TransactionListResponseDto` (new) |

### Training Endpoints

| Endpoint              | Method | Response DTO                    |
| --------------------- | ------ | ------------------------------- |
| `/api/trainers`       | GET    | `TrainerListResponseDto` (new)  |
| `/api/trainers/:id`   | GET    | `TrainerResponseDto`            |
| `/api/trainers`       | POST   | `TrainerResponseDto`            |
| `/api/trainers/:id`   | PATCH  | `TrainerResponseDto`            |
| `/api/trainers/:id`   | DELETE | `{ deleted: boolean }`          |
| `/api/trainings`      | GET    | `TrainingListResponseDto` (new) |
| `/api/trainings/:id`  | GET    | `TrainingResponseDto`           |
| `/api/trainings`      | POST   | `TrainingResponseDto`           |
| `/api/trainings/:id`  | PATCH  | `TrainingResponseDto`           |
| `/api/trainings/:id`  | DELETE | `{ deleted: boolean }`          |
| `/api/schedule`       | GET    | `TrainingListResponseDto`       |
| `/api/schedule/:date` | GET    | `TrainingListResponseDto`       |

### Booking Endpoints

| Endpoint                    | Method | Response DTO                   |
| --------------------------- | ------ | ------------------------------ |
| `/api/bookings`             | GET    | `BookingListResponseDto` (new) |
| `/api/bookings/:id`         | GET    | `BookingDto`                   |
| `/api/bookings`             | POST   | `BookingDto`                   |
| `/api/bookings/:id`         | DELETE | `BookingDto` (cancelled)       |
| `/api/waitlist`             | GET    | `WaitlistResponseDto` (new)    |
| `/api/waitlist/:trainingId` | GET    | `WaitlistDto`                  |
| `/api/waitlist`             | POST   | `WaitlistDto`                  |
| `/api/waitlist/:trainingId` | DELETE | `{ deleted: boolean }`         |

### Notification Endpoints

| Endpoint                          | Method | Response DTO                        |
| --------------------------------- | ------ | ----------------------------------- |
| `/api/notifications`              | GET    | `NotificationListResponseDto` (new) |
| `/api/notifications/unread-count` | GET    | `UnreadCountResponseDto` (new)      |
| `/api/notifications/:id`          | GET    | `NotificationDto`                   |
| `/api/notifications/:id/read`     | PATCH  | `NotificationDto`                   |
| `/api/notifications/read-all`     | PATCH  | `{ updated: number }`               |
| `/api/notifications/:id`          | DELETE | `{ deleted: boolean }`              |
| `/api/notifications`              | DELETE | `{ deleted: number }`               |

## Estimated Scope

- **New DTOs**: ~8 response DTOs
- **Modified files**: 8 files (4 DTO files + 4 proxy controllers)
- **Decorators to add**: ~35 `@ApiResponse` decorators
