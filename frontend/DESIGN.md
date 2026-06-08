# DreamFitness Design System

Документ описывает визуальную систему для клиентской части приложения DreamFitness. Цель — сделать интерфейс ярким, энергичным и мотивирующим, в отличие от сухого административного стиля.

## 1. Design Tokens

### 1.1 Цвета

#### Основная палитра (Lime)

| Token | CSS Variable | Значение | Использование |
|-------|--------------|----------|---------------|
| Primary | `--accent` | `#4ade50` | Основной акцент, кнопки, активные элементы |
| Primary Dark | `--accent-dark` | `#22c55e` | Hover-состояния, текст на светлом фоне |
| Primary Deep | - | `#16a34a` | Глубокий акцент для градиентов |
| Primary Soft | `--accent-soft` | `color-mix(in oklch, var(--accent) 15%, transparent)` | Фон для акцентных блоков |

#### Нейтральные цвета

| Token | CSS Variable | Значение | Использование |
|-------|--------------|----------|---------------|
| Background | `--bg` | `#fafbfa` / `#f5f7f5` | Основной фон страницы |
| Surface | `--surface` | `#ffffff` | Фон карточек, модалок |
| Foreground | `--fg` | `#1a1f1a` | Основной текст |
| Muted | `--muted` | `#5a6b5a` | Вторичный текст, метки |
| Border | `--border` | `#d4e4d4` | Границы, разделители |

#### Семантические цвета

| Token | Значение | Использование |
|-------|----------|---------------|
| Error | `#ef4444` | Ошибки, валидация |
| Success | `#22c55e` | Успешные действия |
| Warning | `#f59e0b` | Предупреждения |

#### Градиенты

```css
--gradient-primary: linear-gradient(135deg, #4ade50 0%, #22c55e 50%, #16a34a 100%);
--gradient-soft: linear-gradient(180deg, rgba(74, 222, 80, 0.08) 0%, transparent 100%);
```

Используются для:
- Hero-секции на страницах авторизации
- Фон motivation-баннеров
- Основные кнопки действий

### 1.2 Типографика

#### Шрифты

```css
--font-display: 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: ui-monospace, 'JetBrains Mono', monospace;
```

#### Размеры (Type Scale)

| Token | Размер | Использование |
|-------|--------|---------------|
| text-xs | 11px | Метки, uppercase надписи |
| text-sm | 13-14px | Вторичный текст, описания |
| text-base | 15-16px | Основной текст |
| text-lg | 18px | Подзаголовки |
| text-xl | 20px | Заголовки карточек |
| text-2xl | 26-28px | Заголовки страниц |
| text-3xl | 36px | Крупные заголовки |
| text-4xl | 40-48px | Hero-заголовки (clamp) |

#### Начертания

- Regular (400) — основной текст
- Medium (500) — метки, кнопки
- Semibold (600) — подзаголовки
- Bold (700) — заголовки
- Extrabold (800) — hero-заголовки

### 1.3 Отступы (Spacing)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

Принципы:
- Внутри компонентов: 4px, 8px, 12px, 16px
- Между компонентами: 16px, 20px, 24px
- Секции на странице: 32px, 48px, 64px

### 1.4 Радиусы скругления

| Token | Значение | Использование |
|-------|----------|---------------|
| radius-sm | 8px | Малые элементы, badges |
| radius | 12px | Карточки, инпуты, кнопки |
| radius-lg | 20px | Большие карточки, модалки |
| radius-full | 9999px | Pills, аватары, badges |

### 1.5 Тени

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-accent: 0 4px 20px rgba(74, 222, 80, 0.25);
```

- `shadow-sm` — карточки в покое
- `shadow-md` — карточки при hover
- `shadow-accent` — кнопки с градиентом, акцентные элементы

### 1.6 Анимации

| Тип | Duration | Timing | Использование |
|-----|----------|--------|---------------|
| Fast | 150ms | ease | Hover кнопок, фокус инпутов |
| Normal | 200ms | ease | Hover карточек, появление |
| Smooth | 300ms | ease-out | Модалки, дропдауны |

---

## 2. Компоненты

### 2.1 Button

#### Варианты

| Variant | Внешний вид | Использование |
|---------|-------------|---------------|
| Primary | Градиент + shadow-accent | Основные действия: "Войти", "Записаться" |
| Secondary | Фон bg, граница border | Вторичные действия |
| Ghost | Без фона, только текст | Третичные ссылки |
| Destructive | Красный фон | Удаление, отмена брони |

#### Состояния

```
Default → Hover → Focus → Active → Disabled
```

- **Hover**: `transform: translateY(-1px)`, усиление тени
- **Focus**: `ring-4 ring-accent-soft`
- **Active**: `transform: translateY(0)`
- **Disabled**: opacity 50%, cursor not-allowed

#### Размеры

| Size | Padding | Font Size |
|------|---------|-----------|
| sm | 8px 16px | 13px |
| default | 14px 24px | 15px |
| lg | 16px 32px | 17px |

### 2.2 Input

#### Структура

```
┌─────────────────────────────────┐
│ Label (optional)                │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Placeholder / Value         │ │
│ └─────────────────────────────┘ │
│ Hint / Error message (optional)│
└─────────────────────────────────┘
```

#### Стили

- Border: 2px solid `--border`
- Border radius: `--radius` (12px)
- Padding: 14px 16px
- Font size: 15px

#### Состояния

- **Default**: фон `--bg`, граница `--border`
- **Focus**: граница `--accent`, тень `0 0 0 4px var(--accent-soft)`
- **Error**: граница `#ef4444`, текст ошибки красный
- **Disabled**: opacity 50%, cursor not-allowed

