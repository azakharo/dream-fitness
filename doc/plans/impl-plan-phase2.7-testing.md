# План реализации Этапа 2.7: Testing Strategy — Auth Service

## Обзор

**Цель:** Создать полную инфраструктуру тестирования для Auth Service, включая E2E тесты для всех API endpoints, unit тесты для сервисов и контроллеров, а также стратегию продакшн-тестирования.

**Предусловия:** Этапы 2.1–2.6, 2.8 завершены. Auth Service полностью реализован и работает.

**Подход:** Следуем паттернам из справочного проекта (NewsFeed), адаптированным под монорепо NestJS с учётом:

- Path aliases (`@app/contracts`, `@app/shared`)
- Кастомный ConfigModule (читает `process.env` напрямую)
- RabbitMQ зависимость (требует мокирования)
- Несколько таблиц с FK связями (users + transactions)

---

## Структура файлов тестов

```
backend/
├── .env.test                                      # Тестовые переменные окружения
├── apps/auth-service/
│   ├── test/
│   │   ├── jest-e2e.json                          # Jest E2E конфиг для auth-service
│   │   ├── helpers/
│   │   │   ├── app-test.helper.ts                 # Создание тестового приложения
│   │   │   ├── db.helper.ts                       # Очистка и сидирование БД
│   │   │   └── auth.helper.ts                     # Получение JWT токенов для тестов
│   │   ├── fixtures/
│   │   │   └── user.fixtures.ts                   # Фабрики тестовых данных
│   │   ├── mocks/
│   │   │   └── events.module.mock.ts              # Мок RabbitMQ EventsModule
│   │   ├── auth.e2e-spec.ts                       # E2E: регистрация, вход, refresh, logout
│   │   ├── profile.e2e-spec.ts                    # E2E: профиль пользователя
│   │   └── balance.e2e-spec.ts                    # E2E: баланс и транзакции
│   └── src/
│       ├── auth/
│       │   ├── auth.service.spec.ts               # Unit: AuthService
│       │   └── auth.controller.spec.ts            # Unit: AuthController
│       ├── users/
│       │   ├── users.service.spec.ts              # Unit: UsersService
│       │   └── users.controller.spec.ts           # Unit: UsersController
│       └── balance/
│           ├── balance.service.spec.ts            # Unit: BalanceService
│           └── balance.controller.spec.ts         # Unit: BalanceController
└── scripts/
    └── create-test-db.ts                          # Создание тестовой БД
```

---

## 1. Настройка тестового окружения

### 1.1. Установить зависимости

```bash
cd backend
npm i -D -E dotenv-cli
```

> `dotenv-cli` позволяет загружать переменные из `.env.test` перед выполнением команд.

### 1.2. Создать `.env.test`

**Файл:** `backend/.env.test`

```env
# Test Database — отдельная БД, чтобы не затронуть dev-данные
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dreamfitness
DATABASE_PASSWORD=dreamfitness123
DATABASE_NAME=dreamfitness_test

# RabbitMQ — не нужен в E2E тестах, но переменные должны быть
RABBITMQ_URL=amqp://dreamfitness:dreamfitness123@localhost:5672
RABBITMQ_EXCHANGE=dreamfitness.exchange

# JWT — фиксированный секрет для воспроизводимости тестов
JWT_SECRET=test-jwt-secret-key-for-e2e-tests
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Service
PORT=3001
NODE_ENV=test
```

### 1.3. Jest E2E конфигурация для auth-service

**Файл:** `backend/apps/auth-service/test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "testTimeout": 10000,
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "@app/contracts/(.*)": "<rootDir>/../../../libs/contracts/src/$1",
    "@app/contracts": "<rootDir>/../../../libs/contracts/src",
    "@app/shared/(.*)": "<rootDir>/../../../libs/shared/src/$1",
    "@app/shared": "<rootDir>/../../../libs/shared/src"
  }
}
```

> **Почему `rootDir: "."`?** Потому что E2E тесты запускаются из директории `backend/apps/auth-service/test/`, и `moduleNameMapper` пути должны быть относительны от неё. Пути вида `<rootDir>/../../../libs/...` поднимаются от `test/` → `auth-service/` → `apps/` → `backend/` → `libs/`.

### 1.4. NPM скрипты в `package.json`

Добавить в секцию `scripts` файла `backend/package.json`:

```json
{
  "test:db:create": "dotenv -e .env.test -- ts-node -r tsconfig-paths/register scripts/create-test-db.ts",
  "test:db:migrate": "dotenv -e .env.test -- ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts",
  "test:db:seed": "dotenv -e .env.test -- ts-node -r tsconfig-paths/register scripts/seed-test-db.ts",
  "test:setup": "npm run test:db:create ; npm run test:db:migrate",
  "test:e2e:auth": "dotenv -e .env.test -- jest --config apps/auth-service/test/jest-e2e.json",
  "test:e2e:auth:watch": "dotenv -e .env.test -- jest --config apps/auth-service/test/jest-e2e.json --watch"
}
```

