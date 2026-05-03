# Frontend ADR (Architecture Decision Record)

## Контекст

- [Функциональные требования к фронтенду](./UI.md)
- [архитектура Backend](./ADR.md)
- [OpenApi спецификация REST API Backend](../frontend/doc/openapi.json)
- [Краткое описание REST API Backend](../frontend/doc/API.md)

---

## 1. Технологический стек

| Категория      | Технология                  | Версия |
| -------------- | --------------------------- | ------ |
| Язык           | TypeScript                  | 5.9    |
| Фреймворк      | React                       | 19.2   |
| Build Tool     | Vite                        | 7.2    |
| UI Kit         | shadcn/ui + Radix           | Latest |
| Styling        | Tailwind CSS                | 4.2    |
| HTTP Client    | ky                          | 1.7    |
| React Compiler | babel-plugin-react-compiler | latest |

---

## 2. Маршрутизация

### Решение

**TanStack Router**

### Обоснование

| Аргумент           | Обоснование                                              |
| ------------------ | -------------------------------------------------------- |
| Type-safety        | Полная типизация маршрутов и параметров                  |
| Интеграция с Query | Нативная интеграция с TanStack Query через route loaders |
| Built-in Loaders   | Загрузка данных на уровне маршрута до рендера            |
| Typed Params       | Автоматическая типизация params, search params           |
| File-based Routing | Генерация route tree из файловой структуры               |

### Структура маршрутов

```
/                    → Redirect to /dashboard
/login               → Auth Layout
/register            → Auth Layout

--- Client Routes (ClientLayout) ---
/dashboard           → Dashboard page
/schedule            → Schedule page
/booking/:id         → Booking page
/profile             → Profile page
/history             → History page
/notifications       → Notifications page

--- Admin Routes (AdminLayout) ---
/admin               → Admin Dashboard
/admin/schedule      → Schedule Management
/admin/schedule/new  → Create Training
/admin/schedule/:id  → Edit Training
/admin/users         → Users Management
/admin/reports       → Reports
```

---

## 3. Управление состоянием

### Решение

**Zustand + TanStack Query** с разделением ответственности.

### Обоснование

| Библиотека     | Назначение              | Почему                              |
| -------------- | ----------------------- | ----------------------------------- |
| Zustand        | Client state (UI)       | Минималистичный, простой API        |
| TanStack Query | Server state (API data) | Кеширование, refetch, deduplication |

### Разделение состояния

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend State                        │
├─────────────────────────┬───────────────────────────────┤
│      Zustand Store      │      TanStack Query Cache     │
│    (Client State)       │      (Server State)           │
├─────────────────────────┼───────────────────────────────┤
│ • auth (user, token)    │ • trainings (list)            │
│ • sidebarOpen           │ • bookings                    │
│ • notificationsBadge    │ • userProfile                 │
│ • toastQueue            │ • notifications               │
│ • modalState            │ • schedules                   │
└─────────────────────────┴───────────────────────────────┘
```

### Zustand Store структура

```typescript
// stores/auth-store.ts
interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;

  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  setUser: (user: User) => void;
}

// stores/ui-store.ts
interface UIStore {
  sidebarOpen: boolean;
  toasts: Toast[];

  toggleSidebar: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

---

## 4. API Client

### Решение

**ky** — современный HTTP клиент на базе fetch с поддержкой хуков.

### Обоснование

| Аргумент        | Обоснование                                         |
| --------------- | --------------------------------------------------- |
| Хуки            | beforeRequest/afterResponse для автоинъекции токена |
| TypeScript      | Отличная типизация из коробки                       |
| Минимализм      | ~13 KB, один dependency                             |
| Современный API | Promise-based, automatic JSON parsing               |
| Error handling  | HTTP ошибки автоматически throw как KyError         |

### Реализация

```typescript
// lib/api-client.ts
import ky, { KyError } from "ky";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = "/api";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API Error: ${status}`);
    this.name = "ApiError";
  }
}

/**
 * Base ky instance with auto token injection and refresh logic
 */
