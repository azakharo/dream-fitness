import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { createRegisterDto } from './fixtures/user.fixtures';
import { UserGender } from '@app/shared/enums';

describe('AuthController (e2e)', () => {
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

  describe('POST /auth/register', () => {
    it('should register a new user with minimal data', async () => {
      const response = await authHelper.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    });

    it('should register a user with all fields', async () => {
      const response = await authHelper.register({
        email: 'fulluser@example.com',
        password: 'password123',
        name: 'Full User',
        phone: '+79001234567',
        birthDate: '1990-01-01',
        gender: UserGender.MALE,
      });

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('fulluser@example.com');
      expect(response.body.user.name).toBe('Full User');
      expect(response.body.user.phone).toBe('+79001234567');
      expect(response.body.user.birthDate).toBe('1990-01-01T00:00:00.000Z');
      expect(response.body.user.gender).toBe(UserGender.MALE);
      expect(response.body.tokens).toBeDefined();
    });

    it('should throw 400 when email already exists', async () => {
      const userData = createRegisterDto();
      await authHelper.register(userData);

      const response = await authHelper.register(userData);

      expect(response.status).toBe(400);
      // It's expected
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(response.body.message).toContain('already exists');
    });

    it('should throw 400 when email is missing', async () => {
      // It's expected
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = await authHelper.register({
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when password is missing', async () => {
      // It's expected
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = await authHelper.register({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when email is invalid', async () => {
      const response = await authHelper.register({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when password is less than 8 characters', async () => {
      const response = await authHelper.register({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when name is less than 2 characters', async () => {
      const response = await authHelper.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'A',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when gender is invalid', async () => {
      const response = await authHelper.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        gender: 'INVALID' as UserGender,
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when birthDate is invalid', async () => {
      const response = await authHelper.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        birthDate: 'not-a-date',
      });

      expect(response.status).toBe(400);
    });

    it('should throw 400 when extra fields are provided', async () => {
      const response = await appHelper
        .getRequest()
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          extraField: 'should-be-ignored',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return tokens', async () => {
      const userData = createRegisterDto();
      await authHelper.register(userData);

      const response = await authHelper.login(
        userData.email,
        userData.password,
      );

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should throw 401 when email does not exist', async () => {
      const response = await authHelper.login(
        'nonexistent@example.com',
        'password123',
      );

      expect(response.status).toBe(401);
    });

    it('should throw 401 when password is wrong', async () => {
      const userData = createRegisterDto();
      await authHelper.register(userData);

      const response = await authHelper.login(userData.email, 'wrongpassword');

      expect(response.status).toBe(401);
    });

    it('should throw 400 when email is missing', async () => {
      const response = await authHelper.login('', 'password123');

      expect(response.status).toBe(400);
    });

    it('should throw 400 when password is missing', async () => {
      const response = await authHelper.login('test@example.com', '');

      expect(response.status).toBe(400);
    });

    it('should throw 400 when email format is invalid', async () => {
      const response = await authHelper.login('invalid-email', 'password123');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const userData = createRegisterDto();
      const loginResponse = await authHelper.login(
        userData.email,
        userData.password,
      );

      const response = await authHelper.refresh(
        loginResponse.body.refreshToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should throw 401 when refresh token is invalid', async () => {
      const response = await appHelper.getRequest().post('/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
    });

    it('should throw 401 when refresh token is expired', async () => {
      const response = await appHelper.getRequest().post('/auth/refresh').send({
        refreshToken: 'expired-token',
      });

      expect(response.status).toBe(401);
    });

    it('should throw 400 when request body is missing', async () => {
      const response = await appHelper
        .getRequest()
        .post('/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should throw 400 when refresh token is empty string', async () => {
      const response = await appHelper.getRequest().post('/auth/refresh').send({
        refreshToken: '',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid access token', async () => {
      const userData = createRegisterDto();
      const loginResponse = await authHelper.login(
        userData.email,
        userData.password,
      );

      const response = await authHelper.logout(loginResponse.body.accessToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should throw 401 when no access token is provided', async () => {
      const response = await appHelper
        .getRequest()
        .post('/auth/logout')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should throw 401 when access token is invalid', async () => {
      const response = await appHelper
        .getRequest()
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
