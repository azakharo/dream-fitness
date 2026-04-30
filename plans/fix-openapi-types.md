# Plan: Fix OpenAPI Type Generation

## Problem Analysis

After analyzing the generated types in [`api.generated.ts`](../../frontend/src/types/api.generated.ts) and backend DTOs, I found the following issues:

### Issue 1: UserProfileDto is empty in generated types

**Current state in generated types:**

```typescript
UserProfileDto: Record<string, never>;
```

**Root cause:** The [`UserProfileDto`](../../backend/libs/contracts/src/auth/auth.dto.ts:81) class in backend has fields defined but is **missing `@ApiProperty()` decorators**. Without these decorators, NestJS Swagger doesn't include the fields in the OpenAPI spec.

**Backend DTO (missing decorators):**

```typescript
export class UserProfileDto {
  id: string; // Missing @ApiProperty()
  email: string; // Missing @ApiProperty()
  name: string; // Missing @ApiProperty()
  phone: string | null; // Missing @ApiProperty()
  // ... other fields
}
```

### Issue 2: UserDto also missing decorators

The [`UserDto`](../../backend/libs/contracts/src/auth/auth.dto.ts:68) class has the same problem - no `@ApiProperty()` decorators.

### Issue 3: Frontend uses manual types instead of generated

**Current frontend code:**

- [`User`](../../frontend/src/stores/auth-store.ts:4) interface defined manually
- [`RefreshResponse`](../../frontend/src/stores/auth-store.ts:29) interface defined manually

**Should use generated types:**

- `components['schemas']['UserProfileDto']` for User
- `components['schemas']['LoginResponseBody']` for refresh response

---

## Solution

### Step 1: Fix Backend DTOs

Add `@ApiProperty()` decorators to the following DTOs in [`backend/libs/contracts/src/auth/auth.dto.ts`](../../backend/libs/contracts/src/auth/auth.dto.ts):

#### 1.1 UserDto (lines 68-79)

```typescript
export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  birthDate: string | null;

  @ApiPropertyOptional({ enum: UserGender })
  gender: UserGender | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: string;
}
```

#### 1.2 UserProfileDto (lines 81-93)

```typescript
export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  birthDate: string | null;

  @ApiPropertyOptional({ enum: UserGender })
  gender: UserGender | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
```

### Step 2: Regenerate Frontend Types

After fixing backend DTOs:

```bash
cd ../frontend
npm run gen:types
```

### Step 3: Update Frontend Auth Store

Update [`frontend/src/stores/auth-store.ts`](../../frontend/src/stores/auth-store.ts):

#### 3.1 Remove manual User interface

Delete lines 4-13:

```typescript
// DELETE THIS
export interface User {
  id: string;
  email: string;
  role: "client" | "admin";
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.2 Import generated type

```typescript
import type { components } from "@/types/api.generated";

type User = components["schemas"]["UserProfileDto"];
```

#### 3.3 Remove RefreshResponse interface

Delete lines 29-31:

```typescript
// DELETE THIS
interface RefreshResponse {
  accessToken: string;
}
```

#### 3.4 Use generated LoginResponseBody

```typescript
type RefreshResponse = components["schemas"]["LoginResponseBody"];
```

Or use directly in the code since it returns both `accessToken` and `refreshToken`.

---

## Files to Modify

| File                                          | Changes                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| `backend/libs/contracts/src/auth/auth.dto.ts` | Add @ApiProperty decorators to UserDto and UserProfileDto |
| `frontend/src/stores/auth-store.ts`           | Use generated types instead of manual interfaces          |
| `frontend/src/types/api.generated.ts`         | Regenerate after backend fix                              |

---

## Verification

After making changes:

1. Start backend and verify OpenAPI spec contains UserProfileDto fields
2. Regenerate frontend types
3. Verify TypeScript compilation passes
4. Verify frontend auth flow works correctly
