import { APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(
    private request: APIRequestContext,
    private baseURL: string,
  ) {}

  async get<T = unknown>(path: string, token?: string): Promise<T> {
    const response = await this.request.get(`${this.baseURL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.json() as Promise<T>;
  }

  async post<T = unknown>(
    path: string,
    body: unknown,
    token?: string,
  ): Promise<T> {
    const response = await this.request.post(`${this.baseURL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: body,
    });
    return response.json() as Promise<T>;
  }

  async delete<T = unknown>(path: string, token?: string): Promise<T> {
    const response = await this.request.delete(`${this.baseURL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.json() as Promise<T>;
  }
}
