/**
 * Константы маршрутов приложения.
 * Используются для типобезопасной навигации и избежания опечаток.
 */

// Публичные роуты (без авторизации)
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// Защищённые роуты клиента
export const CLIENT_ROUTES = {
  DASHBOARD: '/dashboard',
  SCHEDULE: '/schedule',
  BOOKING: '/booking/$id',
  PROFILE: '/profile',
  HISTORY: '/history',
  NOTIFICATIONS: '/notifications',
} as const;

// Роуты администратора
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  ADMIN_SCHEDULE: '/admin/schedule',
  ADMIN_SCHEDULE_NEW: '/admin/schedule/new',
  ADMIN_SCHEDULE_EDIT: '/admin/schedule/$id',
  USERS: '/admin/users',
  REPORTS: '/admin/reports',
} as const;

// Вспомогательные роуты
export const MISC_ROUTES = {
  HOME: '/',
  UNAUTHORIZED: '/unauthorized',
} as const;

/**
 * Объект для удобного доступа ко всем роутам.
 * Использование: ROUTES.DASHBOARD, ROUTES.LOGIN и т.д.
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...CLIENT_ROUTES,
  ...ADMIN_ROUTES,
  ...MISC_ROUTES,
} as const;
