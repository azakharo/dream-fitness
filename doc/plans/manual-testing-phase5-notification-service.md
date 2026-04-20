# План ручного тестирования Notification Service (Фаза 5)

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

### 7. Запустить notification-service

В отдельном терминале:

```powershell
cd backend
npm run start:dev:notification-service
```

**Ожидаемый результат:** `Notification Service is running on port 3004`.

### 8. Получить JWT токены и подготовить данные

Получить токен администратора:

```powershell
http POST http://localhost:3001/auth/login email="admin@dreamfitness.com" password="admin123"
```

Сохранить `accessToken` в сессию `admin`:

```powershell
http --session=admin -A bearer -a <ADMIN_TOKEN> http://localhost:3001/auth/balance
```

Получить токен тестового пользователя:

```powershell
http POST http://localhost:3001/auth/login email="test@example.com" password="test12345"
```

Сохранить `accessToken` в сессию `user`. Получить ID пользователя:

```powershell
http GET http://localhost:3001/auth/me --session=user
```

Сохранить `id` как `<USER_ID>`.

Пополнить баланс:

```powershell
http POST http://localhost:3001/auth/balance/deposit --session=admin userId="<USER_ID>" amount:=5000
```

Создать тренера и тренировку:

```powershell
http POST http://localhost:3002/trainers --session=admin name="Тренер Тест" bio="Для тестирования уведомлений"
```

Сохранить `id` как `<TRAINER_ID>`.

```powershell
http POST http://localhost:3002/trainings --session=admin title="Тестовая тренировка" type="yoga" trainerId="<TRAINER_ID>" scheduledAt="2026-06-20T10:00:00Z" durationMinutes:=60 capacity:=10 price:=300
```

Сохранить `id` как `<TRAINING_ID>`.

> **Далее заменяй `<TOKEN>` на токен пользователя, если не указано иное.**

---

## Сценарий 1: Booking → Notification (booking.created)

Проверяет: Booking Service публикует событие → Notification Service создаёт уведомление.

