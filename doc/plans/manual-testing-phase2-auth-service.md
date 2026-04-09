# План ручного тестирования Auth Service (Фаза 2)

## Предварительные шаги

### 1. Исправить код (критические проблемы)

- [ ] Исправить column names в User Entity (добавить явные name параметры)
- [ ] Исправить AuthModule — добавить UsersModule в imports
- [ ] Исправить transactions таблицу в InitialSchema миграции
- [ ] Реализовать run-seed.ts скрипт

### 2. Запустить миграции

```powershell
cd backend
npm run db:migrate
```

### 3. Запустить seed

```powershell
cd backend
npm run db:seed
```

### 4. Запустить auth-service

```powershell
cd backend
npm run start:dev:auth-service
```

---

## Тестирование API

### 5. Регистрация нового пользователя

```powershell
http POST http://localhost:3001/auth/register email="newuser@example.com" password="password123" name="New User"
```

**Ожидаемый результат:** 201 Created, в ответе user и tokens.

### 6. Вход admin (получение tokens)

```powershell
http POST http://localhost:3001/auth/login email="admin@dreamfitness.com" password="admin123"
```

**Ожидаемый результат:** 200 OK, accessToken и refreshToken.

### 7. Вход test пользователя

```powershell
http POST http://localhost:3001/auth/login email="test@example.com" password="test12345"
```

**Ожидаемый результат:** 200 OK, accessToken и refreshToken.

### 8. Получение профиля

```powershell
http GET http://localhost:3001/auth/me "Authorization:Bearer <ACCESS_TOKEN>"
```

**Ожидаемый результат:** 200 OK, данные пользователя.

### 9. Обновление профиля

```powershell
http PATCH http://localhost:3001/auth/me "Authorization:Bearer <ACCESS_TOKEN>" phone="+79991234567"
```

**Ожидаемый результат:** 200 OK, обновлённые данные.

### 10. Получение баланса

```powershell
http GET http://localhost:3001/auth/balance "Authorization:Bearer <ACCESS_TOKEN>"
```

**Ожидаемый результат:** 200 OK, `{ balance: 0, userId: "..." }`.

### 11. Пополнение баланса (admin)

```powershell
http POST http://localhost:3001/auth/balance/deposit "Authorization:Bearer <ADMIN_TOKEN>" userId="<USER_ID>" amount:=1000 description="Initial deposit"
```

**Ожидаемый результат:** 200 OK, данные транзакции.

### 12. Резервирование средств

```powershell
http POST http://localhost:3001/auth/balance/reserve "Authorization:Bearer <ADMIN_TOKEN>" userId="<USER_ID>" amount:=500 bookingId="<ANY_UUID>"
```

**Ожидаемый результат:** 200 OK, баланс уменьшен.

### 13. Возврат зарезервированных средств

```powershell
http POST http://localhost:3001/auth/balance/release "Authorization:Bearer <ADMIN_TOKEN>" userId="<USER_ID>" amount:=500 bookingId="<SAME_UUID>"
```

### 14. История транзакций

```powershell
http GET http://localhost:3001/auth/transactions "Authorization:Bearer <ACCESS_TOKEN>"
```

**Ожидаемый результат:** 200 OK, список транзакций с пагинацией.

### 15. Refresh token

```powershell
http POST http://localhost:3001/auth/refresh refreshToken="<REFRESH_TOKEN>"
```

**Ожидаемый результат:** 200 OK, новые accessToken и refreshToken.

### 16. Logout

```powershell
http POST http://localhost:3001/auth/logout "Authorization:Bearer <ACCESS_TOKEN>"
```

**Ожидаемый результат:** 200 OK.

### 17. Доступ без токена (negative test)

```powershell
http GET http://localhost:3001/auth/me
```

**Ожидаемый результат:** 401 Unauthorized.

### 18. Регистрация с существующим email (negative test)

```powershell
http POST http://localhost:3001/auth/register email="admin@dreamfitness.com" password="password123" name="Duplicate"
```

**Ожидаемый результат:** 400 Bad Request.

---

## Swagger документация

### 19. Проверка Swagger UI

Открыть в браузере: http://localhost:3001/docs

- [ ] Документация загружается
- [ ] Все endpoints отображаются
- [ ] Схемы DTO корректны
- [ ] "Authorize" кнопка работает (ввести Bearer token)

---

## RabbitMQ

### 20. Проверка RabbitMQ Management UI

Открыть: http://localhost:15672 (dreamfitness / dreamfitness123)

- [ ] Exchange `dreamfitness.exchange` создан
- [ ] После регистрации видны `user.created` события
- [ ] После deposit видны `balance.changed` события