const kyInstance = ky.create({
  prefixUrl: API_BASE,
  credentials: "include", // For HTTP-only cookies (refresh token)
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeError: [
      (error) => {
        // Convert KyError to ApiError for consistent error handling
        const { response } = error;
        if (response) {
          return new ApiError(response.status, error);
        }
        return error;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401 && !request.url.includes("/auth/")) {
          try {
            await useAuthStore.getState().refreshTokens();
            const newToken = useAuthStore.getState().accessToken;
            request.headers.set("Authorization", `Bearer ${newToken}`);
            return ky(request);
          } catch {
            useAuthStore.getState().logout();
          }
        }
      },
    ],
  },
});

/**
 * Convenience API methods with typed responses
 */
export const api = {
  get: <T>(endpoint: string) => kyInstance.get(endpoint).json<T>(),

  post: <T>(endpoint: string, body?: unknown) =>
    kyInstance.post(endpoint, { json: body }).json<T>(),

  put: <T>(endpoint: string, body?: unknown) =>
    kyInstance.put(endpoint, { json: body }).json<T>(),

  delete: <T>(endpoint: string) => kyInstance.delete(endpoint).json<T>(),
};
```

### Использование с TanStack Query

```typescript
// hooks/use-trainings.ts
export const useTrainings = (filters?: TrainingFilters) => {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["trainings", filters],
    queryFn: () => api.get<Training[]>("trainings"),
    enabled: !!accessToken,
  });
};

// hooks/use-create-booking.ts
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: string) =>
      api.post<Booking>("bookings", { trainingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
```

---

## 4.1. Type Generation from OpenAPI

### Решение

**openapi-typescript** для генерации TypeScript типов из OpenAPI спецификации backend.

### Обоснование

| Аргумент               | Обоснование                                       |
| ---------------------- | ------------------------------------------------- |
| Single Source of Truth | Типы генерируются из OpenAPI спецификации backend |
| Type Safety            | Полная типизация API запросов и ответов           |
| Auto-sync              | Обновление типов при изменении API                |
| No manual maintenance  | Исключает ручное написание и поддержку API типов  |

### Реализация

```bash
# Установка
npm i -D -E openapi-typescript

# Генерация типов
npx openapi-typescript frontend/doc/openapi.json -o frontend/src/types/api.generated.ts
```

### Использование

```typescript
// types/api.generated.ts - автогенерируемый файл
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ

import type { paths, components } from "./api.generated";

// Типы для API ответов
type Training = components["schemas"]["TrainingResponseDto"];
type Booking = components["schemas"]["BookingResponseDto"];
type User = components["schemas"]["UserResponseDto"];

// Типы для API запросов
type CreateBookingRequest = components["schemas"]["CreateBookingDto"];
type LoginRequest = components["schemas"]["LoginDto"];

// Типизированные API методы
export const api = {
  getTrainings: () =>
    kyInstance
      .get("trainings")
      .json<components["schemas"]["TrainingResponseDto"][]>(),

  createBooking: (body: components["schemas"]["CreateBookingDto"]) =>
    kyInstance
      .post("bookings", { json: body })
      .json<components["schemas"]["BookingResponseDto"]>(),
};
```

### Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Type Generation Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Backend: Swagger генерирует OpenAPI spec                    │
│     /api/docs-json → openapi.json                               │
│                                                                 │
│  2. Copy openapi.json to frontend/doc/openapi.json              │
│                                                                 │
│  3. Run: npx openapi-typescript frontend/doc/openapi.json       │
│        -o frontend/src/types/api.generated.ts                   │
│                                                                 │
│  4. Import и использование типов в компонентах и hooks          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4.2. Runtime Constants for UI

### Решение

**Использовать сгенерированные union types + runtime constants** для UI компонентов (dropdowns, filters).

### Обоснование

| Аргумент               | Обоснование                                           |
| ---------------------- | ----------------------------------------------------- |
| Single Source of Truth | Типы генерируются из OpenAPI, всегда синхронизированы |
| No manual sync         | Не нужно копировать enum'ы из backend                 |
| Type Safety            | TypeScript проверяет соответствие значений типам      |
| Runtime values         | Массивы значений для dropdowns и итерации             |

### Реализация

openapi-typescript генерирует union types, не TypeScript enum'ы:

```typescript
// types/api.generated.ts - автогенерируется
export type components = {
  schemas: {
    TrainingType:
      | "yoga"
      | "pilates"
      | "crossfit"
      | "boxing"
      | "strength"
      | "cardio"
      | "dance"
      | "stretching";
    UserGender: "male" | "female";
    UserRole: "client" | "admin";
    BookingStatus: "confirmed" | "cancelled";
    // ...
  };
};
```

Для UI компонентов (dropdowns, filters) создаём runtime constants:

```typescript
// types/constants.ts
import type { components } from "./api.generated";

// Extract types for convenience
type TrainingType = components["schemas"]["TrainingType"];
type UserGender = components["schemas"]["UserGender"];
type UserRole = components["schemas"]["UserRole"];

// Runtime values for UI (dropdowns, filters)
export const TRAINING_TYPES: TrainingType[] = [
  "yoga",
  "pilates",
  "crossfit",
  "boxing",
  "strength",
  "cardio",
  "dance",
  "stretching",
];

export const USER_GENDERS: UserGender[] = ["male", "female"];

export const USER_ROLES: UserRole[] = ["client", "admin"];

// Dropdown options with labels
export const TRAINING_TYPE_OPTIONS = TRAINING_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1), // "Yoga", "Pilates", etc.
}));

