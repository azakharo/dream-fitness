import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MockEventsModule } from './mocks/events.module.mock';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { createRegisterDto } from './fixtures/user.fixtures';
import { UserGender } from '@app/shared/enums';

describe('UsersController (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
  });

  describe('GET /auth/me', () => {
    it('should return user profile with valid token', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await appHelper.getRequest().get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with expired token', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await appHelper
        .getRequest()
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token format', async () => {
      const response = await appHelper
        .getRequest()
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /auth/me', () => {
    it('should update name successfully', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe(userData.email);
    });

    it('should update phone successfully', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ phone: '+79001234567' });

      expect(response.status).toBe(200);
      expect(response.body.phone).toBe('+79001234567');
    });

    it('should update all fields at once', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Full Name',
          phone: '+79001234567',
          birthDate: '1990-01-01',
          gender: UserGender.MALE,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Full Name');
      expect(response.body.phone).toBe('+79001234567');
      expect(response.body.birthDate).toBeInstanceOf(Date);
      expect(response.body.gender).toBe(UserGender.MALE);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('should return 400 when gender is invalid', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ gender: 'INVALID' as any });

      expect(response.status).toBe(400);
    });

    it('should return 400 when birthDate is invalid', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ birthDate: 'not-a-date' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when extra fields are provided', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          extraField: 'should-be-ignored',
        });

      expect(response.status).toBe(400);
    });

    it('should return 200 with empty body (data unchanged)', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .patch('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
    });
  });

  describe('GET /auth/balance', () => {
    it('should return user balance with valid token', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .get('/auth/balance')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.balance).toBe(0);
      expect(response.body.userId).toBeDefined();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await appHelper.getRequest().get('/auth/balance');

      expect(response.status).toBe(401);
    });

    it('should return balance 0 for new user', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLogin(userData);

      const response = await appHelper
        .getRequest()
        .get('/auth/balance')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.balance).toBe(0);
    });
  });
});
