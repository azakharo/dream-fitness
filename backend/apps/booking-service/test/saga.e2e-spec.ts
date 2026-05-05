import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { BookingHelper } from './helpers/booking.helper';
import { WaitlistHelper } from './helpers/waitlist.helper';
import { wait } from './helpers/test.helper';
import {
  createTrainingMock,
  TEST_TRAINING,
  TEST_USERS,
} from './fixtures/booking.fixtures';
import { BookingStatus } from '@app/shared/enums';
import { mockTrainingClientService } from './mocks/training-client.mock';
import { mockAuthClientService } from './mocks/auth-client.mock';
import { DataSource } from 'typeorm';
import { Waitlist } from '../src/waitlist/entities/waitlist.entity';
import { Booking } from '../src/bookings/entities/booking.entity';
import { ConflictException } from '@nestjs/common';

describe('Waitlist Promotion Saga (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let bookingHelper: BookingHelper;
  let waitlistHelper: WaitlistHelper;
  let dataSource: DataSource;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper();
    bookingHelper = new BookingHelper(appHelper.getRequest());
    waitlistHelper = new WaitlistHelper(appHelper.getRequest());
    dataSource = appHelper.getDataSource();
  });

  afterAll(async () => {
    await dbHelper.truncateTables();
    jest.resetAllMocks();
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    await dbHelper.seedTestData();
    jest.resetAllMocks();
    mockTrainingClientService.getTraining.mockResolvedValue(
      createTrainingMock(),
    );
    // The following mocks will be called if a test is wrong (forgot to add mock)
    mockAuthClientService.reservePoints.mockRejectedValue(
      new Error('unexpected, should not be called'),
    );
    mockAuthClientService.refundPoints.mockRejectedValue(
      new Error('unexpected, should not be called'),
    );
    mockAuthClientService.releasePoints.mockRejectedValue(
      new Error('unexpected, should not be called'),
    );
  });

  describe('Waitlist Promotion Saga', () => {
    it('should promote first user in waitlist when booking is cancelled', async () => {
      const headers1 = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const headers2 = authHelper.getUserHeaders(TEST_USERS.user2.id);

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);

      const createBookingResp = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers1,
      );

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers2);

      const cancelResponse = await bookingHelper.cancelBooking(
        createBookingResp.body.id,
        headers1,
      );

      // Wait for async saga processing to complete before assertions
      await wait(100);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.status).toBe(BookingStatus.CANCELLED);

      const waitlistPosition = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers2,
      );

      expect(waitlistPosition.status).toBe(404);
    });

    it('should promote multiple users from waitlist when booking is cancelled', async () => {
      const headers1 = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const headers2 = authHelper.getUserHeaders(TEST_USERS.user2.id);
      const headers3 = authHelper.getUserHeaders(TEST_USERS.user3.id);

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const createBookingResp = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers1,
      );

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers2);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers3);

      const cancelResponse = await bookingHelper.cancelBooking(
        createBookingResp.body.id,
        headers1,
      );

      // Wait for async saga processing to complete before assertions
      await wait(100);

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition2 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers2,
      );

      expect(waitlistPosition2.status).toBe(404);

      const waitlistPosition3 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers3,
      );

      expect(waitlistPosition3.status).toBe(200);
      expect(waitlistPosition3.body.position).toBe(1);
    });

    it('should skip user with insufficient balance and promote next user', async () => {
      const headers1 = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const headers2 = authHelper.getUserHeaders(TEST_USERS.user2.id);
      const headers3 = authHelper.getUserHeaders(TEST_USERS.user3.id);
      const headers4 = authHelper.getUserHeaders(TEST_USERS.user4.id);

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const createBookingResp = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers1,
      );

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers2);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers3);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers4);

      mockAuthClientService.reservePoints
        .mockRejectedValueOnce(new ConflictException('Insufficient balance')) // user2's promotion attempt (skipped)
        .mockResolvedValueOnce(undefined); // user3's promotion attempt

      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);

      const cancelResponse = await bookingHelper.cancelBooking(
        createBookingResp.body.id,
        headers1,
      );

      // Wait for async saga processing to complete before assertions
      await wait(100);

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition1 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers1,
      );

      expect(waitlistPosition1.status).toBe(404);

      const waitlistPosition2 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers2,
      );

      expect(waitlistPosition2.status).toBe(404);

      const waitlistPosition3 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers3,
      );

      expect(waitlistPosition3.status).toBe(404);

      const waitlistPosition4 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers4,
      );

      expect(waitlistPosition4.status).toBe(200);
      expect(waitlistPosition4.body.position).toBe(1);
    });

    it('should not promote when no available slots', async () => {
      const headers1 = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const headers2 = authHelper.getUserHeaders(TEST_USERS.user2.id);
      const headers3 = authHelper.getUserHeaders(TEST_USERS.user3.id);

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const createBookingResp = await bookingHelper.createBooking(
        TEST_TRAINING.id,
        headers1,
      );

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers2);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, headers3);

      mockAuthClientService.refundPoints.mockResolvedValueOnce(undefined);
      mockAuthClientService.reservePoints.mockResolvedValueOnce(undefined);

      const cancelResponse = await bookingHelper.cancelBooking(
        createBookingResp.body.id,
        headers1,
      );

      // Wait for async saga processing to complete before assertions
      await wait(100);

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition2 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers2,
      );

      expect(waitlistPosition2.status).toBe(404);

      const waitlistPosition3 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers3,
      );

      expect(waitlistPosition3.status).toBe(200);
      expect(waitlistPosition3.body.position).toBe(1);
    });
  });

  describe('Helper methods for saga testing', () => {
    it('should insert booking directly into database', async () => {
      const userId = TEST_USERS.user1.id;
      const bookingId = '11111111-1111-4111-a111-111111111111';
      const manager = dataSource.createQueryRunner().manager;
      const booking = manager.create(Booking, {
        id: bookingId,
        userId,
        trainingId: TEST_TRAINING.id,
        status: BookingStatus.CONFIRMED,
      });
      await manager.save(booking);

      const headers = authHelper.getUserHeaders(userId);
      const response = await bookingHelper.getBookingById(bookingId, headers);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bookingId);
    });

    it('should insert waitlist entry directly into database', async () => {
      const manager = dataSource.createQueryRunner().manager;
      const waitlist = manager.create(Waitlist, {
        id: '22222222-2222-4222-a222-222222222222',
        userId: TEST_USERS.user1.id,
        trainingId: TEST_TRAINING.id,
      });
      await manager.save(waitlist);

      const headers = authHelper.getUserHeaders(TEST_USERS.user1.id);
      const response = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        headers,
      );

      expect(response.status).toBe(200);
      expect(response.body.position).toBe(1);
    });
  });
});
