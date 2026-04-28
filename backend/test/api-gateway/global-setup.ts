import type { APIRequestContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

interface TrainerResponse {
  id: string;
}

interface TrainingResponse {
  id: string;
}

interface DepositResponse {
  balance: number;
}

async function login(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: { email, password },
  });

  const data = (await response.json()) as LoginResponse;
  return {
    token: data.accessToken,
    userId: data.user.id,
  };
}

async function createTrainer(
  request: APIRequestContext,
  name: string,
  token: string,
): Promise<string> {
  const response = await request.post(`${BASE_URL}/api/trainers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { name },
  });

  const data = (await response.json()) as TrainerResponse;
  return data.id;
}

async function createTraining(
  request: APIRequestContext,
  name: string,
  capacity: number,
  price: number,
  trainerId: string,
  token: string,
): Promise<string> {
  const response = await request.post(`${BASE_URL}/api/trainings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name,
      capacity,
      price,
      trainerId,
      description: `Test training: ${name}`,
    },
  });

  const data = (await response.json()) as TrainingResponse;
  return data.id;
}

async function depositBalance(
  request: APIRequestContext,
  userId: string,
  amount: number,
  adminToken: string,
): Promise<number> {
  const response = await request.post(`${BASE_URL}/api/auth/balance/deposit`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    data: { userId, amount },
  });

  const data = (await response.json()) as DepositResponse;
  return data.balance;
}

export default async function globalSetup() {
  // Dynamic import of playwright to avoid issues in global setup
  const pw = await import('playwright');
  const playwright = pw.default;

  const request: APIRequestContext = await playwright.request.newContext({
    baseURL: BASE_URL,
  });

  // Login as admin
  const admin = await login(request, 'admin@dreamfitness.com', 'admin123');
  process.env.ADMIN_TOKEN = admin.token;
  process.env.ADMIN_USER_ID = admin.userId;

  // Login as test user
  const testUser = await login(request, 'test@example.com', 'test12345');
  process.env.TEST_USER_TOKEN = testUser.token;
  process.env.TEST_USER_ID = testUser.userId;

  // Create a trainer
  const trainerId = await createTrainer(request, 'Test Trainer', admin.token);
  process.env.TRAINER_ID = trainerId;

  // Create Training 1: capacity=1, price=500
  const training1Id = await createTraining(
    request,
    'Test Training 1',
    1,
    500,
    trainerId,
    admin.token,
  );
  process.env.TRAINING_ID_1 = training1Id;

  // Create Training 2: capacity=10, price=300
  const training2Id = await createTraining(
    request,
    'Test Training 2',
    10,
    300,
    trainerId,
    admin.token,
  );
  process.env.TRAINING_ID_2 = training2Id;

  // Deposit balance 5000 to test user (admin does this)
  await depositBalance(request, testUser.userId, 5000, admin.token);
  process.env.TEST_USER_BALANCE = '5000';

  // Clean up
  await request.dispose();

  console.log('Global setup completed successfully');
}
