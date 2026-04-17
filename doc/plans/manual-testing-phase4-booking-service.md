# План ручного тестирования Booking Service (Фаза 4)

## Предварительные шаги

### 1. Запустить инфраструктуру (PostgreSQL + RabbitMQ)

```powershell
cd backend
docker compose up -d
```

**Проверка:** контейнеры `dreamfitness-postgres` и `dreamfitness-rabbitmq` запущены.

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

**Ожидаемый результат:** созданы admin и test пользователи.

### 4. Запустить auth-service

```powershell
cd backend
npm run start:dev:auth-service
```

**Ожидаемый результат:** `Auth Service is running on port 3001`.

### 5. Запустить training-service

В отдельном терминале:

```powershell
cd backend
npm run start:dev:training-service
```

**Ожидаемый результат:** `Training Service is running on port 3002`.

### 6. Запустить booking-service

В отдельном терминале:

```powershell
cd backend
npm run start:dev:booking-service
```

**Ожидаемый результат:** `Booking Service is running on port 3003`.

### 7. Получить JWT токен администратора

```powershell
http POST http://localhost:3001/auth/login email="admin@dreamfitness.com" password="admin123"
```

**Ожидаемый результат:** 200 OK.

Сохранить `accessToken` в сессии `admin`.

```powershell
http --session=admin -A bearer -a <token> http://localhost:3001/auth/balance
http --session=admin -A bearer -a <token> http://localhost:3002/trainers
http --session=admin -A bearer -a <token> http://localhost:3003/bookings
```

### 8. Получить JWT токен тестового пользователя

```powershell
http POST http://localhost:3001/auth/login email="test@example.com" password="test12345"
```

**Ожидаемый результат:** 200 OK.

Сохранить `accessToken` в сессии `user`.

### 9. Получить ID тестового пользователя

```powershell
http GET http://localhost:3001/auth/me --session=user
```

Сохранить `id` как `<USER_ID>`.

### 10. Пополнить баланс тестового пользователя

Seed создаёт пользователей с `balance: 0`. Для бронирования нужны баллы.

```powershell
http POST http://localhost:3001/auth/balance/deposit --session=admin userId="<USER_ID>" amount:=5000
```

**Ожидаемый результат:** 200 OK, баланс пользователя пополнен.

### 11. Создать тренера (для тренировок)

```powershell
http POST http://localhost:3002/trainers --session=admin name="Тренер Тест" bio="Для тестирования бронирования"
```

Сохранить `id` как `<TRAINER_ID>`.

### 12. Создать тренировку с capacity=1 (для тестирования waitlist)

Тренировка с 1 местом позволяет быстро заполнить её и проверить waitlist.

```powershell
http POST http://localhost:3002/trainings --session=admin title="Тестовая тренировка 1 место" type="yoga" trainerId="<TRAINER_ID>" scheduledAt="2026-06-20T10:00:00Z" durationMinutes:=60 capacity:=1 price:=500
```

Сохранить `id` как `<TRAINING_ID_1>`.

### 13. Создать вторую тренировку с capacity=10 (для обычного бронирования)

```powershell
http POST http://localhost:3002/trainings --session=admin title="Тестовая тренировка 10 мест" type="crossfit" trainerId="<TRAINER_ID>" scheduledAt="2026-06-21T10:00:00Z" durationMinutes:=60 capacity:=10 price:=300
```

Сохранить `id` как `<TRAINING_ID_2>`.

> **Далее во всех командах заменяй `<TOKEN>` на токен пользователя (если не указано иное).**

---

## Сценарий 1: Booking Workflow