export const USER_GENDER_OPTIONS = USER_GENDERS.map((gender) => ({
  value: gender,
  label: gender === "male" ? "Мужской" : "Женский",
}));
```

### Использование в компонентах

```typescript
// components/training-filter.tsx
import { TRAINING_TYPE_OPTIONS } from "@/types/constants";
import { Select } from "@/components/ui/select";

export const TrainingFilter = () => {
  return (
    <Select options={TRAINING_TYPE_OPTIONS} placeholder="Выберите тип тренировки" />
  );
};
```

### Преимущества подхода

- ✅ Типы всегда синхронизированы с backend через openapi-typescript
- ✅ TypeScript проверит, что значения в constants соответствуют типам
- ✅ Если backend добавит новое значение — TypeScript покажет ошибку в constants.ts
- ✅ Нет дублирования enum'ов между backend и frontend

### Структура файлов

```
frontend/src/types/
├── api.generated.ts      # Автогенерируется из OpenAPI (НЕ РЕДАКТИРОВАТЬ)
├── constants.ts          # Runtime values для UI (dropdowns, filters)
└── index.ts              # Re-export всех типов и констант
```

---

## 5. Формы и валидация

### Решение

**React Hook Form + Zod**

### Обоснование

| Аргумент    | Обоснование                                       |
| ----------- | ------------------------------------------------- |
| Performance | Минимум ре-рендеров (неконтролируемые компоненты) |
| Type-safety | Zod schema → TypeScript типы автоматически        |
| Интеграция  | shadcn/ui Form компоненты заточены под RHF        |

### Пример использования

```typescript
// schemas/auth.schema.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Некорректный email"),
    phone: z.string().regex(/^\+7\d{10}$/, "Формат: +79991234567"),
    birthDate: z.string().refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date < now && date > new Date("1900-01-01");
    }, "Некорректная дата рождения"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Выберите пол" }),
    }),
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterForm = z.infer<typeof registerSchema>;
```

```typescript
// components/auth/register-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const RegisterForm = () => {
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterForm) => {
    // data уже типизирован и валидирован
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ...other fields */}
        <Button type="submit" disabled={!form.formState.isValid}>
          Зарегистрироваться
        </Button>
      </form>
    </Form>
  );
};
```

---

## 6. Аутентификация

### Решение

**Access Token в Zustand + sessionStorage / Refresh Token в HTTP-only cookie**

### Обоснование

| Аспект        | Решение                         | Почему                           |
| ------------- | ------------------------------- | -------------------------------- |
| Access Token  | Zustand + sessionStorage backup | Быстрый доступ + восстановление  |
| Refresh Token | HTTP-only cookie                | Защита от XSS, браузер управляет |

### Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                         Login Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. POST /auth/login { email, password }                        │
│     ─────────────────────────────────────────►                  │
│                                                                 │
│  2. Response:                                                   │
│     { accessToken: string, user: User }     ◄─────────────────  │
│     Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite    │
│                                                                 │
│  3. Frontend:                                                   │
│     - Store accessToken in Zustand                              │
│     - Backup to sessionStorage                                  │
│     - Store user in Zustand                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Token Refresh                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trigger: 401 Unauthorized on any API request                   │
│                                                                 │
│  1. POST /auth/refresh                                          │
│     Cookie: refreshToken=... (automatic)                        │
│     ─────────────────────────────────────────►                  │
│                                                                 │
│  2. Response:                                                   │
│     { accessToken: string }                 ◄─────────────────  │
│                                                                 │
│  3. Frontend:                                                   │
│     - Update accessToken in Zustand                             │
│     - Retry original request                                    │
│                                                                 │
│  On failure: Logout user, redirect to /login                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Auth Store Implementation

```typescript
// stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      user: null,
      isLoading: true,

      // Actions
      login: async (credentials) => {
        const response = await api.post<LoginResponse>(
          "/auth/login",
          credentials,
        );
        set({
          accessToken: response.accessToken,
          user: response.user,
        });
      },

      logout: () => {
        set({ accessToken: null, user: null });
        // Optional: call /auth/logout to clear cookie
      },

      refreshTokens: async () => {
        try {
          const response = await api.post<RefreshResponse>("/auth/refresh", {});
          set({ accessToken: response.accessToken });
        } catch {
          get().logout();
          throw new Error("Session expired");
        }
      },

      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
