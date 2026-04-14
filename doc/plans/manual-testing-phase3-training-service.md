# План ручного тестирования Training Service (Фаза 3)

## Предварительные шаги

### 1. Запустить инфраструктуру (PostgreSQL + RabbitMQ)

```powershell
cd backend
docker compose up -d
```

**Проверка:** оба контейнера `dreamfitness-postgres` и `dreamfitness-rabbitmq` запущены.

### 2. Запустить миграции

```powershell
cd backend
npm run db:migrate
```

**Ожидаемый результат:** миграции применены, включая `AddTrainingDescriptionAndStatus`.

### 2.5. Запустить seed

```powershell
cd backend
npm run db:seed
```

### 3. Запустить auth-service (для получения JWT токенов)

```powershell
cd backend
npm run start:dev:auth-service
```

**Ожидаемый результат:** `Auth Service is running on port 3001`.

### 4. Запустить training-service

В отдельном терминале:

```powershell
cd backend
npm run start:dev:training-service
```

**Ожидаемый результат:** `Training Service is running on port 3002`.

### 5. Получить JWT токен администратора

```powershell
http POST http://localhost:3001/auth/login email="admin@dreamfitness.com" password="admin123"
```

**Ожидаемый результат:** 200 OK, сохранить `accessToken` из ответа.

> **Далее во всех командах заменяй `<TOKEN>` на полученный accessToken.**

---

## Тестирование Trainers API

### 6. Создание тренера

```powershell
http POST http://localhost:3002/trainers "Authorization:Bearer <TOKEN>" name="Иван Петров" bio="Сертифицированный тренер по йоге с 10-летним стажем" avatarUrl="https://example.com/ivan.jpg"
```

**Ожидаемый результат:** 201 Created.

```json
{
  "id": "<TRAINER_ID>",
  "name": "Иван Петров",
  "bio": "Сертифицированный тренер по йоге с 10-летним стажем",
  "avatarUrl": "https://example.com/ivan.jpg",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

Сохранить `id` как `<TRAINER_ID>` для последующих шагов.

### 7. Создание второго тренера (минимальные данные)

```powershell
http POST http://localhost:3002/trainers "Authorization:Bearer <TOKEN>" name="Анна Сидорова"
```

**Ожидаемый результат:** 201 Created, `bio` и `avatarUrl` = `null`.

### 8. Получение списка активных тренеров

```powershell
http GET http://localhost:3002/trainers "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, массив из 2 тренеров.

### 9. Получение тренера по ID

```powershell
http GET http://localhost:3002/trainers/<TRAINER_ID> "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, данные конкретного тренера.

### 10. Обновление тренера

```powershell
http PATCH http://localhost:3002/trainers/<TRAINER_ID> "Authorization:Bearer <TOKEN>" bio="Обновлённое био тренера" avatarUrl="https://example.com/new-avatar.jpg"
```

**Ожидаемый результат:** 200 OK, обновлённые `bio` и `avatarUrl`.

### 11. Деактивация тренера (второго)

```powershell
http DELETE http://localhost:3002/trainers/<TRAINER2_ID> "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK.

### 12. Проверка, что деактивированный тренер не в списке активных

```powershell
http GET http://localhost:3002/trainers "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, только 1 тренер (Иван Петров).

### 13. Создание тренера с дублирующимся именем (negative test)

```powershell
http POST http://localhost:3002/trainers "Authorization:Bearer <TOKEN>" name="Иван Петров"
```

**Ожидаемый результат:** 500 (бросается Error с сообщением о дублировании имени).

### 14. Создание тренера с невалидными данными (negative test)

```powershell
http POST http://localhost:3002/trainers "Authorization:Bearer <TOKEN>" name=""
```

**Ожидаемый результат:** 400 Bad Request (validation error).

---

## Тестирование Trainings API

### 15. Создание тренировки (yoga)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Утренняя йога" description="Расслабляющая утренняя практика" type="yoga" trainerId="<TRAINER_ID>" scheduledAt="2026-04-20T09:00:00Z" durationMinutes:=60 capacity:=20 price:=500
```

**Ожидаемый результат:** 201 Created.

```json
{
  "id": "<TRAINING_ID>",
  "trainerId": "<TRAINER_ID>",
  "title": "Утренняя йога",
  "description": "Расслабляющая утренняя практика",
  "type": "yoga",
  "scheduledAt": "2026-04-20T09:00:00.000Z",
  "durationMinutes": 60,
  "capacity": 20,
  "price": 500,
  "status": "scheduled",
  "createdAt": "...",
  "updatedAt": "...",
  "availableSlots": 20,
  "currentParticipants": 0
}
```