> **Примечание:** Используем `;` вместо `&&` для Windows PowerShell совместимости. Если `test:db:create` падает потому что БД уже существует — это нормально, скрипт продолжает выполнение.

---

## 2. Скрипты управления тестовой БД

### 2.1. Создание тестовой БД

**Файл:** `backend/scripts/create-test-db.ts`

```typescript
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load .env.test variables
dotenv.config({ path: ".env.test" });

async function createTestDb() {
  // Connect to default 'postgres' DB to create our test DB
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: "postgres", // Connect to default DB
  });

  await dataSource.initialize();

  try {
    const result = await dataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DATABASE_NAME}'`,
    );

    if (result.length === 0) {
      await dataSource.query(`CREATE DATABASE "${process.env.DATABASE_NAME}"`);
      console.log(`✅ Test database "${process.env.DATABASE_NAME}" created`);
    } else {
      console.log(
        `ℹ️ Test database "${process.env.DATABASE_NAME}" already exists`,
      );
    }
  } finally {
    await dataSource.destroy();
  }
}

void createTestDb();
```

### 2.2. Сидирование тестовой БД

**Файл:** `backend/scripts/seed-test-db.ts`

Скрипт использует `dataSourceOptions` из `src/data-source.ts`, но загружает `.env.test` через `dotenv-cli`. Сидирует минимальный набор данных:

- **Admin пользователь:** `admin@dreamfitness.com` / `admin12345`, role=ADMIN, balance=0
- **Test пользователь:** `test@example.com` / `test12345`, role=CLIENT, balance=1000

```typescript
import { DataSource } from "typeorm";
import { dataSourceOptions } from "../src/data-source";
import * as bcrypt from "bcrypt";
import { User } from "../apps/auth-service/src/users/entities/user.entity";
import { UserRole, UserStatus } from "@app/shared";