```

### Protected Routes

```typescript
// components/auth/protected-route.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### API Client with Auto-Refresh

Token refresh logic is now integrated into the ky instance via `afterResponse` hook (see Section 4). No separate implementation needed - ky handles automatic retries on 401 responses.

---

## 7. Структура проекта

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Layout components
│   │   │   ├── client-layout.tsx
│   │   │   ├── admin-layout.tsx
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── auth/                  # Auth components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── protected-route.tsx
│   │   └── common/                # Shared components
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       └── confirm-dialog.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── client/
│   │   │   ├── dashboard.tsx
│   │   │   ├── schedule.tsx
│   │   │   ├── booking.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── history.tsx
│   │   │   └── notifications.tsx
│   │   └── admin/
│   │       ├── dashboard.tsx
│   │       ├── schedule/
│   │       │   ├── list.tsx
│   │       │   ├── create.tsx
│   │       │   └── edit.tsx
│   │       ├── users.tsx
│   │       └── reports.tsx
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── use-trainings.ts
│   │   ├── use-bookings.ts
│   │   ├── use-user.ts
│   │   └── use-notifications.ts
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   │
│   ├── lib/                       # Utilities
│   │   ├── api-client.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── schemas/                   # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── booking.schema.ts
│   │   └── user.schema.ts
│   │
│   ├── types/                     # TypeScript types
│   │   ├── api.generated.ts       # Автогенерируется из OpenAPI (НЕ РЕДАКТИРОВАТЬ)
│   │   ├── constants.ts           # Runtime values для UI (dropdowns, filters)
│   │   └── index.ts               # Re-export всех типов и констант
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── router.tsx
│
├── components.json                # shadcn/ui config
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. Интеграция с Backend

### API Endpoints Mapping

| Frontend Request        | Backend Service  | Notes                     |
| ----------------------- | ---------------- | ------------------------- |
| POST /api/auth/login    | Auth Service     | Login with email/password |
| POST /api/auth/register | Auth Service     | New user registration     |
| POST /api/auth/refresh  | Auth Service     | Refresh access token      |
| GET /api/auth/me        | Auth Service     | Get current user profile  |
| GET /api/trainings      | Training Service | List available trainings  |
| POST /api/bookings      | Booking Service  | Book a training session   |
| GET /api/notifications  | Notification Svc | Get user notifications    |