Сохранить `id` как `<TRAINING_ID>`.

### 16. Создание второй тренировки (crossfit)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Кроссфит интенсив" type="crossfit" trainerId="<TRAINER_ID>" scheduledAt="2026-04-20T11:00:00Z" durationMinutes:=90 capacity:=15 price:=800
```

**Ожидаемый результат:** 201 Created, `description` = `null`.

### 17. Создание третьей тренировки на другой день (boxing)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Бокс для начинающих" type="boxing" trainerId="<TRAINER_ID>" scheduledAt="2026-04-21T10:00:00Z" durationMinutes:=60 capacity:=10 price:=600
```

**Ожидаемый результат:** 201 Created.

### 18. Получение списка тренировок (без фильтров)

```powershell
http GET http://localhost:3002/trainings "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, `{ data: [...], total: 3 }`.

> **Note:** Контроллер использует `@Body()` для `TrainingFilterDto` в GET-запросе. При отправке GET без body вернётся полный список.

### 19. Получение тренировки по ID

```powershell
http GET http://localhost:3002/trainings/<TRAINING_ID> "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, полные данные тренировки.

### 20. Проверка доступности мест

```powershell
http GET http://localhost:3002/trainings/<TRAINING_ID>/availability "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK.

```json
{
  "trainingId": "<TRAINING_ID>",
  "capacity": 20,
  "currentParticipants": 0,
  "availableSlots": 20,
  "isAvailable": true
}
```

### 21. Обновление тренировки

```powershell
http PATCH http://localhost:3002/trainings/<TRAINING_ID> "Authorization:Bearer <TOKEN>" title="Утренняя йога — продвинутый уровень" capacity:=25 price:=600
```

**Ожидаемый результат:** 200 OK, обновлённые `title`, `capacity`, `price`.

### 22. Отмена тренировки (второй)

```powershell
http DELETE http://localhost:3002/trainings/<TRAINING2_ID> "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK.

### 23. Повторная отмена той же тренировки (negative test)

```powershell
http DELETE http://localhost:3002/trainings/<TRAINING2_ID> "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 400 Bad Request — `TrainingAlreadyCancelledException`.

### 24. Создание тренировки с неактивным тренером (negative test)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Тест" type="yoga" trainerId="<DEACTIVATED_TRAINER_ID>" scheduledAt="2026-04-25T10:00:00Z" durationMinutes:=60 capacity:=10 price:=500
```

**Ожидаемый результат:** 400 Bad Request — `TrainerNotActiveException`.

### 25. Создание тренировки с несуществующим тренером (negative test)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Тест" type="yoga" trainerId="00000000-0000-0000-0000-000000000000" scheduledAt="2026-04-25T10:00:00Z" durationMinutes:=60 capacity:=10 price:=500
```

**Ожидаемый результат:** 404 Not Found — `TrainerNotFoundException`.

### 26. Создание тренировки с прошлой датой (negative test)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Тест" type="yoga" trainerId="<TRAINER_ID>" scheduledAt="2020-01-01T10:00:00Z" durationMinutes:=60 capacity:=10 price:=500
```

**Ожидаемый результат:** 400 Bad Request — `PastDateException`.

### 27. Создание тренировки с пересечением по времени (negative test)

```powershell
http POST http://localhost:3002/trainings "Authorization:Bearer <TOKEN>" title="Конфликтующая тренировка" type="pilates" trainerId="<TRAINER_ID>" scheduledAt="2026-04-20T09:00:00Z" durationMinutes:=60 capacity:=10 price:=500
```

**Ожидаемый результат:** 409 Conflict — `ScheduleConflictException`.

### 28. Получение несуществующей тренировки (negative test)

```powershell
http GET http://localhost:3002/trainings/00000000-0000-0000-0000-000000000000 "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 404 Not Found — `TrainingNotFoundException`.

### 29. Доступ без токена (negative test)

```powershell
http GET http://localhost:3002/trainings
```

**Ожидаемый результат:** 401 Unauthorized.

---

## Тестирование Schedule API

### 30. Получение расписания на текущую неделю

```powershell
http GET http://localhost:3002/schedule/week "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK.

```json
{
  "weekStart": "...",
  "weekEnd": "...",
  "days": [
    {
      "date": "2026-04-13",
      "dayOfWeek": "Monday",
      "trainings": []
    },
    ...
    {
      "date": "2026-04-20",
      "dayOfWeek": "Monday",
      "trainings": [
        {
          "id": "...",
          "title": "Утренняя йога — продвинутый уровень",
          "type": "yoga",
          "scheduledAt": "2026-04-20T09:00:00.000Z",
          "durationMinutes": 60,
          "capacity": 25,
          "price": 600,
          "trainerId": "<TRAINER_ID>",
          "trainerName": "Иван Петров"
        }
      ]
    },
    ...
  ]
}
```

