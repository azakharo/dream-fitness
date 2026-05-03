# Fix Refresh Token Security Issue

> **Status**: Ready for implementation
> **Decisions**:
>
> - Token rotation: No (can be added later)
> - Cookie secure flag: Auto-detect based on NODE_ENV

## Problem Statement

According to [`doc/ADR.md:431`](doc/ADR.md:431), the refresh token should be stored in an **HTTP-only cookie**:

| Token         | Lifetime | Storage                 |
| ------------- | -------- | ----------------------- |
| Access Token  | 15 min   | Memory / Frontend state |
| Refresh Token | 7 days   | HTTP-only cookie        |

However, the current implementation returns the refresh token in the response body at [`auth.controller.ts:43-46`](backend/apps/auth-service/src/auth/auth.controller.ts:43):

```typescript
return {
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken, // ❌ Security issue
};
```

This is a security vulnerability because:

1. **XSS exposure** - JavaScript can access the refresh token
2. **Incorrect storage** - HTTP-only cookies are not accessible to JavaScript

---

## Implementation Plan

### Phase 1: Backend Changes

#### 1.1 Update Auth Service Controller

**File:** [`backend/apps/auth-service/src/auth/auth.controller.ts`](backend/apps/auth-service/src/auth/auth.controller.ts)

- Modify `login` endpoint to:
  - Set refresh token as HTTP-only cookie
  - Return only `accessToken` in response body

- Modify `refresh` endpoint to:
  - Read refresh token from cookie instead of body
  - Set new refresh token as HTTP-only cookie
  - Return only `accessToken` in response body

- Modify `logout` endpoint to:
  - Clear the refresh token cookie

- Modify `register` endpoint to:
  - Set refresh token as HTTP-only cookie
  - Return only `accessToken` and user data in response body

#### 1.2 Update Auth Service

**File:** [`backend/apps/auth-service/src/auth/auth.service.ts`](backend/apps/auth-service/src/auth/auth.service.ts)

- No changes needed - service already generates tokens correctly

#### 1.3 Update DTOs

**File:** [`backend/libs/contracts/src/auth/auth.dto.ts`](backend/libs/contracts/src/auth/auth.dto.ts)

- Update `LoginResponseBody` to only include `accessToken`
- Update `RegisterResponseBody` to only include `accessToken` and `user`
- Remove `RefreshTokenDto` or mark it as deprecated
- Create new response DTOs if needed

#### 1.4 Update API Gateway Proxy

**File:** [`backend/apps/api-gateway/src/proxy/auth.proxy.ts`](backend/apps/api-gateway/src/proxy/auth.proxy.ts)

- Update `login` endpoint to:
  - Forward the `Set-Cookie` header from auth-service to client
  - Return only `accessToken` in response

- Update `refresh` endpoint to:
  - Read refresh token from cookie
  - Forward it to auth-service
  - Forward the new `Set-Cookie` header

- Update `logout` endpoint to:
  - Forward the `Set-Cookie` header that clears the cookie

- Update `register` endpoint similarly to login

#### 1.5 Update Tests

**Files:**

- [`backend/apps/auth-service/test/auth.e2e-spec.ts`](backend/apps/auth-service/test/auth.e2e-spec.ts)
- [`backend/apps/auth-service/src/auth/auth.controller.spec.ts`](backend/apps/auth-service/src/auth/auth.controller.spec.ts)

- Update tests to verify cookie handling
- Update tests to verify response body only contains `accessToken`

---

### Phase 2: Frontend Changes

#### 2.1 Update Auth API Client

**File:** `frontend/src/api/auth.ts` (or similar)

- Remove refresh token handling from response
- Ensure cookies are sent with requests (`credentials: 'include'`)

#### 2.2 Update Auth Store/Context

**File:** `frontend/src/store/authStore.ts` (or similar)

- Remove refresh token from state
- Update token refresh logic to use cookie-based refresh

---

## Cookie Configuration

```typescript
// Cookie settings - auto-detect based on NODE_ENV
const cookieOptions = {
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/", // Available for all routes
};
```

**Note:** In development (`NODE_ENV !== 'production'`), `secure: false` allows cookies over HTTP. In production, `secure: true` ensures cookies are only sent over HTTPS.

---

## API Contract Changes

### Before

```typescript
// POST /api/auth/login
// Request
{ email: string, password: string }

// Response
{ accessToken: string, refreshToken: string }

// POST /api/auth/refresh
// Request
{ refreshToken: string }

// Response
{ accessToken: string, refreshToken: string }
```

### After

```typescript
// POST /api/auth/login
// Request
{ email: string, password: string }

// Response
{ accessToken: string }
// Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800

// POST /api/auth/refresh
// Request
Cookie: refreshToken=...

// Response
{ accessToken: string }
// Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800

// POST /api/auth/logout
// Response
{ message: string }
// Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

---

## Files to Modify

| File                                                         | Changes                                              |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| `backend/apps/auth-service/src/auth/auth.controller.ts`      | Cookie handling for login, refresh, logout, register |
| `backend/libs/contracts/src/auth/auth.dto.ts`                | Update response DTOs                                 |
| `backend/apps/api-gateway/src/proxy/auth.proxy.ts`           | Forward cookies                                      |
| `backend/apps/auth-service/test/auth.e2e-spec.ts`            | Update tests                                         |
| `backend/apps/auth-service/src/auth/auth.controller.spec.ts` | Update unit tests                                    |

---

## Security Considerations

1. **HTTPS Required** - Cookies with `secure: true` only work over HTTPS (production)
2. **CSRF Protection** - `sameSite: 'strict'` provides CSRF protection
3. **Development** - `secure: false` allows HTTP in development mode
4. **CORS** - Ensure credentials are allowed: `credentials: 'include'`
5. **Token Rotation** - Not implemented in this phase (can be added later)
