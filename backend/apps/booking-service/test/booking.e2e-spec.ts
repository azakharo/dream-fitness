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
import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    authHelper = new AuthHelper();
    bookingHelper = new BookingHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    await dbHelper.seedTestData();
    jest.resetAllMocks();
    mockTrainingClientService.getTraining.mockResolvedValue(
      createTrainingMock(),
    );
    mockTrainingClientService.getAvailability.mockResolvedValue(
      createAvailabilityMock(),
    );
    // The following mocks will be called if a test is wrong (forgot to add mock)
    mockAuthClientService.reservePoints.mockRejectedValue(
      new Error('unexpected call of reservePoints (should not be called)'),
    );
    mockAuthClientService.refundPoints.mockRejectedValue(
      new Error('unexpected call of refundPoints (should not be called)'),
    );
    mockAuthClientService.releasePoints.mockRejectedValue(
      new Error('unexpected call of releasePoints (should not be called)'),
    );
  });

  describe('POST /bookings', () => {
    it('should create booking successfully', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(TEST_USERS.user1.id);
      expect(response.body.trainingId).toBe(TEST_TRAINING.id);
      expect(response.body.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should return 409 when no available slots', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const fullTraining = createTrainingMock({ capacity: 1 });

      mockTrainingClientService.getTraining.mockResolvedValueOnce(fullTraining);
      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      await bookingHelper.createBooking(TEST_TRAINING.id, headers);

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(409);
    });

    it('should return 409 when duplicate booking', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      await bookingHelper.createBooking(TEST_TRAINING.id, headers);

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(409);
    });

    it('should return 404 when training not found', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      mockTrainingClientService.getTraining.mockRejectedValue(
        new NotFoundException('Training not found'),
      );

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const response = await bookingHelper.createBooking(
        '33333333-3333-4333-a333-333333333333',
        headers,
      );

      expect(response.status).toBe(404);
    });

    it('should return 503 when training service unavailable', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      mockTrainingClientService.getTraining.mockRejectedValue(
        new ServiceUnavailableException('Training service unavailable'),
      );

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(503);
    });

    it('should return 409 when insufficient balance', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockRejectedValueOnce(
        new ConflictException('Insufficient balance'),
      );

      const response = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(409);
    });
  });

  describe('GET /bookings', () => {
    it('should return user bookings list with pagination', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      await bookingHelper.createBooking(TEST_TRAINING.id, headers);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const response = await bookingHelper.getBookings(headers);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should return empty list when no bookings', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const response = await bookingHelper.getBookings(headers);

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should filter by status', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      await bookingHelper.createBooking(TEST_TRAINING.id, headers);

      const response = await bookingHelper.getBookings(headers, {
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
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.getBookingById(bookingId, headers);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bookingId);
      expect(response.body.userId).toBe(TEST_USERS.user1.id);
      expect(response.body.trainingId).toBe(TEST_TRAINING.id);
    });

    it('should return 404 when booking not found', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      const response = await bookingHelper.getBookingById(
        'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        headers,
      );

      expect(response.status).toBe(404);
    });

    it('should return 403 when booking belongs to another user', async () => {
      const headers1 = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const headers2 = authHelper.getUserHeaders(TEST_USERS.user2.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers1,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.getBookingById(bookingId, headers2);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /bookings/:id/cancel', () => {
    it('should cancel booking successfully', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);

      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.cancelBooking(bookingId, headers);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bookingId);
      expect(response.body.status).toBe(BookingStatus.CANCELLED);
    });

    it('should return 409 when booking already cancelled', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);

      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );
      const bookingId = createResponse.body.id;

      await bookingHelper.cancelBooking(bookingId, headers);
      const response = await bookingHelper.cancelBooking(bookingId, headers);

      expect(response.status).toBe(409);
    });

    it('should return 404 when booking not found', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);

      const response = await bookingHelper.cancelBooking(
        'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        headers,
      );

      expect(response.status).toBe(404);
    });

    it('should return 409 when trying to cancel past training', async () => {
      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const pastTraining = createTrainingMock({
        scheduledAt: '2020-01-01T10:00:00.000Z',
      });

      mockTrainingClientService.getTraining.mockResolvedValue(pastTraining);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);

      const createResponse = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers,
      );
      const bookingId = createResponse.body.id;

      const response = await bookingHelper.cancelBooking(bookingId, headers);

      expect(response.status).toBe(409);
    });
  });
});
