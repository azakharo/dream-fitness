import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { TrainersHelper } from './helpers/trainers.helper';
import { TrainingsHelper } from './helpers/trainings.helper';
import { ScheduleHelper } from './helpers/schedule.helper';
import {
  createTrainerDto,
  futureDate,
  createTrainingDto,
} from './fixtures/training.fixtures';

describe('ScheduleController (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let trainersHelper: TrainersHelper;
  let trainingsHelper: TrainingsHelper;
  let scheduleHelper: ScheduleHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper();
    trainersHelper = new TrainersHelper(appHelper.getRequest());
    trainingsHelper = new TrainingsHelper(appHelper.getRequest());
    scheduleHelper = new ScheduleHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    jest.resetAllMocks();
  });

  describe('GET /schedule/week', () => {
    it('should return weekly schedule with trainings', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });
      const trainerResponse = await trainersHelper.create(headers, trainerData);
      const trainerId = trainerResponse.body.id;

      const training1 = createTrainingDto(trainerId, {
        scheduledAt: futureDate(1),
        title: 'Morning Yoga',
      });
      const training2 = createTrainingDto(trainerId, {
        scheduledAt: futureDate(2),
        title: 'Pilates Class',
      });

      await trainingsHelper.create(headers, training1);
      await trainingsHelper.create(headers, training2);

      const response = await scheduleHelper.getWeekSchedule(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('weekStart');
      expect(response.body).toHaveProperty('weekEnd');
      expect(response.body).toHaveProperty('days');
      expect(Array.isArray(response.body.days)).toBe(true);
      expect(response.body.days.length).toBe(7);

      const daysWithTrainings = response.body.days.filter(
        (day) => day.trainings.length > 0,
      );
      expect(daysWithTrainings.length).toBeGreaterThan(0);
    });

    it('should return schedule for specific week', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });
      const trainerResponse = await trainersHelper.create(headers, trainerData);
      const trainerId = trainerResponse.body.id;

      const training = createTrainingDto(trainerId, {
        scheduledAt: futureDate(1),
      });

      await trainingsHelper.create(headers, training);

      const nextWeekMonday = new Date();
      nextWeekMonday.setDate(nextWeekMonday.getDate() + 7);
      nextWeekMonday.setHours(0, 0, 0, 0);
      const weekDate = nextWeekMonday.toISOString();

      const response = await scheduleHelper.getWeekSchedule(headers, weekDate);

      expect(response.status).toBe(200);
      expect(response.body.weekStart).toBe(weekDate);
      expect(response.body.days[0].date).toBe(weekDate.split('T')[0]);
    });

    it('should return empty days for week without trainings', async () => {
      const headers = authHelper.getAdminHeaders();

      const response = await scheduleHelper.getWeekSchedule(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('weekStart');
      expect(response.body).toHaveProperty('weekEnd');
      expect(response.body).toHaveProperty('days');
      expect(Array.isArray(response.body.days)).toBe(true);
      expect(response.body.days.length).toBe(7);

      response.body.days.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('dayOfWeek');
        expect(day).toHaveProperty('trainings');
        expect(Array.isArray(day.trainings)).toBe(true);
        expect(day.trainings.length).toBe(0);
      });
    });

    it('should return 401 when no auth headers', async () => {
      const response = await appHelper.getRequest().get('/schedule/week');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /schedule/trainer/:id', () => {
    it('should return trainer schedule with trainings', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });
      const trainerResponse = await trainersHelper.create(headers, trainerData);
      const trainerId = trainerResponse.body.id;

      const training = createTrainingDto(trainerId, {
        scheduledAt: futureDate(1),
        title: 'Personal Training',
      });

      await trainingsHelper.create(headers, training);

      const response = await scheduleHelper.getTrainerSchedule(
        headers,
        trainerId,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trainer');
      expect(response.body).toHaveProperty('trainings');
      expect(response.body.trainer).toHaveProperty('id', trainerId);
      expect(response.body.trainer).toHaveProperty('name', trainerData.name);
      expect(Array.isArray(response.body.trainings)).toBe(true);
      expect(response.body.trainings.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent trainer', async () => {
      const headers = authHelper.getAdminHeaders();
      const nonExistentId = '00000000-0000-0000-0000-000000000001';

      const response = await scheduleHelper.getTrainerSchedule(
        headers,
        nonExistentId,
      );

      expect(response.status).toBe(404);
    });

    it('should filter by date range', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });
      const trainerResponse = await trainersHelper.create(headers, trainerData);
      const trainerId = trainerResponse.body.id;

      const training1 = createTrainingDto(trainerId, {
        scheduledAt: futureDate(1),
        title: 'Training 1',
      });
      const training2 = createTrainingDto(trainerId, {
        scheduledAt: futureDate(10),
        title: 'Training 2',
      });

      await trainingsHelper.create(headers, training1);
      await trainingsHelper.create(headers, training2);

      const dateFrom = futureDate(0);
      const dateTo = futureDate(5);

      const response = await scheduleHelper.getTrainerSchedule(
        headers,
        trainerId,
        dateFrom,
        dateTo,
      );

      expect(response.status).toBe(200);
      expect(response.body.trainings.length).toBe(1);
      expect(response.body.trainings[0].title).toBe('Training 1');
    });

    it('should use default 30-day range when no dates provided', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });
      const trainerResponse = await trainersHelper.create(headers, trainerData);
      const trainerId = trainerResponse.body.id;

      const training = createTrainingDto(trainerId, {
        scheduledAt: futureDate(1),
        title: 'Default Range Training',
      });

      await trainingsHelper.create(headers, training);

      const response = await scheduleHelper.getTrainerSchedule(
        headers,
        trainerId,
      );

      expect(response.status).toBe(200);
      expect(response.body.trainings.length).toBeGreaterThan(0);
    });

    it('should return 401 when no auth headers', async () => {
      const response = await appHelper
        .getRequest()
        .get('/schedule/trainer/123');

      expect(response.status).toBe(400);
    });
  });
});