async function seedTestDb() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    const userRepository = dataSource.getRepository(User);

    // Admin user
    const adminPasswordHash = await bcrypt.hash("admin12345", 10);
    const admin = userRepository.create({
      email: "admin@dreamfitness.com",
      password: adminPasswordHash,
      name: "Test Admin",
      role: UserRole.ADMIN,
      balance: 0,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(admin);

    // Regular test user with balance
    const userPasswordHash = await bcrypt.hash("test12345", 10);
    const testUser = userRepository.create({
      email: "test@example.com",
      password: userPasswordHash,
      name: "Test User",
      role: UserRole.CLIENT,
      balance: 1000,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(testUser);

    console.log("✅ Test database seeded");
  } finally {
    await dataSource.destroy();
  }
}

void seedTestDb();
```

> **Примечание:** Сид-скрипт не создаёт транзакции — они будут создаваться в самих тестах для проверки balance-операций.

---

## 3. Тестовая инфраструктура

### 3.1. Helper: Создание тестового приложения

**Файл:** `backend/apps/auth-service/test/helpers/app-test.helper.ts`

Создаёт NestJS приложение для E2E тестов с моком RabbitMQ.

```typescript
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { MockEventsModule } from "../mocks/events.module.mock";

export class AppTestHelper {
  app: INestApplication;
  dataSource: DataSource;

  async init() {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MockEventsModule.overrideFrom) // Replace EventsModule
      .useModule(MockEventsModule)
      .compile();

    this.app = moduleFixture.createNestApplication();

    // Apply same global pipes as main.ts
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await this.app.init();
    this.dataSource = this.app.get(DataSource);
  }

  async cleanup() {
    await this.app.close();
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  request(): request.SuperTest<request.Test> {
    return request(this.getHttpServer());
  }
}
```

### 3.2. Helper: Очистка БД

**Файл:** `backend/apps/auth-service/test/helpers/db.helper.ts`

```typescript
import { DataSource } from "typeorm";

export class DbHelper {
  constructor(private dataSource: DataSource) {}

  async cleanAll(): Promise<void> {
    await this.dataSource.query(
      'TRUNCATE TABLE "transactions" RESTART IDENTITY CASCADE',
    );
    await this.dataSource.query(
      'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
    );
  }
}
```

> Порядок важен: сначала `transactions` (есть FK на `users`), потом `users`. `CASCADE` гарантирует удаление зависимых записей.

### 3.3. Helper: Аутентификация в тестах

**Файл:** `backend/apps/auth-service/test/helpers/auth.helper.ts`

```typescript
import * as request from "supertest";
import { Server } from "node:http";

export class AuthHelper {
  private httpServer: Server;

  constructor(httpServer: Server) {
    this.httpServer = httpServer;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  }): Promise<request.Response> {
    return request(this.httpServer).post("/auth/register").send(userData);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(this.httpServer)
      .post("/auth/login")
      .send({ email, password });
    return response.body;
  }

  async getAuthenticatedRequest(accessToken: string) {
    return request(this.httpServer).set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  /**
   * Convenience: register + login, returns accessToken
   */
  async registerAndLogin(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
    const registerRes = await this.register(userData);
    const tokens = await this.login(userData.email, userData.password);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: registerRes.body.user?.id,
    };
  }
}
```

### 3.4. Мок EventsModule (RabbitMQ)

**Файл:** `backend/apps/auth-service/test/mocks/events.module.mock.ts`

Мокирует `EventsModule`, чтобы не подключаться к RabbitMQ во время тестов.

```typescript
import { Module } from "@nestjs/common";
import { EventsModule } from "../../src/events/events.module";
import { EventsPublisher } from "../../src/events/events.publisher";

export const mockEventsPublisher = {
  publishUserCreated: jest.fn().mockResolvedValue(undefined),
  publishBalanceChanged: jest.fn().mockResolvedValue(undefined),
};

@Module({
  providers: [
    {
      provide: EventsPublisher,
      useValue: mockEventsPublisher,
    },
  ],
  exports: [EventsPublisher],
})
export class MockEventsModule {}

/**
 * Usage with .overrideModule():
 *
 * Test.createTestingModule({ imports: [AppModule] })
 *   .overrideModule(MockEventsModule.overrideFrom)
 *   .useModule(MockEventsModule)
 */
Object.defineProperty(MockEventsModule, "overrideFrom", {
  value: EventsModule,
});
```

### 3.5. Фикстуры: Фабрики тестовых данных

**Файл:** `backend/apps/auth-service/test/fixtures/user.fixtures.ts`

```typescript
export function createRegisterDto(overrides?: Record<string, any>) {
  return {
    email: `test-${Date.now()}@example.com`,
    password: "Password123",
    name: "Test User",
    phone: null,
    birthDate: null,
    gender: null,
    ...overrides,
  };
}

export function createLoginDto(overrides?: Record<string, any>) {
  return {
    email: "test@example.com",
    password: "test12345",
    ...overrides,
  };
}

export const TEST_ADMIN = {
  email: "admin@dreamfitness.com",
  password: "admin12345",
};

export const TEST_USER = {
  email: "test@example.com",
  password: "test12345",
};

export function createDepositDto(overrides?: Record<string, any>) {
  return {
    userId: "00000000-0000-0000-0000-000000000000", // placeholder, override in test
    amount: 500,
    description: "Test deposit",
    ...overrides,
  };
}

export function createReserveDto(overrides?: Record<string, any>) {
  return {
    userId: "00000000-0000-0000-0000-000000000000",
    amount: 100,
    bookingId: "00000000-0000-0000-0000-000000000001",
    ...overrides,
  };
}

export function createReleaseDto(overrides?: Record<string, any>) {
  return {
    userId: "00000000-0000-0000-0000-000000000000",
    amount: 100,
    bookingId: "00000000-0000-0000-0000-000000000001",
    ...overrides,
  };
}

export function createRefundDto(overrides?: Record<string, any>) {
  return {
    userId: "00000000-0000-0000-0000-000000000000",
    amount: 100,
    bookingId: "00000000-0000-0000-0000-000000000001",
    ...overrides,
  };
}
```

---

## 4. E2E Тесты

### 4.1. `auth.e2e-spec.ts` — Регистрация, вход, refresh, logout

**Файл:** `backend/apps/auth-service/test/auth.e2e-spec.ts`

**Сценарии:**

#### 4.1.1. Регистрация (POST /auth/register)

| #   | Сценарий                                                            | Ожидаемый результат                                         |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Успешная регистрация с минимальными данными (email, password, name) | 201, возвращается user + tokens (accessToken, refreshToken) |
| 2   | Регистрация со всеми полями (phone, birthDate, gender)              | 201, все поля сохранены корректно                           |
| 3   | Регистрация с существующим email                                    | 400, "User with email ... already exists"                   |
| 4   | Регистрация без email                                               | 400, validation error                                       |
| 5   | Регистрация без password                                            | 400, validation error                                       |
| 6   | Регистрация с невалидным email                                      | 400, validation error                                       |
| 7   | Регистрация с паролем менее 8 символов                              | 400, validation error                                       |
| 8   | Регистрация с именем менее 2 символов                               | 400, validation error                                       |
| 9   | Регистрация с невалидным gender                                     | 400, validation error                                       |
| 10  | Регистрация с невалидным birthDate                                  | 400, validation error                                       |
| 11  | Регистрация с лишними полями (forbidNonWhitelisted)                 | 400, validation error                                       |

#### 4.1.2. Вход (POST /auth/login)

| #   | Сценарий                            | Ожидаемый результат              |
| --- | ----------------------------------- | -------------------------------- |
| 1   | Успешный вход с правильными данными | 200, accessToken + refreshToken  |
| 2   | Вход с несуществующим email         | 401, "Invalid email or password" |
| 3   | Вход с неверным паролем             | 401, "Invalid email or password" |
| 4   | Вход без email                      | 400, validation error            |
| 5   | Вход без password                   | 400, validation error            |
| 6   | Вход с невалидным email форматом    | 400, validation error            |

#### 4.1.3. Refresh Token (POST /auth/refresh)

| #   | Сценарий                                 | Ожидаемый результат                   |
| --- | ---------------------------------------- | ------------------------------------- |
| 1   | Успешный refresh с валидным refreshToken | 200, новые accessToken + refreshToken |
| 2   | Refresh с невалидным токеном             | 401, "Invalid refresh token"          |
| 3   | Refresh с истёкшим токеном               | 401, "Invalid refresh token"          |
| 4   | Refresh без тела запроса                 | 400, validation error                 |
| 5   | Refresh с пустой строкой                 | ошибка                                |

#### 4.1.4. Logout (POST /auth/logout)

| #   | Сценарий                               | Ожидаемый результат      |
| --- | -------------------------------------- | ------------------------ |
| 1   | Успешный logout с валидным accessToken | 200, "Logout successful" |
| 2   | Logout без токена                      | 401, Unauthorized        |
| 3   | Logout с невалидным токеном            | 401, Unauthorized        |

**Структура тестового файла:**

```typescript
describe("AuthController (e2e)", () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.dataSource);
    authHelper = new AuthHelper(appHelper.getHttpServer());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.cleanAll();
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    // ... test cases
  });

  describe("POST /auth/login", () => {
    // ... test cases
  });

  describe("POST /auth/refresh", () => {
    // ... test cases
  });

  describe("POST /auth/logout", () => {
    // ... test cases
  });
});
```

### 4.2. `profile.e2e-spec.ts` — Управление профилем

**Файл:** `backend/apps/auth-service/test/profile.e2e-spec.ts`

**Сценарии:**

#### 4.2.1. Получение профиля (GET /auth/me)

| #   | Сценарий                                       | Ожидаемый результат         |
| --- | ---------------------------------------------- | --------------------------- |
| 1   | Успешное получение профиля с валидным токеном  | 200, user data без password |
| 2   | Получение профиля без токена                   | 401, Unauthorized           |
| 3   | Получение профиля с истёкшим токеном           | 401, Unauthorized           |
| 4   | Получение профиля с невалидным форматом токена | 401, Unauthorized           |

#### 4.2.2. Обновление профиля (PATCH /auth/me)

| #   | Сценарий                                           | Ожидаемый результат        |
| --- | -------------------------------------------------- | -------------------------- |
| 1   | Успешное обновление имени                          | 200, обновлённый user data |
| 2   | Обновление телефона                                | 200, phone обновлён        |
| 3   | Обновление всех полей одновременно                 | 200, все поля обновлены    |
| 4   | Обновление без токена                              | 401, Unauthorized          |
| 5   | Обновление с невалидным gender                     | 400, validation error      |
| 6   | Обновление с невалидным birthDate                  | 400, validation error      |
| 7   | Обновление с лишними полями (forbidNonWhitelisted) | 400, validation error      |
| 8   | Обновление с пустым body                           | 200, данные не изменились  |

#### 4.2.3. Получение баланса (GET /auth/balance)

| #   | Сценарий                       | Ожидаемый результат                      |
| --- | ------------------------------ | ---------------------------------------- |
| 1   | Успешное получение баланса     | 200, { balance: number, userId: string } |
| 2   | Получение баланса без токена   | 401, Unauthorized                        |
| 3   | Баланс нового пользователя = 0 | 200, { balance: 0 }                      |

### 4.3. `balance.e2e-spec.ts` — Операции с балансом и транзакции

**Файл:** `backend/apps/auth-service/test/balance.e2e-spec.ts`

**Предусловие:** Для каждого теста создаётся пользователь с известным балансом.

**Сценарии:**

#### 4.3.1. Пополнение баланса (POST /auth/balance/deposit)

| #   | Сценарий                                        | Ожидаемый результат                        |
| --- | ----------------------------------------------- | ------------------------------------------ |
| 1   | Успешное пополнение на 500                      | 200, транзакция type=deposit, amount=500   |
| 2   | Проверка что баланс увеличился после пополнения | GET /auth/balance возвращает balance + 500 |
| 3   | Пополнение с amount = 1 (минимальное)           | 200                                        |
| 4   | Пополнение с amount = 10000 (максимальное)      | 200                                        |
| 5   | Пополнение с amount = 0                         | 400, validation error                      |
| 6   | Пополнение с amount > 10000                     | 400, validation error                      |
| 7   | Пополнение с отрицательным amount               | 400, validation error                      |
| 8   | Пополнение с не-UUID userId                     | 400, validation error                      |
| 9   | Пополнение без body                             | 400, validation error                      |
| 10  | Пополнение без токена                           | 401, Unauthorized                          |

#### 4.3.2. Резервирование баланса (POST /auth/balance/reserve)

| #   | Сценарий                                        | Ожидаемый результат                           |
| --- | ----------------------------------------------- | --------------------------------------------- |
| 1   | Успешное резервирование при достаточном балансе | 200, транзакция type=reserve                  |
| 2   | Баланс уменьшился после резервирования          | GET /auth/balance возвращает balance - amount |
| 3   | Резервирование при нулевом балансе              | 400, "Insufficient balance"                   |
| 4   | Резервирование суммы больше баланса             | 400, "Insufficient balance"                   |
| 5   | Резервирование с amount = 0                     | 400, validation error                         |
| 6   | Резервирование без bookingId                    | 400, validation error                         |
| 7   | Резервирование с не-UUID bookingId              | 400, validation error                         |
| 8   | Резервирование без токена                       | 401, Unauthorized                             |

#### 4.3.3. Освобождение резерва (POST /auth/balance/release)

| #   | Сценарий                                   | Ожидаемый результат                  |
| --- | ------------------------------------------ | ------------------------------------ |
| 1   | Успешное освобождение после резервирования | 200, транзакция type=release         |
| 2   | Баланс увеличился после освобождения       | GET /auth/balance отражает возврат   |
| 3   | Освобождение без существующего резерва     | 404, "Reserve transaction not found" |
| 4   | Освобождение с не-UUID bookingId           | 400, validation error                |
| 5   | Освобождение без токена                    | 401, Unauthorized                    |

#### 4.3.4. Возврат средств (POST /auth/balance/refund)

| #   | Сценарий                         | Ожидаемый результат                |
| --- | -------------------------------- | ---------------------------------- |
| 1   | Успешный возврат                 | 200, транзакция type=refund        |
| 2   | Баланс увеличился после возврата | GET /auth/balance отражает возврат |
| 3   | Возврат с amount = 0             | 400, validation error              |
| 4   | Возврат без bookingId            | 400, validation error              |
| 5   | Возврат без токена               | 401, Unauthorized                  |

#### 4.3.5. История транзакций (GET /auth/transactions)

| #   | Сценарий                                  | Ожидаемый результат                              |
| --- | ----------------------------------------- | ------------------------------------------------ |
| 1   | Пустая история у нового пользователя      | 200, { items: [], total: 0, page: 1, limit: 10 } |
| 2   | История содержит транзакции после deposit | 200, items содержат deposit-транзакцию           |
| 3   | История содержит несколько транзакций     | 200, total = кол-ву транзакций                   |
| 4   | Пагинация: page=1, limit=1                | 200, items.length = 1, total = общее кол-во      |
| 5   | Транзакции без токена                     | 401, Unauthorized                                |

**Полный flow тест для баланса:**

```
1. Создать пользователя (balance = 0)
2. POST /auth/balance/deposit → balance = 1000
3. GET /auth/balance → verify balance = 1000
4. POST /auth/balance/reserve → balance = 900 (reserve 100)
5. GET /auth/balance → verify balance = 900
6. POST /auth/balance/release → balance = 1000 (release 100)
7. GET /auth/transactions → verify total >= 3
```

---

## 5. Unit Тесты

### 5.1. AuthService Unit Tests

**Файл:** `backend/apps/auth-service/src/auth/auth.service.spec.ts`

**Мокируемые зависимости:**

- `UserRepository` — мок через `getRepositoryToken(User)` или кастомный токен
- `JwtService` — мок `sign()`, `verifyAsync()`
- `ConfigService` — мок `get()`
- `EventsPublisher` — мок `publishUserCreated()`

**Сценарии:**

| #   | Метод            | Сценарий                    | Ожидаемый результат                                                     |
| --- | ---------------- | --------------------------- | ----------------------------------------------------------------------- |
| 1   | register         | Успешная регистрация        | Создан пользователь, возвращён user + tokens, вызван publishUserCreated |
| 2   | register         | Пользователь уже существует | UserAlreadyExistsException                                              |
| 3   | login            | Успешный вход               | Возвращены accessToken + refreshToken                                   |
| 4   | login            | Пользователь не найден      | InvalidCredentialsException                                             |
| 5   | login            | Неверный пароль             | InvalidCredentialsException                                             |
| 6   | refresh          | Успешный refresh            | Возвращены новые tokens                                                 |
| 7   | refresh          | Невалидный токен            | Error: "Invalid refresh token"                                          |
| 8   | refresh          | Пользователь не найден      | Error: "Invalid refresh token"                                          |
| 9   | logout           | Вызов logout                | Выполняется без ошибок                                                  |
| 10  | generateTokens   | Генерация tokens            | JwtService.sign вызван дважды                                           |
| 11  | hashPassword     | Хэширование                 | Возвращен bcrypt hash                                                   |
| 12  | validatePassword | Правильный пароль           | true                                                                    |
| 13  | validatePassword | Неверный пароль             | false                                                                   |

### 5.2. AuthController Unit Tests

**Файл:** `backend/apps/auth-service/src/auth/auth.controller.spec.ts`

**Мокируемая зависимость:** `AuthService`

**Сценарии:**

| #   | Метод    | Сценарий             | Ожидаемый результат                                     |
| --- | -------- | -------------------- | ------------------------------------------------------- |
| 1   | register | Вызов с валидным DTO | Вызывает authService.register с правильными аргументами |
| 2   | login    | Вызов с валидным DTO | Возвращает { accessToken, refreshToken }                |
| 3   | refresh  | Вызов с refreshToken | Возвращает новые tokens                                 |
| 4   | logout   | Вызов                | Возвращает { message: "Logout successful" }             |

### 5.3. UsersService Unit Tests

**Файл:** `backend/apps/auth-service/src/users/users.service.spec.ts`

**Мокируемая зависимость:** `UserRepository`

**Сценарии:**

| #   | Метод             | Сценарий                    | Ожидаемый результат                    |
| --- | ----------------- | --------------------------- | -------------------------------------- |
| 1   | getUserById       | Существующий ID             | Возвращает UserResponseDto             |
| 2   | getUserById       | Несуществующий ID           | Возвращает undefined                   |
| 3   | updateUserProfile | Обновление имени            | Возвращает обновлённый UserResponseDto |
| 4   | updateUserProfile | Несуществующий ID           | Возвращает undefined                   |
| 5   | getUserBalance    | Существующий пользователь   | Возвращает { balance: number }         |
| 6   | getUserBalance    | Несуществующий пользователь | Возвращает { balance: 0 }              |

### 5.4. UsersController Unit Tests

**Файл:** `backend/apps/auth-service/src/users/users.controller.spec.ts`

**Мокируемая зависимость:** `UsersService`

**Сценарии:**

| #   | Метод         | Сценарий        | Ожидаемый результат                    |
| --- | ------------- | --------------- | -------------------------------------- |
| 1   | getProfile    | С валидным user | Возвращает UserResponseDto             |
| 2   | updateProfile | С валидным DTO  | Возвращает обновлённый UserResponseDto |
| 3   | getBalance    | С валидным user | Возвращает { balance, userId }         |

### 5.5. BalanceService Unit Tests

**Файл:** `backend/apps/auth-service/src/balance/balance.service.spec.ts`

**Мокируемые зависимости:**

- `TransactionRepository`
- `UserRepository`
- `DataSource` — мок для `dataSource.transaction()`
- `EventsPublisher`

**Сценарии:**

| #   | Метод              | Сценарий                | Ожидаемый результат                                             |
| --- | ------------------ | ----------------------- | --------------------------------------------------------------- |
| 1   | deposit            | Успешное пополнение     | Возвращена TransactionResponseDto, вызван publishBalanceChanged |
| 2   | deposit            | Пользователь не найден  | NotFoundException                                               |
| 3   | reserve            | Успешное резервирование | Возвращена транзакция type=reserve                              |
| 4   | reserve            | Недостаточный баланс    | InsufficientBalanceException                                    |
| 5   | reserve            | Пользователь не найден  | NotFoundException                                               |
| 6   | release            | Успешное освобождение   | Возвращена транзакция type=release                              |
| 7   | release            | Резерв не найден        | NotFoundException                                               |
| 8   | refund             | Успешный возврат        | Возвращена транзакция type=refund                               |
| 9   | getTransactions    | Существующие транзакции | Возвращён TransactionListResponseDto                            |
| 10  | checkEnoughBalance | Достаточный баланс      | true                                                            |
| 11  | checkEnoughBalance | Недостаточный баланс    | false                                                           |

### 5.6. BalanceController Unit Tests

**Файл:** `backend/apps/auth-service/src/balance/balance.controller.spec.ts`

**Мокируемая зависимость:** `BalanceService`

**Сценарии:**

| #   | Метод           | Сценарий            | Ожидаемый результат                               |
| --- | --------------- | ------------------- | ------------------------------------------------- |
| 1   | deposit         | Валидный DepositDto | Вызывает balanceService.deposit                   |
| 2   | reserve         | Валидный ReserveDto | Вызывает balanceService.reserve                   |
| 3   | release         | Валидный ReleaseDto | Вызывает balanceService.release                   |
| 4   | refund          | Валидный RefundDto  | Вызывает balanceService.refund                    |
| 5   | getTransactions | С user в запросе    | Вызывает balanceService.getTransactions с user.id |

---

## 6. Стратегия продакшн-тестирования

### 6.1. Smoke Tests после деплоя

После деплоя на VPS выполнить базовую проверку работоспособности:

**Ручные smoke-тесты:**

```bash
# 1. Проверить что сервис запущен и отвечает
http GET http://localhost:3001/docs

