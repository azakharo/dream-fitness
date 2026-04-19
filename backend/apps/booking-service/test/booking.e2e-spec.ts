import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { BookingHelper } from './helpers/booking.helper';
import {
  createTrainingMock,
  createAvailabilityMock,
  TEST_TRAINING,
  TEST_USERS,
} from './fixtures/booking.fixtures';
import { BookingStatus } from '@app/shared/enums';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { mockTrainingClientService } from './mocks/training-client.mock';
import { mockAuthClientService } from './mocks/auth-client.mock';

describe('Bookings API (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let bookingHelper: BookingHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper(appHelper.getApp());
    bookingHelper = new BookingHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    await dbHelper.seedTestData();
    jest.clearAllMocks();
    mockTrainingClientService.getTraining.mockResolvedValue(
      createTrainingMock(),
    );
    mockTrainingClientService.getAvailability.mockResolvedValue(
      createAvailabilityMock(),
    );
    mockAuthClientService.reservePoints.mockResolvedValue(undefined);
    mockAuthClientService.refundPoints.mockResolvedValue(undefined);
    mockAuthClientService.releasePoints.mockResolvedValue(undefined);
  });

  describe('POST /bookings', () => {
    it('should create booking successfully', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(TEST_USERS.user1.id);
      expect(response.body.trainingId).toBe(TEST_TRAINING.id);
      expect(response.body.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should return 409 when no available slots', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const fullTraining = createTrainingMock({ capacity: 1 });

      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);
      await bookingHelper.createBooking(TEST_TRAINING.id, token);

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(409);
    });

    it('should return 409 when duplicate booking', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      await bookingHelper.createBooking(TEST_TRAINING.id, token);

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(409);
    });

    it('should return 404 when training not found', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      mockTrainingClientService.getTraining.mockRejectedValue(
        new NotFoundException('Training not found'),
      );

      const response = await bookingHelper.createBooking(
        'non-existent-training-id',
        token,
      );

      expect(response.status).toBe(404);
    });

    it('should return 503 when training service unavailable', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      mockTrainingClientService.getTraining.mockRejectedValue(
        new ServiceUnavailableException('Training service unavailable'),
      );

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(503);
    });

    it('should return 409 when insufficient balance', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      mockAuthClientService.reservePoints.mockRejectedValue(
        new Error('Insufficient balance'),
      );

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(409);
    });
  });

  describe('GET /bookings', () => {
    it('should return user bookings list with pagination', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      await bookingHelper.createBooking(TEST_TRAINING.id, token);

      const response = await bookingHelper.getBookings(token);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should return empty list when no bookings', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );

      const response = await bookingHelper.getBookings(token);

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should filter by status', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      await bookingHelper.createBooking(TEST_TRAINING.id, token);

      const response = await bookingHelper.getBookings(token, {
        status: BookingStatus.CONFIRMED,
      });

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      response.body.items.forEach((booking) => {
        expect(booking.status).toBe(BookingStatus.CONFIRMED);
      });
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return booking by ID', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.getBookingById(bookingId, token);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bookingId);
      expect(response.body.userId).toBe(TEST_USERS.user1.id);
      expect(response.body.trainingId).toBe(TEST_TRAINING.id);
    });

    it('should return 404 when booking not found', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );

      const response = await bookingHelper.getBookingById(
        'non-existent-booking-id',
        token,
      );

      expect(response.status).toBe(404);
    });

    it('should return 403 when booking belongs to another user', async () => {
      const token1 = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const token2 = authHelper.getUserToken(
        TEST_USERS.user2.id,
        TEST_USERS.user2.email,
      );
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token1,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.getBookingById(bookingId, token2);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /bookings/:id/cancel', () => {
    it('should cancel booking successfully', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.cancelBooking(bookingId, token);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bookingId);
      expect(response.body.status).toBe(BookingStatus.CANCELLED);
    });

    it('should return 409 when booking already cancelled', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );
      const bookingId = createResponse.body.id;

      await bookingHelper.cancelBooking(bookingId, token);
      const response = await bookingHelper.cancelBooking(bookingId, token);

      expect(response.status).toBe(409);
    });

    it('should return 404 when booking not found', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );

      const response = await bookingHelper.cancelBooking(
        'non-existent-booking-id',
        token,
      );

      expect(response.status).toBe(404);
    });

    it('should return 409 when trying to cancel past training', async () => {
      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const pastTraining = createTrainingMock({
        scheduledAt: '2020-01-01T10:00:00.000Z',
      });

      mockTrainingClientService.getTraining.mockResolvedValue(pastTraining);
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        token,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.cancelBooking(bookingId, token);

      expect(response.status).toBe(409);
    });
  });
});
