import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { BookingHelper } from './helpers/booking.helper';
import { WaitlistHelper } from './helpers/waitlist.helper';
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
    authHelper = new AuthHelper(appHelper.getApp());
    bookingHelper = new BookingHelper(appHelper.getRequest());
    waitlistHelper = new WaitlistHelper(appHelper.getRequest());
    dataSource = appHelper.getDataSource();
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
    mockAuthClientService.reservePoints.mockResolvedValue(undefined);
    mockAuthClientService.refundPoints.mockResolvedValue(undefined);
    mockAuthClientService.releasePoints.mockResolvedValue(undefined);
  });

  describe('Waitlist Promotion Saga', () => {
    it('should promote first user in waitlist when booking is cancelled', async () => {
      const token1 = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const token2 = authHelper.getUserToken(
        TEST_USERS.user2.id,
        TEST_USERS.user2.email,
      );

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      await bookingHelper.createBooking(TEST_TRAINING.id, token1);

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token2);

      const cancelResponse = await bookingHelper.cancelBooking(
        TEST_TRAINING.id,
        token1,
      );

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.status).toBe(BookingStatus.CANCELLED);

      const waitlistPosition = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token2,
      );

      expect(waitlistPosition.status).toBe(404);
    });

    it('should promote multiple users from waitlist when booking is cancelled', async () => {
      const token1 = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const token2 = authHelper.getUserToken(
        TEST_USERS.user2.id,
        TEST_USERS.user2.email,
      );
      const token3 = authHelper.getUserToken(
        TEST_USERS.user3.id,
        TEST_USERS.user3.email,
      );

      const fullTraining = createTrainingMock({ capacity: 2 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      await bookingHelper.createBooking(TEST_TRAINING.id, token1);

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token2);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token3);

      const cancelResponse = await bookingHelper.cancelBooking(
        TEST_TRAINING.id,
        token1,
      );

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition2 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token2,
      );

      expect(waitlistPosition2.status).toBe(404);

      const waitlistPosition3 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token3,
      );

      expect(waitlistPosition3.status).toBe(200);
      expect(waitlistPosition3.body.position).toBe(1);
    });

    it('should skip user with insufficient balance and promote next user', async () => {
      const token1 = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const token2 = authHelper.getUserToken(
        TEST_USERS.user2.id,
        TEST_USERS.user2.email,
      );
      const token3 = authHelper.getUserToken(
        TEST_USERS.user3.id,
        TEST_USERS.user3.email,
      );

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      await bookingHelper.createBooking(TEST_TRAINING.id, token1);

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token1);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token2);
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token3);

      mockAuthClientService.reservePoints
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Insufficient balance'))
        .mockResolvedValueOnce(undefined);

      const cancelResponse = await bookingHelper.cancelBooking(
        TEST_TRAINING.id,
        token1,
      );

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition1 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token1,
      );

      expect(waitlistPosition1.status).toBe(404);

      const waitlistPosition2 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token2,
      );

      expect(waitlistPosition2.status).toBe(404);

      const waitlistPosition3 = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token3,
      );

      expect(waitlistPosition3.status).toBe(200);
      expect(waitlistPosition3.body.position).toBe(1);
    });

    it('should not promote when no available slots', async () => {
      const token1 = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const token2 = authHelper.getUserToken(
        TEST_USERS.user2.id,
        TEST_USERS.user2.email,
      );

      const fullTraining = createTrainingMock({ capacity: 1 });
      mockTrainingClientService.getTraining.mockResolvedValue(fullTraining);

      await bookingHelper.createBooking(TEST_TRAINING.id, token1);

      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token2);

      const cancelResponse = await bookingHelper.cancelBooking(
        TEST_TRAINING.id,
        token1,
      );

      expect(cancelResponse.status).toBe(200);

      const waitlistPosition = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token2,
      );

      expect(waitlistPosition.status).toBe(200);
      expect(waitlistPosition.body.position).toBe(1);
    });
  });

  describe('Helper methods for saga testing', () => {
    it('should insert booking directly into database', async () => {
      const manager = dataSource.createQueryRunner().manager;
      const booking = manager.create(Booking, {
        id: '11111111-1111-4111-a111-111111111111',
        userId: '11111111-1111-4111-a111-111111111111',
        trainingId: TEST_TRAINING.id,
        status: BookingStatus.CONFIRMED,
      });
      await manager.save(booking);

      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const response = await bookingHelper.getBookingById(
        '11111111-1111-4111-a111-111111111111',
        token,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('11111111-1111-4111-a111-111111111111');
    });

    it('should insert waitlist entry directly into database', async () => {
      const manager = dataSource.createQueryRunner().manager;
      const waitlist = manager.create(Waitlist, {
        id: '22222222-2222-4222-a222-222222222222',
        userId: TEST_USERS.user1.id,
        trainingId: TEST_TRAINING.id,
      });
      await manager.save(waitlist);

      const token = authHelper.getUserToken(
        TEST_USERS.user1.id,
        TEST_USERS.user1.email,
      );
      const response = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(200);
      expect(response.body.position).toBe(1);
    });
  });
});