# 2. Зарегистрировать тестового пользователя
http POST http://localhost:3001/auth/register \
  email="smoketest@dreamfitness.com" \
  password="SmokeTest123" \
  name="Smoke Test"

# 3. Войти и получить токен
http POST http://localhost:3001/auth/login \
  email="smoketest@dreamfitness.com" \
  password="SmokeTest123"
# Скопировать accessToken из ответа

# 4. Получить профиль
http GET http://localhost:3001/auth/me \
  Authorization:"Bearer <accessToken>"

# 5. Пополнить баланс (как admin)
http POST http://localhost:3001/auth/balance/deposit \
  userId="<userId>" \
  amount=100 \
  description="Smoke test deposit" \
  Authorization:"Bearer <adminToken>"

# 6. Проверить баланс
http GET http://localhost:3001/auth/balance \
  Authorization:"Bearer <accessToken>"

# 7. Проверить историю транзакций
http GET http://localhost:3001/auth/transactions \
  Authorization:"Bearer <accessToken>"
```

### 6.2. Автоматизированные smoke-тесты

**Файл:** `backend/scripts/smoke-test.sh` (опционально)

```bash
#!/bin/bash
BASE_URL="${1:-http://localhost:3001}"
FAILED=0

echo "🔍 Running smoke tests against $BASE_URL..."

