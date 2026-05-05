import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { TrainersHelper } from './helpers/trainers.helper';
import {
  createTrainerDto,
  NON_EXISTENT_ID,
} from './fixtures/training.fixtures';
import { CreateTrainerDto } from '../src/trainers/dto';

describe('TrainersController (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let trainersHelper: TrainersHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper();
    trainersHelper = new TrainersHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await dbHelper.truncateTables();
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
    jest.resetAllMocks();
  });

  describe('POST /trainers', () => {
    it('should create a new trainer with valid data (admin headers)', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto();

      const response = await trainersHelper.create(headers, trainerData);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(trainerData.name);
      expect(response.body.bio).toBe(trainerData.bio);
      expect(response.body.avatarUrl).toBe(trainerData.avatarUrl);
      expect(response.body.isActive).toBe(true);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const headers = authHelper.getAdminHeaders();
      const response = await trainersHelper.create(headers, {
        bio: 'test',
      } as CreateTrainerDto);

      expect(response.status).toBe(400);
    });

    it('should return 400 when name exceeds 255 chars', async () => {
      const headers = authHelper.getAdminHeaders();
      const response = await trainersHelper.create(headers, {
        name: 'a'.repeat(256),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when no auth headers', async () => {
      const response = await appHelper.getRequest().post('/trainers').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 when missing internal auth headers', async () => {
      const trainerData = createTrainerDto();
      const response = await appHelper
        .getRequest()
        .post('/trainers')
        .set('Authorization', 'Bearer some-token')
        .send(trainerData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /trainers', () => {
    it('should return list of active trainers', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData1 = createTrainerDto({ name: 'Trainer 1' });
      const trainerData2 = createTrainerDto({ name: 'Trainer 2' });

      await trainersHelper.create(headers, trainerData1);
      await trainersHelper.create(headers, trainerData2);

      const response = await trainersHelper.findAll(headers);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every((t) => t.isActive)).toBe(true);
    });

    it('should return only active trainers (exclude deactivated)', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData1 = createTrainerDto({ name: 'Active Trainer' });
      const trainerData2 = createTrainerDto({ name: 'Inactive Trainer' });

      await trainersHelper.create(headers, trainerData1);
      const createResponse2 = await trainersHelper.create(
        headers,
        trainerData2,
      );

      await trainersHelper.remove(headers, createResponse2.body.id);

      const response = await trainersHelper.findAll(headers);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Active Trainer');
    });

    it('should return empty array when no trainers exist', async () => {
      const headers = authHelper.getAdminHeaders();

      const response = await trainersHelper.findAll(headers);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 when no auth headers', async () => {
      const response = await appHelper.getRequest().get('/trainers');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /trainers/:id', () => {
    it('should return trainer by ID', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Test Trainer' });

      const createResponse = await trainersHelper.create(headers, trainerData);

      const response = await trainersHelper.findById(
        headers,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.name).toBe(trainerData.name);
      expect(response.body.bio).toBe(trainerData.bio);
      expect(response.body.avatarUrl).toBe(trainerData.avatarUrl);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 404 for non-existent trainer', async () => {
      const headers = authHelper.getAdminHeaders();

      const response = await trainersHelper.findById(headers, NON_EXISTENT_ID);

      expect(response.status).toBe(404);
    });

    it('should return 400 when no auth headers', async () => {
      const response = await appHelper.getRequest().get('/trainers/123');

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /trainers/:id', () => {
    it('should update trainer name', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'Original Name' });

      const createResponse = await trainersHelper.create(headers, trainerData);

      const updateData = { name: 'Updated Name' };
      const response = await trainersHelper.update(
        headers,
        createResponse.body.id,
        updateData,
      );

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.id).toBe(createResponse.body.id);
    });

    it('should update trainer bio', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ bio: 'Original bio' });

      const createResponse = await trainersHelper.create(headers, trainerData);

      const updateData = { bio: 'Updated bio' };
      const response = await trainersHelper.update(
        headers,
        createResponse.body.id,
        updateData,
      );

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe(updateData.bio);
    });

    it('should return 404 for non-existent trainer', async () => {
      const headers = authHelper.getAdminHeaders();
      const updateData = { name: 'Updated Name' };

      const response = await trainersHelper.update(
        headers,
        NON_EXISTENT_ID,
        updateData,
      );

      expect(response.status).toBe(404);
    });

    it('should return 400 when no auth headers', async () => {
      const response = await appHelper
        .getRequest()
        .patch('/trainers/123')
        .send({ name: 'Updated' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /trainers/:id', () => {
    it('should deactivate trainer (soft delete)', async () => {
      const headers = authHelper.getAdminHeaders();
      const trainerData = createTrainerDto({ name: 'To Be Deactivated' });

      const createResponse = await trainersHelper.create(headers, trainerData);

      const response = await trainersHelper.remove(
        headers,
        createResponse.body.id,
      );

      expect(response.status).toBe(200);

      const listResponse = await trainersHelper.findAll(headers);
      expect(listResponse.body.length).toBe(0);

      const detailResponse = await trainersHelper.findById(
        headers,
        createResponse.body.id,
      );
      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent trainer', async () => {
      const headers = authHelper.getAdminHeaders();

      const response = await trainersHelper.remove(headers, NON_EXISTENT_ID);

      expect(response.status).toBe(404);
    });

    it('should return 400 when no auth headers', async () => {
      const response = await appHelper.getRequest().delete('/trainers/123');

      expect(response.status).toBe(400);
    });
  });
});
