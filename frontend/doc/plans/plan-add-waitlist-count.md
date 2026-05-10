# Plan: Add Waitlist Count to TrainingsTable

## Overview

Add waitlist count information to the admin TrainingsTable component to help administrators understand demand for fully booked training sessions.

**Related:** [`impl-plan-admin-pages.md`](./impl-plan-admin-pages.md) - основной план реализации административных страниц.

## Current State

### Backend

- [`TrainingResponseDto`](../../../backend/libs/contracts/src/training/training.dto.ts) contains `currentParticipants` and `availableSlots` but NOT `waitlistCount`
- [`trainings.service.ts`](../../../backend/apps/training-service/src/trainings/trainings.service.ts) already fetches `bookingCount` which includes `waitlistCount` but only uses `confirmedCount`
- [`TrainingBookingCountDto`](../../src/types/api.generated.ts) in the API has both `confirmedCount` and `waitlistCount`

### Frontend

- [`impl-plan-admin-pages.md`](./impl-plan-admin-pages.md) shows TrainingsTable with columns: Название, Тип, Тренер, Дата/Время, Места, Статус, Действия
- "Места" column shows format like "5/20" (booked/total)

## Implementation Plan

### Phase 1: Backend Changes

#### 1.1 Update TrainingResponseDto

**File:** `backend/libs/contracts/src/training/training.dto.ts`

Add `waitlistCount` field after `availableSlots`:

```typescript
export class TrainingResponseDto {
  // ... existing fields ...

  @ApiProperty()
  availableSlots: number;

  @ApiProperty({description: 'Number of users on the waitlist'})
  waitlistCount: number;

  @ApiProperty()
  price: number;

  // ... rest of fields ...
}
```

#### 1.2 Update trainings.service.ts

**File:** `backend/apps/training-service/src/trainings/trainings.service.ts`

Modify `toResponseDto` method to include `waitlistCount`:

```typescript
private async toResponseDto(
  training: Training,
): Promise<TrainingResponseDto> {
  const trainer = await this.trainersService.findById(training.trainerId);
  let currentParticipants = 0;
  let waitlistCount = 0;
  try {
    const bookingCount = await this.bookingClientService.getBookingCount(
      training.id,
    );
    currentParticipants = bookingCount.confirmedCount;
    waitlistCount = bookingCount.waitlistCount;
  } catch {
    // If booking service is unavailable, use 0
  }
  const availableSlots = Math.max(0, training.capacity - currentParticipants);
  return {
    id: training.id,
    trainerId: training.trainerId,
    trainerName: trainer?.name ?? undefined,
    title: training.title,
    description: training.description,
    type: training.type,
    scheduledAt: training.scheduledAt.toISOString(),
    durationMinutes: training.durationMinutes,
    capacity: training.capacity,
    currentParticipants,
    availableSlots,
    waitlistCount, // NEW FIELD
    price: training.price,
    status: training.status,
    createdAt: training.createdAt.toISOString(),
    updatedAt: training.updatedAt.toISOString(),
  };
}
```

### Phase 2: Update Documentation

#### 2.1 Update impl-plan-admin-pages.md

Update the TrainingsTable section to document the new waitlist display:

```markdown
#### TrainingsTable

**Колонки:** Название, Тип, Тренер, Дата/Время, Места, Листа ожидания, Статус, Действия

**Места:** Формат "X/Y" где X - записавшихся, Y - вместимость.
Если тренировка заполнена и есть лист ожидания, то количество ожидающих показывается в столбце "Лист ожидания"
```

## Files to Modify

| File                                                               | Change                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| `backend/libs/contracts/src/training/training.dto.ts`              | Add `waitlistCount` field                                 |
| `backend/apps/training-service/src/trainings/trainings.service.ts` | Populate `waitlistCount` in `toResponseDto`               |
| `backend/apps/api-gateway/src/proxy/training.proxy.ts`             | No changes needed - uses shared DTO from `@app/contracts` |
| `frontend/doc/plans/impl-plan-admin-pages.md`                      | Update documentation                                      |

### API Gateway Note

The API Gateway (`backend/apps/api-gateway/src/proxy/training.proxy.ts`) uses a proxy pattern and imports `TrainingResponseDto` from the shared `@app/contracts/training` library. Since the DTO is defined in the shared contracts library:

1. **No code changes required** in API Gateway
2. **Swagger documentation updates automatically** when contracts are rebuilt
3. **Response passthrough** works transparently - the new `waitlistCount` field will be passed through without modification

## Testing

### Backend Tests

- Update existing unit tests for `toResponseDto` to verify `waitlistCount` is included
- Add test case for training with waitlist

## Dependencies

- No new npm packages required
- Backend booking service already provides `waitlistCount` via `getBookingCount`

## Risks

| Risk                                    | Mitigation                                                  |
| --------------------------------------- | ----------------------------------------------------------- |
| Performance impact from additional data | Already fetching booking count; just using additional field |
| API breaking change                     | Adding optional field is backward compatible                |
