# Plan: Adding Response Schemas to OpenAPI Spec

## Problem

The current OpenAPI spec (`frontend/doc/openapi.json`) lacks response body schemas. All responses only have `{"description": ""}` without defining the response structure. This prevents:

- Generating TypeScript types for frontend
- Auto-generating typed HTTP clients
- Proper API documentation in Swagger UI

## Current State Analysis

### Response DTOs Location

Response DTOs are currently scattered across two locations:

1. **`libs/contracts`** - shared DTOs for inter-service communication
2. **Microservices** - internal DTOs specific to each service

#### Existing DTOs in `libs/contracts`

| Domain       | Response DTOs                                                                                  | File                                                  |
| ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Auth         | `LoginResponseBody`, `LogoutResponseBody`, `RegisterResponseBody`, `UserDto`, `UserProfileDto` | `libs/contracts/src/auth/auth.dto.ts`                 |
| Training     | `TrainingResponseDto`, `TrainerResponseDto`                                                    | `libs/contracts/src/training/training.dto.ts`         |
| Booking      | `BookingDto`, `WaitlistDto`                                                                    | `libs/contracts/src/booking/booking.dto.ts`           |
| Notification | `NotificationDto`                                                                              | `libs/contracts/src/notification/notification.dto.ts` |

#### Existing DTOs in Microservices (need to be moved to contracts)

| Microservice         | DTO                           | Current Location                                                                    |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| auth-service         | `BalanceResponseDto`          | `apps/auth-service/src/balance/dto/balance-response.dto.ts`                         |
| auth-service         | `TransactionListResponseDto`  | `apps/auth-service/src/balance/dto/transaction-list-response.dto.ts`                |
| auth-service         | `TransactionResponseDto`      | `apps/auth-service/src/balance/dto/transaction-response.dto.ts`                     |
| booking-service      | `BookingListResponseDto`      | `apps/booking-service/src/bookings/dto/booking-list-response.dto.ts`                |
| booking-service      | `BookingResponseDto`          | `apps/booking-service/src/bookings/dto/booking-response.dto.ts`                     |
| booking-service      | `WaitlistResponseDto`         | `apps/booking-service/src/waitlist/dto/waitlist-response.dto.ts`                    |
| notification-service | `NotificationListResponseDto` | `apps/notification-service/src/notifications/dto/notification-list-response.dto.ts` |
| notification-service | `NotificationResponseDto`     | `apps/notification-service/src/notifications/dto/notification-response.dto.ts`      |
| notification-service | `UnreadCountResponseDto`      | `apps/notification-service/src/notifications/dto/unread-count-response.dto.ts`      |

### Missing: `@ApiResponse` Decorators

The API Gateway proxy controllers (`backend/apps/api-gateway/src/proxy/*.proxy.ts`) only have `@ApiBody` decorators for request bodies, but no `@ApiResponse` decorators for responses.

## Implementation Plan

### Phase 1: Consolidate Response DTOs in `libs/contracts`

Move existing response DTOs from microservices to `libs/contracts` and create missing ones.

#### 1.1 Move Existing DTOs to `libs/contracts`

| DTO                           | From (microservice)                                | To (libs/contracts)                                   |
| ----------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| `BalanceResponseDto`          | `apps/auth-service/src/balance/dto/`               | `libs/contracts/src/auth/auth.dto.ts`                 |
| `TransactionListResponseDto`  | `apps/auth-service/src/balance/dto/`               | `libs/contracts/src/auth/auth.dto.ts`                 |
| `TransactionResponseDto`      | `apps/auth-service/src/balance/dto/`               | `libs/contracts/src/auth/auth.dto.ts`                 |
| `BookingListResponseDto`      | `apps/booking-service/src/bookings/dto/`           | `libs/contracts/src/booking/booking.dto.ts`           |
| `BookingResponseDto`          | `apps/booking-service/src/bookings/dto/`           | `libs/contracts/src/booking/booking.dto.ts`           |
| `WaitlistResponseDto`         | `apps/booking-service/src/waitlist/dto/`           | `libs/contracts/src/booking/booking.dto.ts`           |
| `NotificationListResponseDto` | `apps/notification-service/src/notifications/dto/` | `libs/contracts/src/notification/notification.dto.ts` |
| `NotificationResponseDto`     | `apps/notification-service/src/notifications/dto/` | `libs/contracts/src/notification/notification.dto.ts` |
| `UnreadCountResponseDto`      | `apps/notification-service/src/notifications/dto/` | `libs/contracts/src/notification/notification.dto.ts` |

