# План редизайна DreamFitness Frontend

## Обзор

Переход от сухого административного стиля к яркому энергичному дизайну с Lime-темой, градиентами и мотивационными элементами.

**Область изменений:**

- **Полный редизайн:** Login, Register, Dashboard, Schedule, Profile, Booking, History
- **Обновление UI-компонентов:** все админ-страницы используют новые Button, Input, Card, Badge
- **Мотивационные элементы:** Dashboard, Schedule, Profile
- **Логотип:** PNG-файл (NewDesign\mq4th19x-logo.png)

---

## Этап 1: UI-компоненты (Foundation)

### 1.1 Обновить Button

**Файл:** `src/components/ui/button-variants.ts`

Изменения:

- Добавить вариант `gradient` с градиентным фоном и shadow-accent
- Обновить `default` для использования градиента как основного
- Добавить hover-эффект `translateY(-1px)` с усилением тени
- Обновить размеры под дизайн (padding, font-size)

```ts
variant: {
  default: `
    bg-gradient-to-r from-[oklch(0.75_0.22_125)] to-[oklch(0.65_0.20_135)]
    text-white shadow-[0_4px_14px_oklch(0.68_0.22_130/0.35)]
    hover:shadow-[0_6px_20px_oklch(0.68_0.22_130/0.45)]
    active:translate-y-0
  `,
  outline: `
    border-2 border-[oklch(0.90_0.01_130)] bg-background
    hover:bg-[oklch(0.94_0.10_130)] hover:border-[oklch(0.68_0.22_130)]
  `,
  // ... остальные варианты
}
```

### 1.2 Обновить Input

**Файл:** `src/components/ui/Input.tsx`

Изменения:

- Border: 2px solid `--border`
- Border radius: 12px (radius)
- Padding: 14px 16px
- Focus: border-accent + ring-4 accent-soft
- Font-size: 15px

### 1.3 Обновить Badge

**Файл:** `src/components/ui/badge-variants.ts`

Изменения:

- Добавить вариант `gradient` (gradient-primary фон, белый текст)
- Pill style: border-radius 999px
- Font: 10px, uppercase, letter-spacing 0.05em, font-weight 700
- Padding: 4px 10px

### 1.4 Обновить Card

**Файл:** `src/components/ui/Card.tsx`

Изменения:

- Border: 1px solid `--border`
- Border-radius: 12px (radius)
- Hover для TrainingCard: translateY(-2px) + shadow-md + border-accent
- Padding: 16px (CardBody)

### 1.5 Добавить логотип

**Действие:** Скопировать `NewDesign/mq4th19x-logo.png` в `frontend/public/logo.png`

---

## Этап 2: Layout-компоненты

### 2.1 Обновить Header

**Файл:** `src/components/layout/Header.tsx`

Изменения:

- Logo: использовать PNG-файл + текст "DreamFitness"
- Фон: backdrop-blur(12px), полупрозрачный
- Border-bottom: 1px solid --border
- Высота: 56px
- Logo слева: иконка 40x40px (с PNG внутри), текст 18px bold

Структура:

```
┌──────────────────────────────────────────────────────┐
│ [Logo Icon] DreamFitness    [Nav Links]    [Notif][Avatar] │
└──────────────────────────────────────────────────────┘
```

### 2.2 Обновить TopNav

**Файл:** `src/components/layout/TopNav.tsx`

Изменения:

- Скрыть на мобильных (<768px)
- Active link: цвет accent-dark
- Hover: цвет primary
- Font: 14px, font-weight 500

### 2.3 Обновить BottomNav

**Файл:** `src/components/layout/BottomNav.tsx`

Изменения:

- Показывать только на мобильных (<768px)
- Fixed bottom
- Height: 64px
- Active item: цвет accent-dark
- Items: Главная, Расписание, История, Профиль

### 2.4 Обновить ClientLayout

**Файл:** `src/components/layout/ClientLayout.tsx`

Изменения:

