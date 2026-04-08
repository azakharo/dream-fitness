# AGENTS.md

## Описание проекта

Backend starter which uses Nest.js, TypeORM, Postgres.

## Технологический стек

- [TypeScript](https://www.typescriptlang.org/)
- **Framework:** Nest.js
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Docs:** Swagger (OpenAPI)

## Основные npm команды

- Установка зависимостей: `npm install`
- Разработка: `npm run start:dev`
- Проверка кода на наличие ошибок Typescript: `npm run ts`
- Линтинг и автоформатирование кода: `npm run lint`

## Правила по работе с кодом

- Если по ходу выполнения задания изменялись Typescript или Javascript файлы исходного кода, то после выполнения задания, перед тем, как сообщить, что Task Completed, нужно проверить, нет ли ошибок Typescript в изменённых файлах. Для этого нужно вызвать команду `npm run ts`. Найденные ошибки и warnings необходимо исправить. Затем нужно вызвать `npm run lint`. Проблемы, которые нашёл eslint и не смог сам устранить, необходимо исправить.
