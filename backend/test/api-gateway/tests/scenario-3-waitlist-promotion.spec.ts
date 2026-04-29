import { test, expect, APIRequestContext } from '@playwright/test';
import { trainingTest } from '../fixtures/training.fixture';
import { TEST_CONFIG } from '../test-config';
import {
  BookingListResponseDto,
  BookingResponseDto,
} from 'apps/booking-service/src/bookings/dto';
import { RegisterResponseBody } from '@app/contracts';
import { depositBalance } from '../global-setup';
import {
  WaitlistPositionResponseDto,
  WaitlistResponseDto,
} from 'apps/booking-service/src/waitlist/dto';

const baseURL = TEST_CONFIG.baseURL;

trainingTest.describe('Scenario 3: Waitlist Promotion', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL,
    });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  // Step 25 - should fill training with capacity 1
  trainingTest(
    'should fill training with capacity 1',
    async ({ userToken, trainingId1 }) => {
      const response = await request.post(`/api/bookings`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          trainingId: trainingId1,
        },
      });

      expect(response.status()).toBe(201);

      const responseBody = (await response.json()) as BookingResponseDto;
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('trainingId', trainingId1);
      expect(responseBody).toHaveProperty('userId');

      // Store booking ID for later cancellation test
      process.env.BOOKING_ID_FILLED = responseBody.id;
    },
  );

  // Step 26 - should create second user
  trainingTest('should create second user', async () => {
    const uniqueEmail = `user2_${Date.now()}@example.com`;

    const response = await request.post(`/api/auth/register`, {
      data: {
        email: uniqueEmail,
        password: 'test12345',
        name: 'Test User 2',
      },
    });

    expect(response.status()).toBe(201);

    const responseBody = (await response.json()) as RegisterResponseBody;
    expect(responseBody).toHaveProperty('tokens');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toHaveProperty('id');

    // Store user2 info
    process.env.USER2_TOKEN = responseBody.tokens.accessToken;
    process.env.USER2_ID = responseBody.user.id;
  });

  // Step 27 - should deposit balance to user2
  trainingTest(
    'should deposit balance to user2',
    async ({ adminToken, user2Id, request }) => {
      const response = await depositBalance(request, user2Id, 5000, adminToken);

      expect(response.status()).toBe(201);
    },
  );

  // Step 28 - should reject booking full training
  trainingTest(
    'should reject booking full training',
    async ({ user2Token, trainingId1 }) => {
      const response = await request.post(`/api/bookings`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
        data: {
          trainingId: trainingId1,
        },
      });

      expect(response.status()).toBe(409);
    },
  );

  // Step 29 - should join waitlist
  trainingTest('should join waitlist', async ({ user2Token, trainingId1 }) => {
    const response = await request.post(`/api/waitlist`, {
      headers: {
        Authorization: `Bearer ${user2Token}`,
      },
      data: {
        trainingId: trainingId1,
      },
    });

    expect(response.status()).toBe(201);

    const responseBody = (await response.json()) as WaitlistResponseDto;
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('trainingId', trainingId1);
    expect(responseBody).toHaveProperty('userId');
    expect(responseBody).toHaveProperty('position');
  });

  // Step 30 - should return waitlist position
  trainingTest(
    'should return waitlist position',
    async ({ user2Token, trainingId1 }) => {
      const response = await request.get(
        `/api/waitlist/position?trainingId=${trainingId1}`,
        {
          headers: {
            Authorization: `Bearer ${user2Token}`,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseBody =
        (await response.json()) as WaitlistPositionResponseDto;
      expect(responseBody).toHaveProperty('position');
    },
  );

  // Step 31 - should promote from waitlist on cancel
  trainingTest(
    'should promote from waitlist on cancel',
    async ({ userToken, user2Token, trainingId1 }) => {
      // First, cancel the booking from Step 25
      const bookingId = process.env.BOOKING_ID_FILLED;

      const cancelResponse = await request.post(
        `/api/bookings/${bookingId}/cancel`,
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
      const bookingsResponse = await request.get(`/api/bookings`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      });

      expect(bookingsResponse.status()).toBe(200);

      const responseBody =
        (await bookingsResponse.json()) as BookingListResponseDto;
      expect(responseBody).toHaveProperty('items');
      expect(Array.isArray(responseBody.items)).toBe(true);

      // Verify user2 now has a booking for trainingId1
      const user2Booking = responseBody.items.find(
        (booking) => booking.trainingId === trainingId1,
      );
      expect(user2Booking).toBeDefined();
      expect(user2Booking?.trainingId).toBe(trainingId1);
    },
  );
});
