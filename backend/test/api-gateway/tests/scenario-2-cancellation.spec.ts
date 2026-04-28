/* eslint-disable no-empty-pattern */
import { test, expect, APIRequestContext } from '@playwright/test';
import { test as base } from '../fixtures/auth.fixture';

type CancellationFixtures = {
  bookingId: string;
};

const testCancellation = base.extend<CancellationFixtures>({
  bookingId: async ({}, use) => {
    await use(process.env.BOOKING_ID || '');
  },
});

testCancellation.describe('Scenario 2: Training Cancellation', () => {
  let request: APIRequestContext;
  let baseURL: string;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    });
    baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  // Step 22 - should cancel booking successfully
  testCancellation(
    'should cancel booking successfully',
    async ({ userToken, bookingId }) => {
      const response = await request.post(
        `${baseURL}/api/bookings/${bookingId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseBody = (await response.json()) as {
        id: string;
        status: string;
      };
      expect(responseBody).toHaveProperty('id', bookingId);
      expect(responseBody).toHaveProperty('status', 'cancelled');
    },
  );

  // Step 23 - should reject re-cancellation
  testCancellation(
    'should reject re-cancellation',
    async ({ userToken, bookingId }) => {
      const response = await request.post(
        `${baseURL}/api/bookings/${bookingId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      expect(response.status()).toBe(409);

      const responseBody = (await response.json()) as { message: string };
      expect(responseBody).toHaveProperty('message');
    },
  );

  // Step 24 - should reject non-existent booking
  testCancellation(
    'should reject non-existent booking',
    async ({ userToken }) => {
      const nonExistentBookingId = '00000000-0000-0000-0000-000000000000';

      const response = await request.post(
        `${baseURL}/api/bookings/${nonExistentBookingId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      expect(response.status()).toBe(404);

      const responseBody = (await response.json()) as { message: string };
      expect(responseBody).toHaveProperty('message');
    },
  );
});