# Test 1: Swagger docs available
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs")
if [ "$STATUS" = "200" ]; then
  echo "✅ Swagger docs accessible"
else
  echo "❌ Swagger docs not accessible (status: $STATUS)"
  FAILED=1
fi

# Test 2: Register endpoint responds
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","password":"Test12345","name":"Smoke"}')
if [ "$STATUS" = "201" ] || [ "$STATUS" = "400" ]; then
  echo "✅ Register endpoint responding"
else
  echo "❌ Register endpoint not responding (status: $STATUS)"
  FAILED=1
fi

# Test 3: Login endpoint responds
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"wrong"}')
if [ "$STATUS" = "401" ]; then
  echo "✅ Login endpoint responding (correctly rejects invalid creds)"
else
  echo "❌ Login endpoint unexpected status: $STATUS"
  FAILED=1
fi

if [ $FAILED -eq 0 ]; then
  echo "🎉 All smoke tests passed!"
else
  echo "💥 Some smoke tests failed!"
  exit 1
fi
```

### 6.3. Что можно и чего нельзя тестировать в продакшне

**Можно тестировать:**

- Доступность Swagger UI (`/docs`)
- Ответы API на базовые запросы
- Валидацию DTO (отправить невалидные данные → получить 400)
- Регистрацию нового пользователя (с уникальным email)
- Вход с правильными/неправильными данными
- Получение профиля с валидным токеном

**Нельзя тестировать в продакшне:**

- Пополнение баланса реальных пользователей
- Резервирование/освобождение средств реальных бронирований
- Массовую регистрацию пользователей
- Удаление или модификацию данных реальных пользователей
- Нагрузочное тестирование (можть повлиять на производительность)

### 6.4. Вопросы безопасности

- Smoke-тесты в продакшне должны использовать выделенный тестовый аккаунт
- После smoke-тестов удалить тестовые данные (или оставить для аудита)
- Никогда не использовать реальные пароли пользователей в тестах
- Не выводить JWT-токены в логи

---

## 7. Порядок реализации

```mermaid
graph TD
    T1[1. Установить dotenv-cli] --> T2[2. Создать .env.test]
    T2 --> T3[3. Создать jest-e2e.json для auth-service]
    T3 --> T4[4. Создать скрипт create-test-db.ts]
    T4 --> T5[5. Добавить NPM скрипты в package.json]
    T5 --> T6[6. Запустить test:setup и проверить что тестовая БД создана]
    T6 --> T7[7. Создать мок EventsModule]
    T7 --> T8[8. Создать helpers: app-test, db, auth]
    T8 --> T9[9. Создать fixtures]
    T9 --> T10[10. Написать seed-test-db.ts]
    T10 --> T11[11. Написать auth.e2e-spec.ts]
    T11 --> T12[12. Запустить auth E2E тесты и исправить ошибки]
    T12 --> T13[13. Написать profile.e2e-spec.ts]
    T13 --> T14[14. Запустить profile E2E тесты]
    T14 --> T15[15. Написать balance.e2e-spec.ts]
    T15 --> T16[16. Запустить balance E2E тесты]
    T16 --> T17[17. Написать unit тесты для сервисов]
    T17 --> T18[18. Запустить все тесты и убедиться в зеленом статусе]
