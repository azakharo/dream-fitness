import { AppTestHelper } from './helpers/app-test.helper';
import { DbHelper } from './helpers/db.helper';
import { AuthHelper } from './helpers/auth.helper';
import { BalanceHelper } from './helpers/balance.helper';
import {
  createRegisterDto,
  createDepositDto,
  createReserveDto,
  createReleaseDto,
  createRefundDto,
} from './fixtures/user.fixtures';

describe('BalanceController (e2e)', () => {
  let appHelper: AppTestHelper;
  let dbHelper: DbHelper;
  let authHelper: AuthHelper;
  let balanceHelper: BalanceHelper;

  beforeAll(async () => {
    appHelper = new AppTestHelper();
    await appHelper.init();
    dbHelper = new DbHelper(appHelper.getDataSource());
    authHelper = new AuthHelper(appHelper.getRequest());
    balanceHelper = new BalanceHelper(appHelper.getRequest());
  });

  afterAll(async () => {
    await appHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.truncateTables();
  });

  describe('POST /auth/balance/deposit', () => {
    it('should deposit funds successfully', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('deposit');
      expect(response.body.amount).toBe(500);
    });

    it('should increase balance after deposit', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );

      const balanceResponse = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body.balance).toBe(500);
    });

    it('should accept minimum deposit amount of 1', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1 }),
      );

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(1);
    });

    it('should accept maximum deposit amount of 10000', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 10000 }),
      );

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(10000);
    });

    it('should return 400 when amount is 0', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 0 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when amount exceeds maximum', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 10001 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when amount is negative', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: -100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when userId is not a valid UUID', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId: 'invalid-uuid', amount: 500 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when request body is missing', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({
          userId: '00000000-0000-0000-0000-000000000000',
          amount: 500,
        }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await balanceHelper.deposit(
        'invalid-token',
        createDepositDto({
          userId: '00000000-0000-0000-0000-000000000000',
          amount: 500,
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/balance/reserve', () => {
    it('should reserve funds successfully with sufficient balance', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('reserve');
      expect(response.body.amount).toBe(100);
    });

    it('should decrease balance after reserve', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      const balanceResponse = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body.balance).toBe(900);
    });

    it('should return 400 when balance is insufficient', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient balance');
    });

    it('should return 400 when reserve amount exceeds balance', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 100 }),
      );

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 200,
        }),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient balance');
    });

    it('should return 400 when reserve amount is 0', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 0,
        }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when bookingId is missing', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({ userId, amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when bookingId is not a valid UUID', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({ userId, bookingId: 'invalid-uuid', amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await balanceHelper.reserve(
        'invalid-token',
        createReserveDto({
          userId: '00000000-0000-0000-0000-000000000000',
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/balance/release', () => {
    it('should release reserved funds successfully', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      const response = await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('release');
      expect(response.body.amount).toBe(100);
    });

    it('should increase balance after release', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      const balanceResponse = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body.balance).toBe(1000);
    });

    it('should return 404 when release is for non-existent reserve', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(404);
    });

    it('should return 400 when bookingId is not a valid UUID', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.release(
        accessToken,
        createReleaseDto({ userId, bookingId: 'invalid-uuid', amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await balanceHelper.release(
        'invalid-token',
        createReleaseDto({
          userId: '00000000-0000-0000-0000-000000000000',
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/balance/refund', () => {
    it('should refund funds successfully', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      const response = await balanceHelper.refund(
        accessToken,
        createRefundDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('refund');
      expect(response.body.amount).toBe(100);
    });

    it('should increase balance after refund', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      await balanceHelper.refund(
        accessToken,
        createRefundDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      const balanceResponse = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body.balance).toBe(1100);
    });

    it('should return 400 when refund amount is 0', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.refund(
        accessToken,
        createRefundDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 0,
        }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when bookingId is missing', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.refund(
        accessToken,
        createRefundDto({ userId, amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await balanceHelper.refund(
        'invalid-token',
        createRefundDto({
          userId: '00000000-0000-0000-0000-000000000000',
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/transactions', () => {
    it('should return empty history for new user', async () => {
      const userData = createRegisterDto();
      const { accessToken } = await authHelper.registerAndLoginFlat(userData);

      const response = await balanceHelper.getTransactions(accessToken);

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return history containing deposit transaction', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );

      const response = await balanceHelper.getTransactions(accessToken);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].type).toBe('deposit');
      expect(response.body.items[0].amount).toBe(500);
    });

    it('should return multiple transactions', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 300 }),
      );

      const response = await balanceHelper.getTransactions(accessToken);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.total).toBe(2);
    });

    it('should support pagination', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );

      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 300 }),
      );

      const response = await balanceHelper.getTransactions(accessToken, {
        page: 1,
        limit: 1,
      });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await balanceHelper.getTransactions('invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Full flow test', () => {
    it('should complete full balance flow: deposit → reserve → release', async () => {
      const userData = createRegisterDto();
      const { accessToken, userId } =
        await authHelper.registerAndLoginFlat(userData);

      expect(accessToken).toBeDefined();
      expect(userId).toBeDefined();

      const response1 = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      expect(response1.status).toBe(200);
      expect(response1.body.type).toBe('deposit');
      expect(response1.body.amount).toBe(1000);

      const balanceResponse1 = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse1.status).toBe(200);
      expect(balanceResponse1.body.balance).toBe(1000);

      const response2 = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response2.status).toBe(200);
      expect(response2.body.type).toBe('reserve');
      expect(response2.body.amount).toBe(100);

      const balanceResponse2 = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse2.status).toBe(200);
      expect(balanceResponse2.body.balance).toBe(900);

      const response3 = await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(response3.status).toBe(200);
      expect(response3.body.type).toBe('release');
      expect(response3.body.amount).toBe(100);

      const balanceResponse3 = await balanceHelper.getBalance(accessToken);

      expect(balanceResponse3.status).toBe(200);
      expect(balanceResponse3.body.balance).toBe(1000);

      const transactionsResponse =
        await balanceHelper.getTransactions(accessToken);

      expect(transactionsResponse.status).toBe(200);
      expect(transactionsResponse.body.items.length).toBeGreaterThanOrEqual(3);
    });
  });
});