### 14. Успешное бронирование тренировки (happy path)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_ID_2>" userId="<USER_ID>"
```

**Ожидаемый результат:** 201 Created.

```json
{
  "id": "<BOOKING_ID>",
  "userId": "<USER_ID>",
  "trainingId": "<TRAINING_ID_2>",
  "status": "confirmed",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Сохранить `id` как `<BOOKING_ID>`.

**Проверки:**

- Баланс пользователя уменьшился на 300 (стоимость тренировки)

```powershell
http GET http://localhost:3001/auth/profile --session=user
```

Убедиться, что `balance` = 5000 - 300 = 4700.

### 15. Получение списка бронирований пользователя

```powershell
http GET http://localhost:3003/bookings --session=user
```

**Ожидаемый результат:** 200 OK.

```json
{
  "items": [
    {
      "id": "<BOOKING_ID>",
      "userId": "<USER_ID>",
      "trainingId": "<TRAINING_ID_2>",
      "status": "confirmed",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 16. Получение бронирования по ID

```powershell
http GET http://localhost:3003/bookings/<BOOKING_ID> --session=user
```

**Ожидаемый результат:** 200 OK, данные бронирования.

### 17. Повторное бронирование той же тренировки (negative — Duplicate)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_ID_2>" userId="<USER_ID>"
```

**Ожидаемый результат:** 409 Conflict — `DuplicateBookingException`.

### 18. Бронирование несуществующей тренировки (negative)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="00000000-0000-0000-0000-000000000000" userId="<USER_ID>"
```

**Ожидаемый результат:** 404 Not Found или 503 Service Unavailable (зависит от обработки ошибки в training-client).

### 19. Доступ без токена (negative)

```powershell
http POST http://localhost:3003/bookings trainingId="<TRAINING_ID_2>" userId="<USER_ID>"
```

**Ожидаемый результат:** 401 Unauthorized.

---

## Сценарий 2: Training Cancellation

### 20. Создать вторую тренировку с capacity=10, забронировать, затем отменить

Бронирование уже создано на шаге 14. Теперь отменяем:

```powershell
http POST http://localhost:3003/bookings/<BOOKING_ID>/cancel --session=user reason="Не смогу прийти"
```

**Ожидаемый результат:** 200 OK.

```json
{
  "id": "<BOOKING_ID>",
  "userId": "<USER_ID>",
  "trainingId": "<TRAINING_ID_2>",
  "status": "cancelled",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Проверки:**

- Баланс пользователя вернулся к исходному значению (4700 + 300 = 5000):

```powershell
http GET http://localhost:3001/auth/profile --session=user
```

### 21. Повторная отмена того же бронирования (negative)

```powershell
http POST http://localhost:3003/bookings/<BOOKING_ID>/cancel --session=user
```

**Ожидаемый результат:** 409 Conflict — `BookingAlreadyCancelledException`.

### 22. Отмена несуществующего бронирования (negative)

```powershell
http POST http://localhost:3003/bookings/00000000-0000-0000-0000-000000000000/cancel --session=user
```

**Ожидаемый результат:** 404 Not Found — `BookingNotFoundException`.

---

## Сценарий 3: Waitlist Promotion

Этот сценарий проверяет полный цикл: заполнение тренировки → добавление в waitlist → отмена → автоматическое продвижение из очереди.

### 23. Забронировать тренировку с capacity=1 (заполнить все места)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_ID_1>" userId="<USER_ID>"
```

**Ожидаемый результат:** 201 Created. Сохранить `id` как `<BOOKING_ID_WL>`.

### 24. Попытка забронировать заполненную тренировку (negative — No Available Slots)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_ID_1>" userId="<USER_ID>"
```

**Ожидаемый результат:** 409 Conflict — `NoAvailableSlotsException` или `DuplicateBookingException` (если не прошёл шаг 17 с тем же user).

> Если получили `DuplicateBookingException` — это потому что у пользователя уже есть бронь. Нужен второй пользователь.

### 24а. Создать второго тестового пользователя (если нужно)

```powershell
http POST http://localhost:3001/auth/register email="test2@example.com" password="test12345" name="Test User 2" role="client"
```

Получить токен:

```powershell
http POST http://localhost:3001/auth/login email="test2@example.com" password="test12345"
```

Сохранить `accessToken` как `<USER2_TOKEN>` и `id` как `<USER2_ID>`.

Пополнить баланс второго пользователя:

```powershell
http POST http://localhost:3001/auth/balance/deposit --session=admin userId="<USER2_ID>" amount:=5000
```

Теперь попытаться забронировать заполненную тренировку от второго пользователя:

```powershell
http POST http://localhost:3003/bookings "Authorization:Bearer <USER2_TOKEN>" trainingId="<TRAINING_ID_1>" userId="<USER2_ID>"
```

**Ожидаемый результат:** 409 Conflict — `NoAvailableSlotsException`.

### 25. Встать в waitlist на заполненную тренировку

```powershell
http POST http://localhost:3003/waitlist "Authorization:Bearer <USER2_TOKEN>" trainingId="<TRAINING_ID_1>" userId="<USER2_ID>"
```

**Ожидаемый результат:** 201 Created.

```json
{
  "id": "<WAITLIST_ID>",
  "userId": "<USER2_ID>",
  "trainingId": "<TRAINING_ID_1>",
  "position": 1,
  "joinedAt": "..."
}
```

### 26. Проверить позицию в waitlist

```powershell
http GET http://localhost:3003/waitlist/position?trainingId="<TRAINING_ID_1>" "Authorization:Bearer <USER2_TOKEN>"
```

**Ожидаемый результат:** 200 OK.

```json
{
  "position": 1,
  "totalInQueue": 1,
  "waitlistId": "<WAITLIST_ID>"
}
```

### 27. Отменить бронирование первого пользователя (триггер waitlist promotion)

```powershell
http POST http://localhost:3003/bookings/<BOOKING_ID_WL>/cancel --session=user reason="Освобождаю место"
```

**Ожидаемый результат:** 200 OK, бронирование отменено.

**Проверка waitlist promotion:**

- Второй пользователь автоматически получил бронирование
- Баланс второго пользователя уменьшился на стоимость тренировки (500)

Проверить баланс второго пользователя:

```powershell
http GET http://localhost:3001/auth/profile "Authorization:Bearer <USER2_TOKEN>"
```

Убедиться, что `balance` = 5000 - 500 = 4500.

Проверить бронирования второго пользователя:

```powershell
http GET http://localhost:3003/bookings "Authorization:Bearer <USER2_TOKEN>"
```

Должно быть бронирование со `status: "confirmed"` на `<TRAINING_ID_1>`.

Проверить, что waitlist пуст:

```powershell
http GET http://localhost:3003/waitlist/position?trainingId="<TRAINING_ID_1>" "Authorization:Bearer <USER2_TOKEN>"
```

**Ожидаемый результат:** 404 Not Found — `NotOnWaitlistException` (пользователь больше не в очереди).

---

## Swagger документация

### 28. Проверка Swagger UI

Открыть в браузере: http://localhost:3003/docs

- [ ] Документация загружается
- [ ] Отображаются группы: **Bookings**, **Waitlist**
- [ ] Все endpoints отображаются корректно
- [ ] Кнопка **Authorize** работает — ввести `Bearer <TOKEN>` и авторизоваться
- [ ] Можно выполнить запрос прямо из Swagger UI

---

## RabbitMQ

### 29. Проверка RabbitMQ Management UI

Открыть: http://localhost:15672 (dreamfitness / dreamfitness123)

- [ ] Exchange `dreamfitness.exchange` существует
- [ ] После шага 14 видно `booking.created` событие
- [ ] После шага 20 видно `booking.cancelled` событие
- [ ] После шага 25 видно `waitlist.joined` событие
- [ ] После шага 27 видно `booking.created` (продвижение из waitlist) и `waitlist.promoted` события

> Для перехвата событий: создать временную очередь, привязанную к `dreamfitness.exchange` с routing key `booking.created` и т.д.

---

## Чек-лист результатов

### Booking Workflow

| #   | Тест                                 | Статус |
| --- | ------------------------------------ | ------ |
| 14  | Успешное бронирование                | [ ]    |
| 15  | Список бронирований                  | [ ]    |
| 16  | Получение бронирования по ID         | [ ]    |
| 17  | Повторное бронирование (negative)    | [ ]    |
| 18  | Несуществующая тренировка (negative) | [ ]    |
| 19  | Доступ без токена (negative)         | [ ]    |

### Training Cancellation

| #   | Тест                                   | Статус |
| --- | -------------------------------------- | ------ |
| 20  | Отмена бронирования                    | [ ]    |
| 21  | Повторная отмена (negative)            | [ ]    |
| 22  | Несуществующее бронирование (negative) | [ ]    |

### Waitlist Promotion

| #   | Тест                          | Статус |
| --- | ----------------------------- | ------ |
| 23  | Заполнение тренировки         | [ ]    |
| 24  | Нет свободных мест (negative) | [ ]    |
| 25  | Встать в waitlist             | [ ]    |
| 26  | Проверка позиции в waitlist   | [ ]    |
| 27  | Waitlist promotion при отмене | [ ]    |

### Infrastructure

| #   | Тест                   | Статус |
| --- | ---------------------- | ------ |
| 28  | Swagger UI             | [ ]    |
| 29  | RabbitMQ Management UI | [ ]    |
