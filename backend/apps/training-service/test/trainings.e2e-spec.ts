import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { TrainersHelper } from './helpers/trainers.helper';
import { TrainingsHelper } from './helpers/trainings.helper';
import {
  createTrainerDto,
  createTrainingDto,
  futureDate,
} from './fixtures/training.fixtures';
import { mockEventsPublisher } from './mocks/events.module.mock';
import { TrainingType } from '@app/shared/enums';
import { CreateTrainingDto } from '../src/trainings/dto';
import { addMinutes } from 'date-fns';

describe('TrainingsController (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let trainersHelper: TrainersHelper;
  let trainingsHelper: TrainingsHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper();
    trainersHelper = new TrainersHelper(appHelper.getRequest());
    trainingsHelper = new TrainingsHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    jest.clearAllMocks();
  });

  describe('POST /trainings', () => {
    it('should create a training with valid data and active trainer', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(trainingData.title);
      expect(response.body.type).toBe(trainingData.type);
      expect(response.body.status).toBe('scheduled');
      expect(response.body.availableSlots).toBe(trainingData.capacity);
      expect(response.body.trainerId).toBe(trainerId);
    });

    it('should publish training.created event', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      await trainingsHelper.create(token, trainingData);

      expect(mockEventsPublisher.publishTrainingCreated).toHaveBeenCalled();
    });

    it('should return 404 when trainer does not exist', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainingData = createTrainingDto(
        '00000000-0000-0000-0000-000000000001',
      );

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(404);
    });

    it('should return 400 when trainer is not active', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      await trainersHelper.remove(token, trainerId);

      const trainingData = createTrainingDto(trainerId);
      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when scheduledAt is in the past', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        scheduledAt: futureDate(-1),
      });

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 409 on schedule conflict', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const training1StartDt = addMinutes(new Date(), 60);
      const training2StartDt = addMinutes(training1StartDt, 30);

      const trainingData1 = createTrainingDto(trainerId, {
        scheduledAt: training1StartDt.toISOString(),
        durationMinutes: 60,
      });
      await trainingsHelper.create(token, trainingData1);

      const trainingData2 = createTrainingDto(trainerId, {
        scheduledAt: training2StartDt.toISOString(),
        durationMinutes: 60,
      });
      const response = await trainingsHelper.create(token, trainingData2);

      expect(response.status).toBe(409);
    });

    it('should return 400 when title is missing', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        title: '',
      });

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when type is invalid', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        type: 'INVALID_TYPE' as TrainingType,
      });

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when capacity exceeds 100', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        capacity: 101,
      });

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when durationMinutes is less than 15', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        durationMinutes: 10,
      });

      const response = await trainingsHelper.create(token, trainingData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when extra fields are provided', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const response = await trainingsHelper.create(token, {
        ...createTrainingDto(trainerId),
        extraField: 'should be ignored',
      } as CreateTrainingDto);

      expect(response.status).toBe(400);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper.getRequest().post('/trainings').send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /trainings', () => {
    it('should return paginated list of trainings', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const firstTrainingStartDt = addMinutes(new Date(), 30);

      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          title: 'Training 1',
          scheduledAt: firstTrainingStartDt.toISOString(),
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          title: 'Training 2',
          scheduledAt: addMinutes(firstTrainingStartDt, 120).toISOString(),
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          title: 'Training 3',
          scheduledAt: addMinutes(firstTrainingStartDt, 240).toISOString(),
        }),
      );

      const response = await trainingsHelper.findAll(token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBe(3);
    });

    it('should return empty list when no trainings exist', async () => {
      const token = authHelper.generateAdminToken('test-user-id');

      const response = await trainingsHelper.findAll(token);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should filter by type', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          type: TrainingType.YOGA,
          title: 'Yoga 1',
          scheduledAt: futureDate(1),
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          type: TrainingType.CROSSFIT,
          title: 'Crossfit 1',
          scheduledAt: futureDate(2),
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          type: TrainingType.YOGA,
          title: 'Yoga 2',
          scheduledAt: futureDate(3),
        }),
      );

      const response = await trainingsHelper.findAll(token, {
        type: TrainingType.YOGA,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(
        response.body.data.every((t) => t.type === TrainingType.YOGA),
      ).toBe(true);
    });

    it('should filter by trainerId', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData1 = createTrainerDto({ name: 'Trainer 1' });
      const trainerData2 = createTrainerDto({ name: 'Trainer 2' });
      const trainerRes1 = await trainersHelper.create(token, trainerData1);
      const trainerRes2 = await trainersHelper.create(token, trainerData2);

      await trainingsHelper.create(
        token,
        createTrainingDto(trainerRes1.body.id, {
          title: 'Training 1',
          scheduledAt: futureDate(1),
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerRes2.body.id, { title: 'Training 2' }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerRes1.body.id, {
          title: 'Training 3',
          scheduledAt: futureDate(2),
        }),
      );

      const response = await trainingsHelper.findAll(token, {
        trainerId: trainerRes1.body.id,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(
        response.body.data.every((t) => t.trainerId === trainerRes1.body.id),
      ).toBe(true);
    });

    it('should filter by date range', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const date1 = futureDate(1);
      const date2 = futureDate(2);
      const date3 = futureDate(3);

      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          scheduledAt: date1,
          title: 'Training 1',
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          scheduledAt: date2,
          title: 'Training 2',
        }),
      );
      await trainingsHelper.create(
        token,
        createTrainingDto(trainerId, {
          scheduledAt: date3,
          title: 'Training 3',
        }),
      );

      const response = await trainingsHelper.findAll(token, {
        dateFrom: date1,
        dateTo: date2,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Training 1');
    });

    it('should respect pagination (page, limit)', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      for (let i = 1; i <= 5; i++) {
        await trainingsHelper.create(
          token,
          createTrainingDto(trainerId, {
            title: `Training ${i}`,
            scheduledAt: futureDate(i),
          }),
        );
      }

      const response = await trainingsHelper.findAll(token, {
        page: 1,
        limit: 2,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.total).toBe(5);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper.getRequest().get('/trainings');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /trainings/:id', () => {
    it('should return training details by ID', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const createResponse = await trainingsHelper.create(token, trainingData);

      const response = await trainingsHelper.findById(
        token,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.title).toBe(trainingData.title);
      expect(response.body.type).toBe(trainingData.type);
      expect(response.body.trainerId).toBe(trainerId);
      expect(response.body.status).toBe('scheduled');
      expect(response.body.capacity).toBe(trainingData.capacity);
      expect(response.body.durationMinutes).toBe(trainingData.durationMinutes);
      expect(response.body.price).toBe(trainingData.price);
      expect(response.body.availableSlots).toBe(trainingData.capacity);
      expect(response.body.currentParticipants).toBe(0);
    });

    it('should return 404 for non-existent training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const nonExistentId = '00000000-0000-0000-0000-000000000002';

      const response = await appHelper
        .getRequest()
        .get(`/trainings/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper.getRequest().get('/trainings/123');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /trainings/:id/availability', () => {
    it('should return availability info', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, { capacity: 10 });
      const createResponse = await trainingsHelper.create(token, trainingData);

      const response = await trainingsHelper.getAvailability(
        token,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);
      expect(response.body.trainingId).toBe(createResponse.body.id);
      expect(response.body.capacity).toBe(trainingData.capacity);
      expect(response.body.currentParticipants).toBe(0);
      expect(response.body.availableSlots).toBe(trainingData.capacity);
      expect(response.body.isAvailable).toBe(true);
    });

    it('should return isAvailable=true when slots available', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, { capacity: 5 });
      const createResponse = await trainingsHelper.create(token, trainingData);

      const response = await trainingsHelper.getAvailability(
        token,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(true);
    });

    it('should return 404 for non-existent training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const nonExistentId = '00000000-0000-0000-0000-000000000003';

      const response = await appHelper
        .getRequest()
        .get(`/trainings/${nonExistentId}/availability`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper
        .getRequest()
        .get('/trainings/123/availability');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /trainings/:id', () => {
    it('should update training title', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        title: 'Original Title',
      });
      const createResponse = await trainingsHelper.create(token, trainingData);

      const updateData = { title: 'Updated Title' };
      const response = await trainingsHelper.update(
        token,
        createResponse.body.id,
        updateData,
      );

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.id).toBe(createResponse.body.id);
    });

    it('should publish training.updated event', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId, {
        title: 'Original Title',
      });
      const createResponse = await trainingsHelper.create(token, trainingData);

      const updateData = { title: 'Updated Title' };
      await trainingsHelper.update(token, createResponse.body.id, updateData);

      expect(mockEventsPublisher.publishTrainingUpdated).toHaveBeenCalled();
    });

    it('should return 400 when updating cancelled training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const createResponse = await trainingsHelper.create(token, trainingData);

      await trainingsHelper.cancel(token, createResponse.body.id);

      const updateData = { title: 'Updated Title' };
      const response = await trainingsHelper.update(
        token,
        createResponse.body.id,
        updateData,
      );

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const nonExistentId = '00000000-0000-0000-0000-000000000004';
      const updateData = { title: 'Updated Title' };

      const response = await appHelper
        .getRequest()
        .patch(`/trainings/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper
        .getRequest()
        .patch('/trainings/123')
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /trainings/:id', () => {
    it('should cancel training (set status=cancelled)', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const createResponse = await trainingsHelper.create(token, trainingData);

      const response = await trainingsHelper.cancel(
        token,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);

      const getResponse = await trainingsHelper.findById(
        token,
        createResponse.body.id,
      );

      expect(getResponse.body.status).toBe('cancelled');
    });

    it('should publish training.cancelled event', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const createResponse = await trainingsHelper.create(token, trainingData);

      await trainingsHelper.cancel(token, createResponse.body.id);

      expect(mockEventsPublisher.publishTrainingCancelled).toHaveBeenCalled();
    });

    it('should return 400 when cancelling already cancelled training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const trainerData = createTrainerDto();
      const trainerRes = await trainersHelper.create(token, trainerData);
      const trainerId = trainerRes.body.id;

      const trainingData = createTrainingDto(trainerId);
      const createResponse = await trainingsHelper.create(token, trainingData);

      await trainingsHelper.cancel(token, createResponse.body.id);

      const response = await trainingsHelper.cancel(
        token,
        createResponse.body.id,
      );

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent training', async () => {
      const token = authHelper.generateAdminToken('test-user-id');
      const nonExistentId = '00000000-0000-0000-0000-000000000005';

      const response = await trainingsHelper.cancel(token, nonExistentId);

      expect(response.status).toBe(404);
    });

    it('should return 401 when no auth token', async () => {
      const response = await appHelper.getRequest().delete('/trainings/123');

      expect(response.status).toBe(401);
    });
  });
});