### 31. Получение расписания на конкретную неделю

```powershell
http GET http://localhost:3002/schedule/week?date=2026-04-20 "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK, расписание с 20 по 26 апреля, содержащее тренировки.

### 32. Получение расписания по тренеру

```powershell
http GET http://localhost:3002/schedule/trainer/<TRAINER_ID>?dateFrom=2026-04-19&dateTo=2026-04-26 "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 200 OK.

```json
{
  "trainer": {
    "id": "<TRAINER_ID>",
    "name": "Иван Петров"
  },
  "trainings": [
    ...
  ]
}
```

### 33. Расписание по несуществующему тренеру (negative test)

```powershell
http GET http://localhost:3002/schedule/trainer/00000000-0000-0000-0000-000000000000 "Authorization:Bearer <TOKEN>"
```

**Ожидаемый результат:** 404 Not Found — `TrainerNotFoundException`.

---

## Swagger документация

### 34. Проверка Swagger UI

Открыть в браузере: http://localhost:3002/docs

- [ ] Документация загружается
- [ ] Отображаются группы: **trainers**, **trainings**, **schedule**
- [ ] Все endpoints отображаются корректно
- [ ] Схемы DTO корректны (CreateTrainerDto, CreateTrainingDto, TrainingFilterDto, etc.)
- [ ] Кнопка **Authorize** работает — ввести `Bearer <TOKEN>` и авторизоваться
- [ ] Можно выполнить запрос прямо из Swagger UI

---

## RabbitMQ

### 35. Проверка RabbitMQ Management UI

Открыть: http://localhost:15672 (dreamfitness / dreamfitness123)

- [ ] Exchange `dreamfitness.exchange` существует
- [ ] Перейти в вкладку **Exchanges** → `dreamfitness.exchange`
- [ ] Опубликованные сообщения: после шагов 15-17 видны `training.created` события
- [ ] После шага 22 виден `training.cancelled` event
- [ ] После шага 21 виден `training.updated` event

> Для проверки: в RabbitMQ Management UI можно создать временную очередь привязанную к exchange с routing key `training.created`, чтобы перехватывать события и видеть их содержимое.

---

## Чек-лист результатов

### Trainers API

| #   | Тест                                  | Статус |
| --- | ------------------------------------- | ------ |
| 6   | Создание тренера (полные данные)      | [ ]    |
| 7   | Создание тренера (минимальные данные) | [ ]    |
| 8   | Список активных тренеров              | [ ]    |
| 9   | Получение тренера по ID               | [ ]    |
| 10  | Обновление тренера                    | [ ]    |
| 11  | Деактивация тренера                   | [ ]    |
| 12  | Деактивированный не в списке          | [ ]    |
| 13  | Дублирование имени тренера            | [ ]    |
| 14  | Невалидные данные тренера             | [ ]    |

### Trainings API

| #   | Тест                                      | Статус |
| --- | ----------------------------------------- | ------ |
| 15  | Создание тренировки (yoga)                | [ ]    |
| 16  | Создание тренировки (crossfit)            | [ ]    |
| 17  | Создание тренировки (boxing, другой день) | [ ]    |
| 18  | Список тренировок                         | [ ]    |
| 19  | Получение тренировки по ID                | [ ]    |
| 20  | Проверка доступности мест                 | [ ]    |
| 21  | Обновление тренировки                     | [ ]    |
| 22  | Отмена тренировки                         | [ ]    |
| 23  | Повторная отмена (negative)               | [ ]    |
| 24  | Неактивный тренер (negative)              | [ ]    |
| 25  | Несуществующий тренер (negative)          | [ ]    |
| 26  | Прошедшая дата (negative)                 | [ ]    |
| 27  | Пересечение по времени (negative)         | [ ]    |
| 28  | Несуществующая тренировка (negative)      | [ ]    |
| 29  | Доступ без токена (negative)              | [ ]    |

### Schedule API

| #   | Тест                             | Статус |
| --- | -------------------------------- | ------ |
| 30  | Расписание на текущую неделю     | [ ]    |
| 31  | Расписание на конкретную неделю  | [ ]    |
| 32  | Расписание по тренеру            | [ ]    |
| 33  | Несуществующий тренер (negative) | [ ]    |

### Infrastructure

| #   | Тест                             | Статус |
| --- | -------------------------------- | ------ |
| 34  | Swagger UI                       | [ ]    |
| 35  | RabbitMQ Management UI — события | [ ]    |