```

### Пошаговый план:

1. **Установить `dotenv-cli`** — `npm i -D -E dotenv-cli`
2. **Создать `.env.test`** — файл с переменными для тестовой среды
3. **Создать `jest-e2e.json`** — конфиг E2E тестов auth-service с правильными path aliases
4. **Создать `scripts/create-test-db.ts`** — скрипт создания тестовой БД
5. **Добавить NPM скрипты** — в `package.json`: `test:db:create`, `test:db:migrate`, `test:setup`, `test:e2e:auth`
6. **Запустить `npm run test:setup`** — проверить что тестовая БД создаётся и миграции проходят
7. **Создать `mocks/events.module.mock.ts`** — мок EventsModule для подмены RabbitMQ
8. **Создать helpers** — `app-test.helper.ts`, `db.helper.ts`, `auth.helper.ts`
9. **Создать fixtures** — `user.fixtures.ts` с фабриками тестовых данных
10. **Создать `scripts/seed-test-db.ts`** — скрипт сидирования тестовой БД
11. **Написать `auth.e2e-spec.ts`** — E2E тесты для регистрации, входа, refresh, logout
12. **Запустить auth E2E тесты** — исправить ошибки, убедиться что все проходят
13. **Написать `profile.e2e-spec.ts`** — E2E тесты для профиля и баланса
14. **Запустить profile E2E тесты** — убедиться что все проходят
15. **Написать `balance.e2e-spec.ts`** — E2E тесты для баланса и транзакций
16. **Запустить balance E2E тесты** — убедиться что все проходят
17. **Написать unit тесты** — `auth.service.spec.ts`, `users.service.spec.ts`, `balance.service.spec.ts`, контроллеры
18. **Запустить все тесты** — `npm run test` и `npm run test:e2e:auth` — все должны быть зелёными

---

## 8. Ключевые технические решения

### 8.1. Как мокируется RabbitMQ

`EventsModule` импортирует `RabbitMQModule.forRoot()` из `@app/shared/rabbitmq`, который пытается подключиться к RabbitMQ при инициализации. В тестах это вызывает ошибки подключения.

**Решение:** Использовать `Test.createTestingModule().overrideModule()` для замены `EventsModule` на `MockEventsModule`, который предоставляет мок `EventsPublisher` с `jest.fn()`.

```typescript
const moduleFixture = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(EventsModule)
  .useModule(MockEventsModule)
  .compile();
