import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { WaitlistHelper } from './helpers/waitlist.helper';
import { createTrainingMock, TEST_TRAINING } from './fixtures/booking.fixtures';
import { BookingStatus } from '@app/shared/enums';
import { mockTrainingClientService } from './mocks/training-client.mock';

describe('Waitlist API (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let waitlistHelper: WaitlistHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper(appHelper.getApp());
    waitlistHelper = new WaitlistHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    jest.clearAllMocks();
    mockTrainingClientService.getTraining.mockResolvedValue(
      createTrainingMock(),
    );
  });

  describe('POST /waitlist', () => {
    it('should join waitlist successfully', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      const response = await waitlistHelper.joinWaitlist(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe('user1');
      expect(response.body.trainingId).toBe(TEST_TRAINING.id);
      expect(response.body.position).toBeGreaterThanOrEqual(1);
    });

    it('should return 409 when already on waitlist', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token);

      const response = await waitlistHelper.joinWaitlist(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(409);
    });

    it('should return 409 when already has booking for this training', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token);
      await waitlistHelper.leaveWaitlist(TEST_TRAINING.id, token);

      const bookingResponse = await waitlistHelper.joinWaitlist(
        TEST_TRAINING.id,
        token,
      );
      const bookingId = bookingResponse.body.id;

      const response = await waitlistHelper.joinWaitlist(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(409);
    });

    it('should return 404 when training not found', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      mockTrainingClientService.getTraining.mockRejectedValue(
        new Error('Training not found'),
      );

      const response = await waitlistHelper.joinWaitlist(
        'non-existent-training-id',
        token,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /waitlist/position', () => {
    it('should return waitlist position', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token);

      const response = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(200);
      expect(response.body.position).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 when not on waitlist', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');

      const response = await waitlistHelper.getWaitlistPosition(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /waitlist', () => {
    it('should leave waitlist successfully', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');
      await waitlistHelper.joinWaitlist(TEST_TRAINING.id, token);

      const response = await waitlistHelper.leaveWaitlist(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Removed from waitlist');
    });

    it('should return 404 when not on waitlist', async () => {
      const token = authHelper.getUserToken('user1', 'user1@example.com');

      const response = await waitlistHelper.leaveWaitlist(
        TEST_TRAINING.id,
        token,
      );

      expect(response.status).toBe(404);
    });
  });
});