#### 1.2 Create Missing DTOs in `libs/contracts`

| DTO                       | Location                                      | Purpose                   |
| ------------------------- | --------------------------------------------- | ------------------------- |
| `TrainerListResponseDto`  | `libs/contracts/src/training/training.dto.ts` | Wrapper for trainer list  |
| `TrainingListResponseDto` | `libs/contracts/src/training/training.dto.ts` | Wrapper for training list |

#### 1.3 Update Imports in Microservices

After moving DTOs to contracts, update all microservice files that import these DTOs to use the centralized versions from `@app/contracts`.

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

### 1. Move DTOs to `libs/contracts`

| File                                                          | Action                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `backend/libs/contracts/src/auth/auth.dto.ts`                 | Add `BalanceResponseDto`, `TransactionListResponseDto`, `TransactionResponseDto`       |
| `backend/libs/contracts/src/booking/booking.dto.ts`           | Add `BookingListResponseDto`, `BookingResponseDto`, `WaitlistResponseDto`              |
| `backend/libs/contracts/src/notification/notification.dto.ts` | Add `NotificationListResponseDto`, `NotificationResponseDto`, `UnreadCountResponseDto` |
| `backend/libs/contracts/src/training/training.dto.ts`         | Add `TrainerListResponseDto`, `TrainingListResponseDto` (new)                          |

### 2. Delete Old DTO Files from Microservices

| File                                                                                        | Action |
| ------------------------------------------------------------------------------------------- | ------ |
| `backend/apps/auth-service/src/balance/dto/balance-response.dto.ts`                         | Delete |
| `backend/apps/auth-service/src/balance/dto/transaction-list-response.dto.ts`                | Delete |
| `backend/apps/auth-service/src/balance/dto/transaction-response.dto.ts`                     | Delete |
| `backend/apps/booking-service/src/bookings/dto/booking-list-response.dto.ts`                | Delete |
| `backend/apps/booking-service/src/bookings/dto/booking-response.dto.ts`                     | Delete |
| `backend/apps/booking-service/src/waitlist/dto/waitlist-response.dto.ts`                    | Delete |
| `backend/apps/notification-service/src/notifications/dto/notification-list-response.dto.ts` | Delete |
| `backend/apps/notification-service/src/notifications/dto/notification-response.dto.ts`      | Delete |
| `backend/apps/notification-service/src/notifications/dto/unread-count-response.dto.ts`      | Delete |

### 3. Update Imports in Microservices

| Microservice         | Files to Update                                    | New Import Source |
| -------------------- | -------------------------------------------------- | ----------------- |
| auth-service         | `balance.controller.ts`, `balance.service.ts`      | `@app/contracts`  |
| booking-service      | `bookings.controller.ts`, `waitlist.controller.ts` | `@app/contracts`  |
| notification-service | `notifications.controller.ts`                      | `@app/contracts`  |

### 4. Proxy Controllers (add `@ApiResponse`)

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

### Phase 1: Consolidate DTOs
- **Move existing DTOs**: 9 DTOs from microservices to `libs/contracts`
- **Create new DTOs**: 2 DTOs (`TrainerListResponseDto`, `TrainingListResponseDto`)
- **Delete old files**: 9 DTO files in microservices
- **Update imports**: ~6-10 files in microservices

### Phase 2: Add @ApiResponse Decorators
- **Decorators to add**: ~35 `@ApiResponse` decorators
- **Modified proxy controllers**: 4 files

### Phase 3: Regenerate OpenAPI Spec
- Start API Gateway and export `/api/docs-json` to `frontend/doc/openapi.json`
