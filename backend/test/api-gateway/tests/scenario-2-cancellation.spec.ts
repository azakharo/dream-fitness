import { expect, APIRequestContext } from '@playwright/test';
import { bookingTest } from '../fixtures/booking.fixture';
import { TEST_CONFIG } from '../test-config';

const baseURL = TEST_CONFIG.baseURL;

bookingTest.describe('Scenario 2: Training Cancellation', () => {
  let request: APIRequestContext;

  bookingTest.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL,
    });
  });

  bookingTest.afterAll(async () => {
    await request.dispose();
  });

  // Step 22 - should cancel booking successfully
  bookingTest(
    'should cancel booking successfully',
    async ({ userToken, bookingId }) => {
      const response = await request.post(`/api/bookings/${bookingId}/cancel`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

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
  bookingTest(
    'should reject re-cancellation',
    async ({ userToken, bookingId }) => {
      const response = await request.post(`/api/bookings/${bookingId}/cancel`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(response.status()).toBe(409);

      const responseBody = (await response.json()) as { message: string };
      expect(responseBody).toHaveProperty('message');
    },
  );

  // Step 24 - should reject non-existent booking
  bookingTest('should reject non-existent booking', async ({ userToken }) => {
    const nonExistentBookingId = '8579cb9f-dd90-42b9-b83a-2d1c615f62f8';

    const response = await request.post(
      `/api/bookings/${nonExistentBookingId}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    expect(response.status()).toBe(404);

    const responseBody = (await response.json()) as { message: string };
    expect(responseBody).toHaveProperty('message');
  });
});