### 9. Забронировать тренировку

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_ID>"
```

**Ожидаемый результат:** 201 Created.

### 10. Проверить, что уведомление создалось

```powershell
http GET http://localhost:3004/notifications --session=user
```

**Ожидаемый результат:** 200 OK, список содержит уведомление с:

```json
{
  "items": [
    {
      "type": "booking_confirmation",
      "title": "Запись на тренировку подтверждена",
      "isRead": false
    }
  ],
  "total": 1
}
```

Сохранить `id` уведомления как `<NOTIFICATION_ID>`.

### 11. Проверить количество непрочитанных

```powershell
http GET http://localhost:3004/notifications/unread-count --session=user
```

**Ожидаемый результат:**

```json
{
  "count": 1
}
```

---

## Сценарий 2: Cancel Booking → Notification (booking.cancelled)

Проверяет: отмена бронирования → новое уведомление об отмене.

### 12. Отменить бронирование

```powershell
http POST http://localhost:3003/bookings/<BOOKING_ID>/cancel --session=user reason="Тестовая отмена"
```

**Ожидаемый результат:** 200 OK.

### 13. Проверить уведомление об отмене

```powershell
http GET http://localhost:3004/notifications --session=user
```

**Ожидаемый результат:** список содержит 2 уведомления — `booking_confirmation` и `booking_cancellation`.

### 14. Проверить, что баланс-уведомление тоже создалось

Отмена бронирования → возврат средств → Auth Service публикует `balance.changed`.

```powershell
http GET http://localhost:3004/notifications/unread-count --session=user
```

**Ожидаемый результат:** `count` >= 2 (booking_confirmation + booking_cancellation + возможное balance_change).

---

## Сценарий 3: Balance Deposit → Notification (balance.changed)

Проверяет: Auth Service публикует `balance.changed` → Notification Service создаёт уведомление.

### 15. Пополнить баланс

```powershell
http POST http://localhost:3001/auth/balance/deposit --session=admin userId="<USER_ID>" amount:=1000
```

**Ожидаемый результат:** 200 OK.

### 16. Проверить уведомление об изменении баланса

```powershell
http GET http://localhost:3004/notifications type=balance_change --session=user
```

**Ожидаемый результат:** список содержит уведомление с:

```json
{
  "type": "balance_change",
  "title": "Изменение баланса"
}
```

---

## Сценарий 4: Waitlist → Notification (waitlist.joined + waitlist.promoted)

Проверяет: полный цикл waitlist → добавление в очередь → отмена → продвижение → уведомления.

### 17. Создать тренировку с capacity=1

```powershell
http POST http://localhost:3002/trainings --session=admin title="Тест WL" type="crossfit" trainerId="<TRAINER_ID>" scheduledAt="2026-06-25T10:00:00Z" durationMinutes:=60 capacity:=1 price:=200
```

Сохранить `id` как `<TRAINING_WL_ID>`.

### 18. Создать второго пользователя и пополнить баланс

```powershell
http POST http://localhost:3001/auth/register email="test2@example.com" password="test12345" name="Test User 2"
```

```powershell
http POST http://localhost:3001/auth/login email="test2@example.com" password="test12345"
```

Сохранить токен в сессию `user2`. Получить `<USER2_ID>`:

```powershell
http GET http://localhost:3001/auth/me --session=user2
```

```powershell
http POST http://localhost:3001/auth/balance/deposit --session=admin userId="<USER2_ID>" amount:=5000
```

### 19. Первый пользователь бронирует (занимает единственное место)

```powershell
http POST http://localhost:3003/bookings --session=user trainingId="<TRAINING_WL_ID>"
```

### 20. Второй пользователь встаёт в waitlist

```powershell
http POST http://localhost:3003/waitlist --session=user2 trainingId="<TRAINING_WL_ID>"
```

**Ожидаемый результат:** 201 Created.

### 21. Проверить уведомление waitlist у второго пользователя

```powershell
http GET http://localhost:3004/notifications --session=user2
```

**Ожидаемый результат:** уведомление с `type: "waitlist_joined"`.

### 22. Первый пользователь отменяет → waitlist promotion

```powershell
http POST http://localhost:3003/bookings/<BOOKING_WL_ID>/cancel --session=user reason="Освобождаю место"
```

### 23. Проверить уведомление о продвижении у второго пользователя

```powershell
http GET http://localhost:3004/notifications --session=user2
```

**Ожидаемый результат:** уведомление с `type: "waitlist_promoted"`, `title: "Место освободилось! Вы записаны"`.

---

## Сценарий 5: REST API Notification

### 24. Отметить уведомление как прочитанное

```powershell
http PATCH http://localhost:3004/notifications/<NOTIFICATION_ID>/read --session=user
```

**Ожидаемый результат:** 200 OK, `isRead: true`.

### 25. Отметить все как прочитанные

```powershell
http PATCH http://localhost:3004/notifications/read-all --session=user
```

**Ожидаемый результат:** 200 OK.

### 26. Проверить, что непрочитанных нет

```powershell
http GET http://localhost:3004/notifications/unread-count --session=user
```

**Ожидаемый результат:** `{ "count": 0 }`.

### 27. Доступ без токена (negative)

```powershell
http GET http://localhost:3004/notifications
```

**Ожидаемый результат:** 401 Unauthorized.

### 28. Создание уведомления админом

```powershell
http POST http://localhost:3004/notifications --session=admin userId="<USER_ID>" type=training_reminder title="Тест" content="Тестовое уведомление"
```

**Ожидаемый результат:** 201 Created.

### 29. Создание уведомления не-админом (negative)

```powershell
http POST http://localhost:3004/notifications --session=user userId="<USER_ID>" type=training_reminder title="Тест" content="Тестовое уведомление"
```

**Ожидаемый результат:** 403 Forbidden.

---

## Проверка RabbitMQ

### 30. Проверить RabbitMQ Management UI

Открыть: http://localhost:15672 (dreamfitness / dreamfitness123)

- [ ] Exchange `dreamfitness.exchange` существует
- [ ] Queue `notification.service.queue` существует и привязана к exchange
- [ ] В логах notification-service видны сообщения о получении событий

---

## Проверка Swagger

### 31. Проверить Swagger UI

Открыть: http://localhost:3004/api/docs/notification-service

- [ ] Документация загружается
- [ ] Отображаются все endpoints
- [ ] Кнопка **Authorize** работает

---

## Проверка Email (опционально)

### 32. Проверить отправку email

После любого действия, создающего уведомление, проверить логи notification-service:

- В логах должно быть: `Email sent to ...: <message-id>`
- Или ошибка отправки, если SMTP недоступен — это нормально, уведомление в БД всё равно создаётся

> Для проверки реальной отправки: зайти на https://ethereal.email/messages, используя учётные данные из `.env.development`.

---

## Чек-лист результатов

### Интеграция с другими сервисами

| #   | Тест                                             | Статус |
| --- | ------------------------------------------------ | ------ |
| 9   | Booking → уведомление booking_confirmation       | [ ]    |
| 12  | Cancel → уведомление booking_cancellation        | [ ]    |
| 15  | Deposit → уведомление balance_change             | [ ]    |
| 21  | Waitlist join → уведомление waitlist_joined      | [ ]    |
| 23  | Waitlist promote → уведомление waitlist_promoted | [ ]    |

### REST API Notification Service

| #   | Тест                            | Статус |
| --- | ------------------------------- | ------ |
| 10  | GET /notifications              | [ ]    |
| 11  | GET /notifications/unread-count | [ ]    |
| 24  | PATCH /notifications/:id/read   | [ ]    |
| 26  | PATCH /notifications/read-all   | [ ]    |
| 28  | POST /notifications (admin)     | [ ]    |
| 27  | Доступ без токена (negative)    | [ ]    |
| 29  | POST не-админом (negative)      | [ ]    |

### Infrastructure

| #   | Тест                   | Статус |
| --- | ---------------------- | ------ |
| 30  | RabbitMQ Management UI | [ ]    |
| 31  | Swagger UI             | [ ]    |
| 32  | Email отправка         | [ ]    |
