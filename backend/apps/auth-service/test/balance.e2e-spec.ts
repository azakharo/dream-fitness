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
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = createRegisterDto();
      const auth = await authHelper.registerAndLoginFlat(userData);
      accessToken = auth.accessToken;
      userId = auth.userId;
    });

    it('should increase balance after deposit', async () => {
      const depositResp = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 500 }),
      );
      expect(depositResp.status).toBe(200);
      expect(depositResp.body.type).toBe('deposit');
      expect(depositResp.body.amount).toBe(500);

      const balanceResp = await balanceHelper.getBalance(accessToken);

      expect(balanceResp.status).toBe(200);
      expect(balanceResp.body.balance).toBe(500);
    });

    it('should return 400 when amount exceeds maximum', async () => {
      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 10001 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when amount is negative', async () => {
      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: -100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when userId is not a valid UUID', async () => {
      const response = await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId: 'invalid-uuid', amount: 500 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when request body is missing', async () => {
      // Expected
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const response = await balanceHelper.deposit(accessToken, undefined);

      expect(response.status).toBe(400);
    });

    describe('authentication errors', () => {
      it('should return 401 when invalid token is provided', async () => {
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
  });

  describe('POST /auth/balance/reserve', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = createRegisterDto();
      const auth = await authHelper.registerAndLoginFlat(userData);
      accessToken = auth.accessToken;
      userId = auth.userId;
    });

    it('should decrease balance after reserve', async () => {
      const depositResp = await balanceHelper.deposit(
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
      expect(depositResp.status).toBe(200);
      expect(depositResp.body.type).toBe('reserve');
      expect(depositResp.body.amount).toBe(100);

      const balanceResp = await balanceHelper.getBalance(accessToken);

      expect(balanceResp.status).toBe(200);
      expect(balanceResp.body.balance).toBe(900);
    });

    it('should return 400 when balance is not specified', async () => {
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

    it('should return 400 when bookingId is missing', async () => {
      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({ userId, amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    it('should return 400 when bookingId is not a valid UUID', async () => {
      const response = await balanceHelper.reserve(
        accessToken,
        createReserveDto({ userId, bookingId: 'invalid-uuid', amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    describe('authentication errors', () => {
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
  });

  describe('POST /auth/balance/release', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = createRegisterDto();
      const auth = await authHelper.registerAndLoginFlat(userData);
      accessToken = auth.accessToken;
      userId = auth.userId;
    });

    it('should increase balance after release', async () => {
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

      const releaseResp = await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );
      expect(releaseResp.status).toBe(200);
      expect(releaseResp.body.type).toBe('release');
      expect(releaseResp.body.amount).toBe(100);

      const balanceResp = await balanceHelper.getBalance(accessToken);

      expect(balanceResp.status).toBe(200);
      expect(balanceResp.body.balance).toBe(1000);
    });

    it('should return 404 when release is for non-existent reserve', async () => {
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
      const response = await balanceHelper.release(
        accessToken,
        createReleaseDto({ userId, bookingId: 'invalid-uuid', amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    describe('authentication errors', () => {
      it('should return 401 when auth token is invalid', async () => {
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
  });

  describe('POST /auth/balance/refund', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = createRegisterDto();
      const auth = await authHelper.registerAndLoginFlat(userData);
      accessToken = auth.accessToken;
      userId = auth.userId;
    });

    it('should increase balance after refund', async () => {
      await balanceHelper.deposit(
        accessToken,
        createDepositDto({ userId, amount: 1000 }),
      );

      const refundResp = await balanceHelper.refund(
        accessToken,
        createRefundDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );
      expect(refundResp.status).toBe(200);
      expect(refundResp.body.type).toBe('refund');
      expect(refundResp.body.amount).toBe(100);

      const balanceResp = await balanceHelper.getBalance(accessToken);

      expect(balanceResp.status).toBe(200);
      expect(balanceResp.body.balance).toBe(1100);
    });

    it('should return 400 when refund amount is 0', async () => {
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
      const response = await balanceHelper.refund(
        accessToken,
        createRefundDto({ userId, amount: 100 }),
      );

      expect(response.status).toBe(400);
    });

    describe('authentication errors', () => {
      it('should return 401 when no token is invalid', async () => {
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
  });

  describe('GET /auth/transactions', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = createRegisterDto();
      const auth = await authHelper.registerAndLoginFlat(userData);
      accessToken = auth.accessToken;
      userId = auth.userId;
    });

    it('should return empty history for new user', async () => {
      const response = await balanceHelper.getTransactions(accessToken);

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return history containing deposit transaction', async () => {
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
      expect(response.body.total).toBe(2);
    });

    describe('authentication errors', () => {
      it('should return 401 when no token is provided', async () => {
        const response = await balanceHelper.getTransactions('invalid-token');

        expect(response.status).toBe(401);
      });
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

      const balanceResp1 = await balanceHelper.getBalance(accessToken);

      expect(balanceResp1.status).toBe(200);
      expect(balanceResp1.body.balance).toBe(1000);

      const reservResp = await balanceHelper.reserve(
        accessToken,
        createReserveDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(reservResp.status).toBe(200);
      expect(reservResp.body.type).toBe('reserve');
      expect(reservResp.body.amount).toBe(100);

      const balanceResp2 = await balanceHelper.getBalance(accessToken);

      expect(balanceResp2.status).toBe(200);
      expect(balanceResp2.body.balance).toBe(900);

      const releaseResp = await balanceHelper.release(
        accessToken,
        createReleaseDto({
          userId,
          bookingId: '00000000-0000-0000-0000-000000000001',
          amount: 100,
        }),
      );

      expect(releaseResp.status).toBe(200);
      expect(releaseResp.body.type).toBe('release');
      expect(releaseResp.body.amount).toBe(100);

      const balanceResp3 = await balanceHelper.getBalance(accessToken);

      expect(balanceResp3.status).toBe(200);
      expect(balanceResp3.body.balance).toBe(1000);

      const transactionsResponse =
        await balanceHelper.getTransactions(accessToken);

      expect(transactionsResponse.status).toBe(200);
      expect(transactionsResponse.body.items.length).toBeGreaterThanOrEqual(3);
    });
  });
});
