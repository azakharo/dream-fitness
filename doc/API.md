# DreamFitness API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `/api/auth/login` endpoint.

---

## Endpoints Overview

| Tag                             | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| [Auth](#auth)                   | Authentication, profile, and balance management |
| [Trainings](#trainings)         | Trainers, trainings, and schedule               |
| [Booking](#booking)             | Training bookings and waitlist                  |
| [Notifications](#notifications) | User notifications                              |
| [Health](#health)               | Health check                                    |

---

## Auth

### Register

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "birthDate": "1990-01-01",
  "gender": "male"
}
```

**Response:** `201 Created`

```json
{
  "accessToken": "jwt-access-token",
  "user": "user-created-object"
}
```

---

### Login

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "jwt-access-token"
}
```

// Set-Cookie: refreshToken=...

---

### Refresh Token

```
POST /api/auth/refresh
```

**NO Request Body:**
Cookie: refreshToken=...

**Response:** `200 ОК`

```json
{
  "accessToken": "jwt-access-token"
}
```

---

### Logout

```
POST /api/auth/logout
```

**Auth:** Required (Bearer)

**Response:** `201 Created`

---

### Get Profile

```
GET /api/auth/me
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Update Profile

```
PATCH /api/auth/me
```

**Auth:** Required (Bearer)

**Request Body:** Same as [Register](#register)

**Response:** `200 OK`

---

### Get Balance

```
GET /api/auth/balance
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Deposit

```
POST /api/auth/balance/deposit
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "amount": 100,
  "description": "Deposit for training"
}
```

**Response:** `201 Created`

---

### Reserve (for booking)

```
POST /api/auth/balance/reserve
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "amount": 500,
  "description": "Reserve for training"
}
```

**Response:** `201 Created`

---

### Release

```
POST /api/auth/balance/release
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "amount": 500,
  "description": "Release reserved funds"
}
```

**Response:** `201 Created`

---

### Refund

```
POST /api/auth/balance/refund
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "amount": 500,
  "description": "Refund for cancelled training"
}
```

**Response:** `201 Created`

---

### Get Transactions

```
GET /api/auth/transactions
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

## Trainings

### Get Trainers

```
GET /api/trainers
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Trainer by ID

```
GET /api/trainers/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Trainer UUID

**Response:** `200 OK`

---

### Create Trainer (Admin)

```
POST /api/trainers
```

**Auth:** Required (Bearer + Admin role)

**Request Body:**

```json
{
  "name": "John Smith",
  "bio": "Experienced fitness trainer",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response:** `201 Created`

---

### Update Trainer (Admin)

```
PATCH /api/trainers/{id}
```

**Auth:** Required (Bearer + Admin role)

**Parameters:**

- `id` (path) - Trainer UUID

**Request Body:**

```json
{
  "name": "John Smith",
  "bio": "Updated bio",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "isActive": true
}
```

**Response:** `200 OK`

---

### Delete Trainer (Admin)

```
DELETE /api/trainers/{id}
```

**Auth:** Required (Bearer + Admin role)

**Parameters:**

- `id` (path) - Trainer UUID

**Response:** `200 OK`

---

### Get Trainings

```
GET /api/trainings
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Training by ID

```
GET /api/trainings/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Training UUID

**Response:** `200 OK`

---

### Create Training (Admin)

```
POST /api/trainings
```

**Auth:** Required (Bearer + Admin role)

**Request Body:**

```json
{
  "title": "Morning Yoga",
  "description": "A relaxing yoga session",
  "type": "yoga",
  "trainerId": "550e8400-e29b-41d4-a716-446655440000",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "durationMinutes": 60,
  "capacity": 20,
  "price": 500
}
```

**Training Types:** `yoga`, `pilates`, `crossfit`, `boxing`, `strength`, `cardio`, `dance`, `stretching`

**Response:** `201 Created`

---

### Update Training (Admin)

```
PATCH /api/trainings/{id}
```

**Auth:** Required (Bearer + Admin role)

**Parameters:**

- `id` (path) - Training UUID

**Request Body:**

```json
{
  "title": "Updated Yoga",
  "status": "cancelled"
}
```

**Training Status:** `scheduled`, `cancelled`, `completed`

**Response:** `200 OK`

---

### Delete Training (Admin)

```
DELETE /api/trainings/{id}
```

**Auth:** Required (Bearer + Admin role)

**Parameters:**

- `id` (path) - Training UUID

**Response:** `200 OK`

---

### Get Schedule

```
GET /api/schedule
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Schedule by Date

```
GET /api/schedule/{date}
```

**Auth:** Required (Bearer)

**Parameters:**

- `date` (path) - Date in format `YYYY-MM-DD`

**Response:** `200 OK`

---

## Booking

### Get Bookings

```
GET /api/bookings
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Booking by ID

```
GET /api/bookings/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Booking UUID

**Response:** `200 OK`

---

### Create Booking

```
POST /api/bookings
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "trainingId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `201 Created`

---

### Cancel Booking

```
DELETE /api/bookings/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Booking UUID

**Request Body:**

```json
{
  "reason": "Unable to attend"
}
```

**Response:** `200 OK`

---

### Get Waitlist

```
GET /api/waitlist
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Waitlist Position

```
GET /api/waitlist/{trainingId}
```

**Auth:** Required (Bearer)

**Parameters:**

- `trainingId` (path) - Training UUID

**Response:** `200 OK`

---

### Join Waitlist

```
POST /api/waitlist
```

**Auth:** Required (Bearer)

**Request Body:**

```json
{
  "trainingId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `201 Created`

---

### Leave Waitlist

```
DELETE /api/waitlist/{trainingId}
```

**Auth:** Required (Bearer)

**Parameters:**

- `trainingId` (path) - Training UUID

**Response:** `200 OK`

---

## Notifications

### Get Notifications

```
GET /api/notifications
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Notification by ID

```
GET /api/notifications/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Notification UUID

**Response:** `200 OK`

---

### Delete Notification

```
DELETE /api/notifications/{id}
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Notification UUID

**Response:** `200 OK`

---

### Delete All Notifications

```
DELETE /api/notifications
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Get Unread Count

```
GET /api/notifications/unread-count
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

### Mark as Read

```
PATCH /api/notifications/{id}/read
```

**Auth:** Required (Bearer)

**Parameters:**

- `id` (path) - Notification UUID

**Response:** `200 OK`

---

### Mark All as Read

```
PATCH /api/notifications/read-all
```

**Auth:** Required (Bearer)

**Response:** `200 OK`

---

## Health

### Health Check

```
GET /health
```

**Auth:** Not required

**Response:** `200 OK`

---

## Data Types

### Enums

**User Gender:**

- `male`
- `female`

**Training Type:**

- `yoga`
- `pilates`
- `crossfit`
- `boxing`
- `strength`
- `cardio`
- `dance`
- `stretching`

**Training Status:**

- `scheduled`
- `cancelled`
- `completed`

**Booking Status:**

- `confirmed`
- `cancelled`
- `completed`

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at: [`openapi.json`](./openapi.json)

You can view it in:

- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](http://localhost:3000/api/docs) (when backend is running)
