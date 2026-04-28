import { expect, APIResponse } from '@playwright/test';

export async function expectSuccess<T>(response: APIResponse): Promise<T> {
  expect(
    response.ok(),
    `Expected response to be OK, got ${response.status()}`,
  ).toBeTruthy();
  return response.json() as Promise<T>;
}

export async function expectError(
  response: APIResponse,
  status: number,
): Promise<unknown> {
  expect(
    response.status(),
    `Expected status ${status}, got ${response.status()}`,
  ).toBe(status);
  return response.json();
}

export function validateBookingResponse(booking: unknown): void {
  expect(booking).toMatchObject({
    id: expect.any(String),
    userId: expect.any(String),
    trainingId: expect.any(String),
    status: expect.stringMatching(/confirmed|cancelled/),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });
}

export function validateProblemDetails(response: unknown): void {
  expect(response).toMatchObject({
    status: expect.any(Number),
    title: expect.any(String),
    detail: expect.any(String),
  });
}
