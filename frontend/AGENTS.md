# AGENTS.md

## Основные документы по проекту

- [PRD](../doc/PRD.md)
- [Требования к UI](../doc/UI.md)
- [Frontend ADR](../doc/Frontend-ADR.md)
- [OpenAPI 3.0 спецификация API бекенда](./doc/openapi.json)
- [Краткое описание API бекенда](./doc/API.md)
- [Все типы данных, предоставляемые backend API](./src/types/types.ts)

## Технологический стек

- [React](https://react.dev/) (v19)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- Tailwind CSS
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/) with Radix UI — доступные UI компоненты на базе Radix примитивов

## Структура папок проекта

[Структура проекта](../doc/Frontend-ADR.md#7-структура-проекта)

## Основные npm команды

- Установка зависимостей: `npm install`
- Разработка: `npm run dev`
- Production build: `npm run build`
- Проверка кода на наличие ошибок Typescript: `npm run ts`
- Линтинг и автоформатирование кода: `npm run lint`
- Авто-генерация типов данных, предоставляемых backend API, из OpenAPI spec: `npm run gen:types`