> **Note:** Frontend uses `ky` with `prefixUrl: "/api"`, so actual requests from code like `api.post("/auth/login")` become `/api/auth/login`.

### Vite Proxy Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // API Gateway
        changeOrigin: true,
      },
    },
  },
});
```

---

## 9. Тема приложения (Design System)

### Решение

**Lime Theme** — энергичная, динамичная цветовая схема с оттенками лайма.

### Направление дизайна

**Энергичный и динамичный** — яркие зелёные градиенты, насыщенные цвета, ощущение энергии и движения.

**Референсы:**

- Fitbit — яркие, насыщенные цвета
- Spotify (лаймовый бренд) — энергичный молодёжный стиль
- MyFitnessPal — динамичный спортивный интерфейс

### Цветовая палитра

| Переменная         | Светлая тема                         | Тёмная тема                          | Назначение                   |
| ------------------ | ------------------------------------ | ------------------------------------ | ---------------------------- |
| Primary            | `oklch(0.68 0.22 130)`               | `oklch(0.75 0.22 130)`               | Основной цвет кнопок, ссылок |
| Primary Foreground | `oklch(0.98 0.02 130)`               | `oklch(0.15 0.02 130)`               | Текст на primary             |
| Accent             | `oklch(0.94 0.10 130)`               | `oklch(0.30 0.08 130)`               | Фон для карточек, бейджей    |
| Success            | `oklch(0.72 0.19 142)`               | `oklch(0.75 0.18 145)`               | Успешные действия            |
| Warning            | `oklch(0.80 0.16 85)`                | `oklch(0.82 0.15 85)`                | Предупреждения               |
| Chart gradient     | `oklch(0.68-0.45 0.22-0.14 130-160)` | `oklch(0.75-0.50 0.22-0.14 130-160)` | Графики и визуализации       |

### Цветовой профиль

```
Primary (Lime):  oklch(0.68 0.22 130)  — сочный, энергичный зелёный
Light Lime:      oklch(0.85 0.18 130)  — hover состояния
Dark Lime:       oklch(0.50 0.18 130)  — текст на светлом фоне
Accent BG:       oklch(0.94 0.10 130)  — светлый lime для фонов
```

### CSS утилиты

```css
/* Градиенты для energy-эффектов */
.gradient-primary {
  background: linear-gradient(
    135deg,
    oklch(0.75 0.22 125),
    oklch(0.65 0.2 135)
  );
}
.gradient-primary-hover {
  background: linear-gradient(135deg, oklch(0.7 0.24 128), oklch(0.6 0.22 138));
}

/* Тени с lime-оттенком */
.shadow-primary {
  box-shadow: 0 4px 14px oklch(0.68 0.22 130 / 0.35);
}
.shadow-primary-lg {
  box-shadow: 0 8px 24px oklch(0.68 0.22 130 / 0.4);
}
```

### Структура файлов темы

```
frontend/src/
├── index.css              # CSS переменные темы + утилиты
└── components/
    └── ui/                 # shadcn/ui компоненты
```

### Использование в компонентах

```tsx
// Используем семантические классы
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Записаться
</Button>

// Градиенты для акцентных элементов
<div className="gradient-primary shadow-primary rounded-xl">
  {/* ... */}
</div>

// Семантические цвета
<Badge variant="success">Успешно</Badge>
<Badge variant="warning">Ожидание</Badge>
```

---

## Последствия

Выбранный стек обеспечивает:

- **Знакомый инструментарий** — минимум сюрпризов при разработке
- **Type Safety** — TypeScript + Zod = меньше runtime ошибок
- **Performance** — React Compiler + Zustand + TanStack Query = оптимальная скорость
- **DX** — современные инструменты с хорошим developer experience