```

### 8.2. Как работает ConfigModule в тестах

`ConfigModule` читает `process.env` напрямую при загрузке модуля. `dotenv-cli` загружает `.env.test` переменные **до** запуска Jest, поэтому `process.env` уже содержит правильные тестовые значения когда NestJS инициализирует модули.

### 8.3. Очистка БД между тестами

Используется `TRUNCATE ... RESTART IDENTITY CASCADE` для полной очистки таблиц между тестами. Порядок: `transactions` (зависимая) → `users` (главная).

### 8.4. Получение аутентифицированных запросов

`AuthHelper.registerAndLogin()` — утилита которая регистрирует пользователя и возвращает `accessToken`. Для protected endpoints используется:

```typescript
request(httpServer)
  .get("/auth/me")
  .set("Authorization", `Bearer ${accessToken}`);
```

---

## 9. DoD (Definition of Done)

### Инфраструктура

- [ ] `.env.test` создан с тестовыми переменными
- [ ] `dotenv-cli` установлен
- [ ] `jest-e2e.json` для auth-service создан с правильными path aliases
- [ ] `create-test-db.ts` скрипт создаёт тестовую БД
- [ ] NPM скрипты добавлены в `package.json`
- [ ] `npm run test:setup` выполняется без ошибок

### E2E Тесты

- [ ] `auth.e2e-spec.ts` покрывает: регистрацию, вход, refresh, logout (11+ тестов)
- [ ] `profile.e2e-spec.ts` покрывает: GET/PATCH /auth/me, GET /auth/balance (11+ тестов)
- [ ] `balance.e2e-spec.ts` покрывает: deposit, reserve, release, refund, transactions (25+ тестов)
- [ ] Все E2E тесты проходят: `npm run test:e2e:auth`

### Unit Тесты

- [ ] `auth.service.spec.ts` — 13 тестов
- [ ] `auth.controller.spec.ts` — 4 теста
- [ ] `users.service.spec.ts` — 6 тестов
- [ ] `users.controller.spec.ts` — 3 теста
- [ ] `balance.service.spec.ts` — 11 тестов
- [ ] `balance.controller.spec.ts` — 5 тестов
- [ ] Все unit тесты проходят: `npm run test`

### Качество

- [ ] Мок `EventsModule` корректно подменяет RabbitMQ
- [ ] Каждый тест независим (beforeEach очищает БД)
- [ ] Нет хардкоженных данных — используются фабрики
- [ ] Тесты не зависят от порядка выполнения
- [ ] `npm run ts` — без ошибок
- [ ] `npm run lint` — без ошибок
