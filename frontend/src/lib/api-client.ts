import ky, {isHTTPError} from 'ky';
import type {
  BeforeRequestHook,
  BeforeRequestState,
  BeforeErrorHook,
  BeforeErrorState,
  AfterResponseHook,
  AfterResponseState,
} from 'ky';
import {useAuthStore} from '@/stores/auth-store';
import {formatDateKey} from '@/lib/date-utils';

const API_BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<void> | null = null;

/**
 * Recursively transforms Date objects to ISO strings in the request body.
 * This ensures the UI components can work with Date objects while the API
 * receives properly formatted string dates.
 */
function transformDatesInBody(body: unknown): unknown {
  if (body instanceof Date) {
    return formatDateKey(body);
  }
  if (Array.isArray(body)) {
    return body.map(transformDatesInBody);
  }
  if (body !== null && typeof body === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      result[key] = transformDatesInBody(value);
    }
    return result;
  }
  return body;
}

const beforeRequestHook: BeforeRequestHook = (state: BeforeRequestState) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    state.request.headers.set('Authorization', `Bearer ${token}`);
  }
};

const beforeErrorHook: BeforeErrorHook = async (state: BeforeErrorState) => {
  const {error} = state;
  if (isHTTPError(error)) {
    let data: unknown;
    try {
      data = await error.response.clone().json();
    } catch {
      data = null;
    }
    return new ApiError(error.response.status, data);
  }
  // Network errors, connection refused, etc. - convert to ApiError with status 0
  return new ApiError(0, {
    message:
      'Не удалось подключиться к серверу. Проверьте подключение к интернету.',
  });
};

const afterResponseHook: AfterResponseHook = async (
  state: AfterResponseState,
) => {
  if (state.response.status === 401 && !state.request.url.includes('/auth/')) {
    try {
      if (!refreshPromise) {
        refreshPromise = useAuthStore.getState().refreshTokens();
      }
      await refreshPromise;
      refreshPromise = null;
      const newToken = useAuthStore.getState().accessToken;
      state.request.headers.set('Authorization', `Bearer ${newToken}`);
      return ky(state.request);
    } catch (error) {
      refreshPromise = null;
      console.error('Token refresh failed:', error);
      useAuthStore.getState().logout();
    }
  }
  return state.response;
};

/**
 * Base ky instance with auto token injection and refresh logic
 */
const kyInstance = ky.create({
  prefix: API_BASE,
  credentials: 'include',
  hooks: {
    beforeRequest: [beforeRequestHook],
    beforeError: [beforeErrorHook],
    afterResponse: [afterResponseHook],
  },
});

/**
 * Convenience API methods with typed responses.
 * Date objects in request bodies are automatically converted to ISO date strings.
 */
export const api = {
  get: <T>(endpoint: string) => kyInstance.get(endpoint).json<T>(),

  post: <T>(endpoint: string, body?: unknown) =>
    kyInstance.post(endpoint, {json: transformDatesInBody(body)}).json<T>(),

  put: <T>(endpoint: string, body?: unknown) =>
    kyInstance.put(endpoint, {json: transformDatesInBody(body)}).json<T>(),

  patch: <T>(endpoint: string, body?: unknown) =>
    kyInstance.patch(endpoint, {json: transformDatesInBody(body)}).json<T>(),

  delete: async <T>(endpoint: string): Promise<T | void> => {
    const response = await kyInstance.delete(endpoint);
    const text = await response.text();
    if (!text) {
      return undefined;
    }
    return JSON.parse(text) as T;
  },
};