- Фон: var(--bg) (#f5f7f5)
- Main: max-width 1200px, padding-bottom 80px на мобильных
- Container padding: 24px

---

## Этап 3: Новые компоненты

### 3.1 Создать Logo компонент

**Файл:** `src/components/common/Logo.tsx`

```tsx
interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}
```

Размеры:

- sm: иконка 40x40, PNG 32x32, текст 18px (Header)
- md: иконка 56x56, PNG 48x48, текст 20px (форма)
- lg: иконка 220x220, PNG 180x180 (hero)

### 3.2 Создать TipCard компонент

**Файл:** `src/components/common/TipCard.tsx`

```tsx
interface TipCardProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
}
```

Стили:

- Фон: gradient-soft
- Граница: 1px solid color-mix(accent 25%, transparent)
- Padding: 16-20px
- Иконка: круг gradient-primary фон

### 3.3 Создать MotivationBanner компонент

**Файл:** `src/components/common/MotivationBanner.tsx`

```tsx
interface MotivationBannerProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}
```

Стили:

- Фон: gradient-primary
- Текст: белый
- Иконка: круг rgba(255,255,255,0.2) фон
- Мобильный: вертикальный layout, центрированный текст

### 3.4 Создать WeekNav компонент

**Файл:** `src/components/client/schedule/WeekNav.tsx`

(Замена/рефакторинг WeeklyCalendar)

```tsx
interface WeekNavProps {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}
```

Стили:

- Контейнер: фон surface, граница border, border-radius 12px
- День: padding 12px 16px, min-width 70px
- Active: gradient-primary фон, белый текст
- Hover: accent-soft фон

### 3.5 Создать TrainingTypeIcon компонент

**Файл:** `src/components/client/schedule/TrainingTypeIcon.tsx`

```tsx
interface TrainingTypeIconProps {
  type: TrainingType;
  size?: "sm" | "md" | "lg";
}
```

Типы и иконки (SVG):
| Type | Icon |
|------|------|
| yoga | Человек в позе йоги |
| crossfit | Гантели |
| boxing | Мишень |
| cardio | Пульс |
| dance | Звёзды |
| pilates | Растяжка |
| strength | Гиря |

---

## Этап 4: Auth страницы (полный редизайн)

### 4.1 LoginPage

**Файл:** `src/pages/auth/LoginPage.tsx`

Новый layout: двухколоночный (hero слева, форма справа)

**Hero секция:**

- Фон: gradient-primary с radial gradient overlay
- Logo: 220x220px круг с PNG
- Заголовок: "Достигни своих фитнес-целей" (clamp 28px-40px)
- Подзаголовок: описание
- Статистика: "50+ Тренировок | 12 Тренеров | 2000+ Клиентов"

**Форма:**

- Logo: маленький (56x56), заголовок "С возвращением!"
- Поля: Email, Пароль
- Checkbox "Запомнить меня" + ссылка "Забыли пароль?"
- Кнопка: gradient, shadow-accent
- Ссылка на регистрацию
- TipCard: "Совет дня"

**Breakpoint:** <860px — только форма, hero скрыт

### 4.2 RegisterPage

**Файл:** `src/pages/auth/RegisterPage.tsx`

Новый layout: двухколоночный (hero слева, форма справа, 1fr 1.2fr)

**Hero секция:**

- Фон: gradient-primary
- Header: Logo + "DreamFitness"
- Иллюстрация: бегущий человек SVG
- Заголовок: "Начни путь к лучшей версии себя"
- Подзаголовок: описание
- Features: 3 преимущества с иконками

**Форма:**

- Logo + заголовок "Создай аккаунт"
- Поля: Имя, Email, Телефон, Дата рождения, Пол, Пароль, Подтверждение
- Согласие с условиями
- Кнопка gradient
- Ссылка на вход
- MotivationCard

**Breakpoint:** <960px — только форма, hero скрыт

---

## Этап 5: Client страницы (полный редизайн)

### 5.1 DashboardPage

**Файл:** `src/pages/client/DashboardPage.tsx`

**Структура:**

```
PageHeader (Заголовок + приветствие)
BalanceCard
UpcomingTrainings
QuickActions
MotivationBanner (новое)
```

**MotivationBanner:**

- Заголовок: "Продолжай в том же духе!"
- Текст: "Каждая тренировка приближает тебя к цели"

### 5.2 SchedulePage

**Файл:** `src/pages/client/SchedulePage.tsx`

**Структура:**

```
PageHeader
ScheduleFilters (обновить стиль select)
WeekNav (новый компонент)
ScheduleGrid (тренировки по времени)
MotivationBanner
TipsSection (3 TipCard)
```

**MotivationBanner:**

- Заголовок: "Запишись на 5 тренировок и получи бонус!"
- Текст: "Каждая 6-я тренировка — бесплатно"

**TipsSection:**

- Приходи вовремя
- Пей воду
- Отслеживай прогресс

### 5.3 TrainingCard (обновить)

**Файл:** `src/components/client/schedule/TrainingCard.tsx`

Новая структура:

```
┌──────────────────────────────┐
│ ┌────────────────────────┐  │
│ │ [Type Badge]            │  │  <- Image section (100px)
│ │    [TrainingTypeIcon]   │  │     gradient-soft фон
│ └────────────────────────┘  │
├──────────────────────────────┤
│ Title                        │
│ [Clock] 60 мин  [User] Тренер│
│ [Spots]         [Price]      │
└──────────────────────────────┘
```

Hover: translateY(-2px), shadow-md, border-accent

### 5.4 ProfilePage

**Файл:** `src/pages/client/ProfilePage.tsx`

**Структура:**

```
PageHeader
ProfileInfo (обновить стиль Card)
TipCard: совет по прогрессу
```

**TipCard:**

- Заголовок: "Достигай новых высот"
- Текст: "Записывай свои достижения и следи за прогрессом"

### 5.5 BookingPage

**Файл:** `src/pages/client/BookingPage.tsx`

Обновить стили:

- TrainingDetails: использовать новые Card стили
- BookingActions: gradient кнопки
- AvailabilityStatus: обновить Badge стили

### 5.6 HistoryPage

**Файл:** `src/pages/client/HistoryPage.tsx`

Обновить:

- PageHeader стиль
- Card стили для списков
- Пустые состояния (EmptyState)

---

## Этап 6: Админ-страницы (только UI-компоненты)

Без изменения layout. Автоматически применятся новые стили:

- Button (gradient primary)
- Input (новый border, focus)
- Card (border-radius, hover)
- Badge (gradient variant)
- Table (если используется)

**Файлы не изменяются** — только используют обновлённые UI-компоненты.

---

## Этап 7: CSS и Tailwind

### 7.1 Обновить index.css

**Файл:** `src/index.css`

Уже содержит правильные переменные. Проверить:

- gradient-primary класс
- shadow-primary класс
- accent-soft-bg класс

Добавить если отсутствуют:

```css
.gradient-primary {
  background: linear-gradient(
    135deg,
    oklch(0.75 0.22 125),
    oklch(0.65 0.2 135)
  );
}

.shadow-accent {
  box-shadow: 0 4px 20px rgba(74, 222, 80, 0.25);
}
```

### 7.2 Проверить Tailwind конфигурацию

Убедиться что цвета из index.css доступны в Tailwind.

---

## Порядок выполнения

1. **Этап 1:** UI-компоненты (Button, Input, Badge, Card)
2. **Этап 2:** Layout (Header, TopNav, BottomNav, ClientLayout)
3. **Этап 3:** Новые компоненты (Logo, TipCard, MotivationBanner, WeekNav, TrainingTypeIcon)
4. **Этап 4:** Auth страницы (Login, Register)
5. **Этап 5:** Client страницы (Dashboard, Schedule, Profile, Booking, History)
6. **Этап 6:** Проверка админ-страниц
7. **Этап 7:** CSS/Tailwind финализация

---

## Файлы для изменения

### Новые файлы (создать):

- `src/components/common/Logo.tsx`
- `src/components/common/TipCard.tsx`
- `src/components/common/MotivationBanner.tsx`
- `src/components/client/schedule/WeekNav.tsx`
- `src/components/client/schedule/TrainingTypeIcon.tsx`
- `public/logo.png` (копия из NewDesign)

### Изменяемые файлы:

- `src/components/ui/button-variants.ts`
- `src/components/ui/Input.tsx`
- `src/components/ui/badge-variants.ts`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/TopNav.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/ClientLayout.tsx`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/pages/client/DashboardPage.tsx`
- `src/pages/client/SchedulePage.tsx`
- `src/pages/client/ProfilePage.tsx`
- `src/pages/client/BookingPage.tsx`
- `src/pages/client/HistoryPage.tsx`
- `src/components/client/schedule/TrainingCard.tsx`
- `src/components/client/schedule/ScheduleFilters.tsx`
- `src/index.css`

---

## Риски и ограничения

1. **WeeklyCalendar → WeekNav**: существующий компонент имеет расширенный функционал (expand/collapse дней). Новый WeekNav проще — может потребовать доработки.

2. **Breakpoints**: новый дизайн использует 860px и 960px для auth-layout. Убедиться что это не конфликтует с существующим responsive.

3. **Тестирование**: после каждого этапа запускать `npm run ts` и `npm run lint`.

---

## Критерии готовности

- [ ] Все UI-компоненты используют gradient-primary для основных действий
- [ ] Hover-эффекты на кнопках и карточках
- [ ] Auth страницы: двухколоночный layout с hero-секцией
- [ ] Dashboard, Schedule, Profile содержат мотивационные элементы
- [ ] Мобильная версия: BottomNav работает корректно
- [ ] TypeScript и ESLint без ошибок
- [ ] Визуальное соответствие DESIGN.md
