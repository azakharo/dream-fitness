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

const API_BASE = '/api';

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
  return error;
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
 * Convenience API methods with typed responses
 */
export const api = {
  get: <T>(endpoint: string) => kyInstance.get(endpoint).json<T>(),

  post: <T>(endpoint: string, body?: unknown) =>
    kyInstance.post(endpoint, {json: body}).json<T>(),

  put: <T>(endpoint: string, body?: unknown) =>
    kyInstance.put(endpoint, {json: body}).json<T>(),

  delete: <T>(endpoint: string) => kyInstance.delete(endpoint).json<T>(),
};