### 2.3 Card

#### TrainingCard

Карточка тренировки для расписания.

**Структура:**

```
┌──────────────────────────────┐
│ ┌────────────────────────┐  │
│ │ [Type Badge]            │  │  <- Image section (100px height)
│ │       [Icon SVG]        │  │     Градиентный фон или soft-градиент
│ └────────────────────────┘  │
├──────────────────────────────┤
│ Title                        │
│ [Icon] 60 мин  [Icon] Тренер │  <- Meta info
│                              │
│ [Spots remaining]  [Price]   │  <- Footer
└──────────────────────────────┘
```

**Состояния:**

- **Hover**: `transform: translateY(-2px)`, `shadow-md`, граница `--accent`
- **Full**: серый текст "Мест нет", иначе зелёный "X из Y мест"

**Типы тренировок и иконки:**

| Type | SVG Icon |
|------|----------|
| yoga | Человек в позе йоги (руки вверх) |
| crossfit | Гантели/штанга |
| boxing | Боксёрская груша или перчатки |
| cardio | Сердце/пульс |
| dance | Звёзды/сияние |
| pilates | Растяжка |
| strength | Гири |

### 2.4 Badge

Маленькие метки для типов тренировок, статусов.

```css
/* Pill style */
padding: 4px 10px;
font-size: 10px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.05em;
border-radius: 999px;
```

**Варианты:**

| Variant | Фон | Текст |
|---------|-----|-------|
| Default | gradient-primary | white |
| Secondary | accent-soft | accent-dark |
| Muted | border | muted |

### 2.5 TipCard / MotivationCard

Мотивационные блоки с советами.

**Структура:**

```
┌──────────────────────────────────┐
│ [Icon]  Заголовок                │
│                                  │
│ Текст совета или мотивации       │
└──────────────────────────────────┘
```

**Стили:**

- Фон: `--gradient-soft`
- Граница: `1px solid color-mix(in oklch, var(--accent) 25%, transparent)`
- Padding: 16-20px
- Иконка: круг с градиентным фоном

### 2.6 MotivationBanner

Большой горизонтальный баннер.

**Структура:**

```
┌───────────────────────────────────────────────┐
│  [Icon]  Заголовок                             │
│          Описание или мотивационный текст      │
└───────────────────────────────────────────────┘
```

- Фон: `--gradient-primary`
- Текст: белый
- Иконка: круг с `rgba(255,255,255,0.2)` фоном

**Мобильный режим:** Становится вертикальным, текст центрируется.

### 2.7 WeekNav

Навигация по дням недели в расписании.

**Структура:**

```
┌────────────────────────────────────────────────┐
│ [<]  [Пн 2] [Вт 3*] [Ср 4] [Чт 5] [Пт 6] [Сб 7] [Вс 8]  [>]  │
└────────────────────────────────────────────────┘
```

- *активный день: градиентный фон, белый текст*

**Стили:**

- Контейнер: фон `--surface`, граница `--border`
- День: padding 12px 16px, min-width 70px
- Active: фон `--gradient-primary`, цвет белый
- Hover: фон `--accent-soft`

---

## 3. Layout

### 3.1 Auth Layout (Login/Register)

Двухколоночный layout для страниц авторизации.

```
┌─────────────────────────────────────────────────────────────┐
│                         │                                   │
│     HERO SECTION        │         FORM SECTION              │
│     (gradient)          │         (white bg)                 │
│                         │                                   │
│     - Logo              │         - Logo (small)             │
│     - Title             │         - Form title              │
│     - Subtitle          │         - Form fields              │
│     - Stats              │         - Submit button           │
│     - Features (reg)     │         - Links                   │
│                         │         - Tip card                 │
│                         │                                   │
└─────────────────────────────────────────────────────────────┘
```

**Соотношение колонок:** `1fr 1fr` (login) или `1fr 1.2fr` (register)

**Breakpoint:** До 860-960px — только форма, hero скрыт.

### 3.2 App Layout (Client)

```
┌─────────────────────────────────────────────────────────────┐
│  TOP NAV (sticky)                                           │
│  [Logo] [Nav Links]              [Notif] [Avatar]           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    MAIN CONTENT                              │
│                    (max-width: 1200px)                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BOTTOM NAV (mobile only, fixed)                            │
│  [Home] [Schedule] [History] [Profile]                      │
└─────────────────────────────────────────────────────────────┘
```

**Top Nav:**

