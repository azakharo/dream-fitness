# AGENTS.md

## Основные документы по проекту

- [PRD](../doc/PRD.md)
- [Требования к UI](../doc/UI.md)
- [Frontend ADR](../doc/Frontend-ADR.md)
- [OpenAPI 3.0 спецификация API бекенда](../doc/openapi.json)
- [Краткое описание API бекенда](../doc/API.md)
- [Все типы данных, предоставляемые backend API](./src/types/types.ts)

## Технологический стек

- [Технологический стек](./README.md#tech-stack)

## Структура папок проекта

[Структура проекта](../doc/Frontend-ADR.md#7-структура-проекта)

## Основные npm команды

- Установка зависимостей: `npm install`
- Start development mode: `npm run dev`
- Production build: `npm run build`
- Проверка кода на наличие ошибок Typescript: `npm run ts`
- Линтинг и автоформатирование кода: `npm run lint`
- Авто-генерация типов данных, предоставляемых backend API, из OpenAPI spec: `npm run gen:types`

## Правила по работе с кодом

- Если во время выполнения задачи изменялись TypeScript или JavaScript файлы исходного кода, то после выполнения задачи (в самом конце), нужно проверить, нет ли ошибок TypeScript (`npm run ts`) и других принятых правил кодирования (`npm run lint`). Обнаруженные проблемы необходимо исправить.
