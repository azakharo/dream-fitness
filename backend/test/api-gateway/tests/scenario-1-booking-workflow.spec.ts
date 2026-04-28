import { expect, APIRequestContext } from '@playwright/test';
import { trainingTest } from '../fixtures/training.fixture';

trainingTest.describe('Scenario 1: Booking Workflow', () => {
  let request: APIRequestContext;
  let baseURL: string;

  trainingTest.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    });
    baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
  });

  trainingTest.afterAll(async () => {
    await request.dispose();
  });

  // Step 16 - should create booking successfully
  trainingTest(
    'should create booking successfully',
    async ({ userToken, trainingId1 }) => {
      const response = await request.post(`${baseURL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          trainingId: trainingId1,
        },
      });

      expect(response.status()).toBe(201);

      const responseBody = (await response.json()) as {
        id: string;
        trainingId: string;
        userId: string;
      };
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('trainingId', trainingId1);
      expect(responseBody).toHaveProperty('userId');

      // Store booking ID for later tests
      process.env.BOOKING_ID = responseBody.id;
    },
  );

  // Step 17 - should return user bookings list
  trainingTest('should return user bookings list', async ({ userToken }) => {
    const response = await request.get(`${baseURL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = (await response.json()) as {
      bookings: Array<{ id: string }>;
    };
    expect(responseBody).toHaveProperty('bookings');
    expect(Array.isArray(responseBody.bookings)).toBe(true);
    expect(responseBody.bookings.length).toBeGreaterThan(0);
  });

  // Step 18 - should return booking by ID
  trainingTest(
    'should return booking by ID',
    async ({ userToken, bookingId }) => {
      const response = await request.get(
        `${baseURL}/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseBody = (await response.json()) as {
        id: string;
        trainingId: string;
        userId: string;
      };
      expect(responseBody).toHaveProperty('id', bookingId);
      expect(responseBody).toHaveProperty('trainingId');
      expect(responseBody).toHaveProperty('userId');
    },
  );

  // Step 19 - should reject duplicate booking
  trainingTest(
    'should reject duplicate booking',
    async ({ userToken, trainingId1 }) => {
      const response = await request.post(`${baseURL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          trainingId: trainingId1,
        },
      });

      expect(response.status()).toBe(409);

      const responseBody = (await response.json()) as { message: string };
      expect(responseBody).toHaveProperty('message');
    },
  );

  // Step 20 - should reject non-existent training
  trainingTest('should reject non-existent training', async ({ userToken }) => {
    const nonExistentTrainingId = '00000000-0000-0000-0000-000000000000';

    const response = await request.post(`${baseURL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        trainingId: nonExistentTrainingId,
      },
    });

    // Expect 404 or 503 depending on the service response
    expect([404, 503]).toContain(response.status());
  });

  // Step 21 - should reject request without token
  trainingTest(
    'should reject request without token',
    async ({ trainingId1 }) => {
      const response = await request.post(`${baseURL}/api/bookings`, {
        data: {
          trainingId: trainingId1,
        },
      });

      expect(response.status()).toBe(401);
    },
  );
});
