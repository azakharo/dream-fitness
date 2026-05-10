# AGENTS.md

## Описание проекта

Frontend для системы управления фитнес-клубом DreamFitness. Веб-приложение на React 19 + TypeScript с Vite.

Клиенты могут пополнять баланс, записываться на групповые и индивидуальные тренировки. Администраторы контролируют заполненность тренировок и состояние счетов пользователей.

## Основные документы

- [PRD](../doc/PRD.md) — требования к продукту
- [Требования к UI](../doc/UI.md) — функциональные требования к интерфейсу
- [Frontend ADR](../doc/Frontend-ADR.md) — архитектурные решения
- [OpenAPI 3.0 спецификация](../doc/openapi.json) — полное описание API бекенда
- [Краткое описание API](../doc/API.md) — основные эндпоинты
- [Автогенерируемые типы](./src/types/types.ts) — типы данных из OpenAPI (НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ)

## Технологический стек

| Категория     | Технология            | Версия |
| ------------- | --------------------- | ------ |
| Framework     | React                 | 19.2   |
| Language      | TypeScript            | 5.9    |
| Build Tool    | Vite                  | 7.2    |
| Routing       | TanStack Router       | Latest |
| Server State  | TanStack Query        | Latest |
| Client State  | Zustand               | Latest |
| HTTP Client   | ky                    | 1.7    |
| UI Components | shadcn/ui + Radix     | Latest |
| Styling       | Tailwind CSS          | 4.2    |
| Forms         | React Hook Form + Zod | Latest |
| Linting       | ESLint + Prettier     | Latest |

## Архитектурные особенности

- **State Management**: Zustand для client state (UI), TanStack Query для server state (API data)
- **Type Generation**: Типы генерируются из OpenAPI спецификации через `npm run gen:types`
- **Auth**: Access token в Zustand + sessionStorage, Refresh token в HTTP-only cookie
- **API Client**: ky с auto-refresh токена через hooks (beforeRequest, afterResponse)
- **Routing**: TanStack Router с file-based routing и route loaders
- **Forms**: React Hook Form с Zod schema валидацией

## Структура проекта

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui компоненты
│   │   ├── layout/                 # Layout компоненты (ClientLayout, AdminLayout)
│   │   ├── auth/                   # Auth компоненты (LoginForm, ProtectedRoute)
│   │   ├── client/                 # Компоненты для клиентских (пользовательских) страниц
│   │   ├── admin/                  # Компоненты для страниц администратора
│   │   └── common/                 # Общие компоненты (LoadingSpinner, EmptyState)
│   ├── pages/                      # Страницы приложения
│   │   ├── auth/                   # Login, Register
│   │   ├── client/                 # Пользовательские страницы: Dashboard, Schedule, Booking, Profile, History
│   │   └── admin/                  # Страницы администратора: Admin Dashboard, Schedule, Users, Reports
│   ├── hooks/                      # Custom hooks (useTrainings, useBookings, etc.)
│   ├── stores/                     # Zustand stores (auth-store, ui-store)
│   ├── lib/                        # Utilities (api-client, utils, constants).
│   ├── routers/                    # Tanstack Router routes
│   ├── schemas/                    # Zod schemas для валидации форм
│   ├── types/                      # TypeScript типы
│   │   ├── api.generated.ts        # Автогенерируется (НЕ РЕДАКТИРОВАТЬ)
│   │   ├── constants.ts            # Runtime values для UI (dropdowns, filters)
│   │   └── index.ts                # Re-export всех типов
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── components.json                 # shadcn/ui конфигурация
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

## npm команды

| Команда             | Описание                                   |
| ------------------- | ------------------------------------------ |
| `npm install`       | Установка зависимостей                     |
| `npm run dev`       | Запуск dev-сервера (http://localhost:5173) |
| `npm run build`     | Production build (папка `dist/`)           |
| `npm run preview`   | Предпросмотр production build              |
| `npm run ts`        | Проверка TypeScript ошибок                 |
| `npm run lint`      | Линтинг и автоформатирование кода          |
| `npm run gen:types` | Генерация типов из OpenAPI спецификации    |

## Правила по работе с кодом

- Если во время выполнения задачи изменялись TypeScript или JavaScript файлы исходного кода, то после выполнения задачи (в самом конце), нужно проверить, нет ли ошибок TypeScript (`npm run ts`) или нарушения других принятых правил кодирования (`npm run lint`). Обнаруженные проблемы необходимо исправить.
- Если во время выполнения задачи изменился backend API, нужно напомнить пользователю выполнить авто-генерацию типов данных: `npm run gen:types`.
- Файл `src/types/api.generated.ts` автогенерируется и НЕ должен редактироваться вручную.
- The Date → string and similar conversions should happen in the API client layer, keeping backend-specific formatting out of UI components. This follows the principle that UI should work with native types while the API layer handles serialization.
- Все файлы React компонентов (pages, components и т.д.) именуются в **PascalCase**, идентично названию экспортируемого компонента.

## Правила работы с датой и временем

Все операции с датой и временем должны выполняться через функции из [`src/lib/date-utils.ts`](src/lib/date-utils.ts). Используется библиотека `date-fns` с русской локализацией.

### Основные принципы

1. **Использовать тип Date внутри UI**: Компоненты должны работать с нативными объектами `Date`, а не со строками.
2. **Конвертация на границе API**: Преобразование `Date ↔ string` происходит только в слое API клиента.
3. **Единая точка входа**: Все форматирование и манипуляции с датами — через `date-utils.ts`.

### Константы форматов

Форматы определены в [`src/lib/constants.ts`](src/lib/constants.ts):

- `DATE_FORMAT = 'dd.MM.yyyy'`
- `TIME_FORMAT = 'HH:mm'`
- `DATETIME_FORMAT = 'dd.MM.yyyy HH:mm'`
