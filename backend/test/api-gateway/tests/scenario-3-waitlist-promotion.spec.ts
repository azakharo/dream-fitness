import { test, expect, APIRequestContext } from '@playwright/test';
import { test as base } from '../fixtures/auth.fixture';

type WaitlistFixtures = {
  user2Token: string;
  user2Id: string;
};

const testWaitlist = base.extend<WaitlistFixtures>({
  user2Token: async ({}, use) => {
    await use(process.env.USER2_TOKEN || '');
  },
  user2Id: async ({}, use) => {
    await use(process.env.USER2_ID || '');
  },
});

const testWithTraining = testWaitlist.extend<{
  trainerId: string;
  trainingId1: string;
  trainingId2: string;
}>({
  trainerId: async ({}, use) => {
    await use(process.env.TRAINER_ID || '');
  },
  trainingId1: async ({}, use) => {
    await use(process.env.TRAINING_ID_1 || '');
  },
  trainingId2: async ({}, use) => {
    await use(process.env.TRAINING_ID_2 || '');
  },
});

testWithTraining.describe('Scenario 3: Waitlist Promotion', () => {
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

  // Step 25 - should fill training with capacity 1
  testWithTraining(
    'should fill training with capacity 1',
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

      // Store booking ID for later cancellation test
      process.env.BOOKING_ID_FILLED = responseBody.id;
    },
  );

  // Step 26 - should create second user
  testWithTraining('should create second user', async () => {
    const uniqueEmail = `user2_${Date.now()}@example.com`;

    const response = await request.post(`${baseURL}/api/auth/register`, {
      data: {
        email: uniqueEmail,
        password: 'test12345',
        name: 'Test User 2',
      },
    });

    expect(response.status()).toBe(201);

    const responseBody = (await response.json()) as {
      accessToken: string;
      user: {
        id: string;
        email: string;
      };
    };
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');

    // Store user2 info
    process.env.USER2_TOKEN = responseBody.accessToken;
    process.env.USER2_ID = responseBody.user.id;
  });

  // Step 27 - should deposit balance to user2
  testWithTraining(
    'should deposit balance to user2',
    async ({ adminToken, user2Id }) => {
      const response = await request.post(
        `${baseURL}/api/auth/balance/deposit`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            userId: user2Id,
            amount: 5000,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseBody = (await response.json()) as {
        balance: number;
      };
      expect(responseBody).toHaveProperty('balance', 5000);
    },
  );

  // Step 28 - should reject booking full training
  testWithTraining(
    'should reject booking full training',
    async ({ user2Token, trainingId1 }) => {
      const response = await request.post(`${baseURL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
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

  // Step 29 - should join waitlist
  testWithTraining(
    'should join waitlist',
    async ({ user2Token, trainingId1 }) => {
      const response = await request.post(`${baseURL}/api/waitlist`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
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
        position: number;
      };
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('trainingId', trainingId1);
      expect(responseBody).toHaveProperty('userId');
      expect(responseBody).toHaveProperty('position');
    },
  );

  // Step 30 - should return waitlist position
  testWithTraining(
    'should return waitlist position',
    async ({ user2Token, trainingId1 }) => {
      const response = await request.get(
        `${baseURL}/api/waitlist/position?trainingId=${trainingId1}`,
        {
          headers: {
            Authorization: `Bearer ${user2Token}`,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseBody = (await response.json()) as {
        trainingId: string;
        position: number;
      };
      expect(responseBody).toHaveProperty('trainingId', trainingId1);
      expect(responseBody).toHaveProperty('position');
    },
  );

  // Step 31 - should promote from waitlist on cancel
  testWithTraining(
    'should promote from waitlist on cancel',
    async ({ userToken, user2Token, trainingId1 }) => {
      // First, cancel the booking from Step 25
      const bookingId = process.env.BOOKING_ID_FILLED;

      const cancelResponse = await request.post(
        `${baseURL}/api/bookings/${bookingId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      expect(cancelResponse.status()).toBe(200);

      // Wait a bit for the promotion to process
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Then verify user2 got the booking via GET /api/bookings with user2Token
      const bookingsResponse = await request.get(`${baseURL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      });

      expect(bookingsResponse.status()).toBe(200);

      const responseBody = (await bookingsResponse.json()) as {
        bookings: Array<{
          id: string;
          trainingId: string;
          userId: string;
        }>;
      };
      expect(responseBody).toHaveProperty('bookings');
      expect(Array.isArray(responseBody.bookings)).toBe(true);

      // Verify user2 now has a booking for trainingId1
      const user2Booking = responseBody.bookings.find(
        (booking) => booking.trainingId === trainingId1,
      );
      expect(user2Booking).toBeDefined();
      expect(user2Booking?.trainingId).toBe(trainingId1);
    },
  );
});