- Sticky, `backdrop-filter: blur(12px)`
- Фон: `color-mix(in oklch, var(--surface) 95%, transparent)`
- Высота: ~56px
- Nav Links скрыты на мобильных (<768px)

**Bottom Nav:**

- Fixed, показывается только на мобильных (<768px)
- Высота: 64px + padding-bottom для контента

### 3.3 Page Header

```
Заголовок страницы
Описание или подзаголовок
```

- Заголовок: 28px, bold, `letter-spacing: -0.02em`
- Подзаголовок: 15px, цвет `--muted`
- Отступ снизу: 24px

---

## 4. Responsive Breakpoints

| Name | Width | Описание |
|------|-------|----------|
| Mobile compact | 360px | Малые телефоны |
| Mobile standard | 390px | Стандартные телефоны |
| Mobile large | 430px | Большие телефоны |
| Foldable / Small tablet | 600px | Складные, малые планшеты |
| Tablet portrait | 768px | TopNav скрывает links, BottomNav появляется |
| Tablet landscape | 1024px | Планшеты горизонтально |
| Laptop | 1366px | Ноутбуки |
| Desktop | 1440px | Десктопы |
| Wide | 1920px | Широкие экраны |

**Принцип:** Mobile-first, без горизонтального скролла.

---

## 5. SVG Icons

### 5.1 Logo (Running Person)

Логотип представляет стилизованную фигуру бегущего человека.

**Цвета:**
- Кожа: градиент `#fcd5b8` → `#e8b896`
- Футболка: белый полупрозрачный градиент
- Шорты: `#1a1a1a` → `#333333`

**Размеры:**
- В навигации: 40x40px (иконка), 32x32px (изображение)
- В hero (login): 220x220px (контейнер), 180x180px (изображение)
- В форме: 56x56px (контейнер), 48x48px (изображение)

### 5.2 Training Type Icons

Каждый тип тренировки имеет уникальную SVG-иконку:

| Type | Icon Description |
|------|------------------|
| yoga | Фигура в позе йоги (руки вверх) |
| crossfit | Гантели / штанга |
| boxing | Боксёрская перчатка или мишень |
| cardio | Кардиограмма / пульс |
| dance | Звёзды / сияние |
| pilates | Растяжка |
| strength | Гиря |

---

## 6. Motivational Elements

### 6.1 Страница Login

**Hero:**
- Заголовок: "Достигни своих фитнес-целей"
- Подзаголовок: "Присоединяйся к лучшим тренировкам, записывайся онлайн и отслеживай свой прогресс"
- Статистика: "50+ Тренировок | 12 Тренеров | 2000+ Клиентов"

**Совет дня (TipCard):**
```
💡 Совет дня
Начинай утро с лёгкой разминки — это зарядит энергией на весь день 
и улучшит концентрацию на тренировках.
```

### 6.2 Страница Register

**Hero:**
- Иллюстрация: бегущий человек (SVG)
- Заголовок: "Начни путь к лучшей версии себя"
- Подзаголовок: "Регистрация займёт меньше минуты, а результат останется на всю жизнь"

**Features:**
- 📅 Удобное расписание тренировок онлайн
- ⭐ Бонусные баллы для постоянных клиентов
- 📈 Отслеживание личного прогресса

**Motivation Card:**
```
⚡ Первый шаг — самый важный!
Каждый чемпион когда-то начинал с первой тренировки
```

### 6.3 Страница Schedule

**Motivation Banner:**
```
⚡ Запишись на 5 тренировок и получи бонус!
Каждая 6-я тренировка — бесплатно. Достигай целей выгодно
```

**Tips Section:**
- ⏰ Приходи вовремя — за 10-15 минут успеешь переодеться и размяться
- 💧 Пей воду — не забудь бутылку воды для гидратации
- ✅ Отслеживай прогресс — записывай достижения в профиле

---

## 7. Анимации и Hover-эффекты

### 7.1 Buttons

```css
.btn-primary {
  transition: all 0.15s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(74, 222, 80, 0.35);
}
.btn-primary:active {
  transform: translateY(0);
}
```

### 7.2 Cards

```css
.training-card {
  transition: all 0.2s ease;
}
.training-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}
```

### 7.3 Week Day

```css
.week-day {
  transition: all 0.15s ease;
}
.week-day:hover {
  background: var(--accent-soft);
}
.week-day.active {
  background: var(--gradient-primary);
  color: white;
}
```

---

## 8. Кастомные Tailwind классы

Для упрощения разработки добавлены utility-классы:

```css
.gradient-primary {
  background: linear-gradient(135deg, oklch(0.75 0.22 125), oklch(0.65 0.20 135));
}

.shadow-primary {
  box-shadow: 0 4px 14px oklch(0.68 0.22 130 / 0.35);
}

.accent-soft-bg {
  background: color-mix(in oklch, var(--accent) 15%, transparent);
}
```

---

## 9. Accessibility

- Все интерактивные элементы имеют видимый focus state
- Контрастность текста соответствует WCAG AA
- Семантическая разметка (h1, nav, main, button)
- ARIA labels для иконок и кнопок без текста
- Поддержка prefers-reduced-motion (отключение анимаций)
