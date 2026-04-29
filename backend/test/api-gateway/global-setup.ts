import type { APIRequestContext } from '@playwright/test';
import {
  LoginResponseBody,
  UserDto,
  TrainerResponseDto,
  TrainingResponseDto,
} from '@app/contracts';
import { TEST_CONFIG } from './test-config';

interface DepositResponse {
  balance: number;
}

async function login(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const response = await request.post(`${TEST_CONFIG.baseURL}/api/auth/login`, {
    data: { email, password },
  });

  const data = (await response.json()) as LoginResponseBody;

  // Get user ID from /api/auth/me endpoint
  const meResponse = await request.get(`${TEST_CONFIG.baseURL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  const userData = (await meResponse.json()) as UserDto;

  return {
    token: data.accessToken,
    userId: userData.id,
  };
}

async function createTrainer(
  request: APIRequestContext,
  name: string,
  token: string,
): Promise<string> {
  const response = await request.post(`${TEST_CONFIG.baseURL}/api/trainers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { name },
  });

  const data = (await response.json()) as TrainerResponseDto;
  return data.id;
}

async function createTraining(
  request: APIRequestContext,
  title: string,
  capacity: number,
  price: number,
  trainerId: string,
  scheduledAt: Date,
  token: string,
): Promise<string> {
  const response = await request.post(`${TEST_CONFIG.baseURL}/api/trainings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      title,
      type: 'yoga',
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: 60,
      capacity,
      price,
      trainerId,
      description: `Test training: ${title}`,
    },
  });

  const data = (await response.json()) as TrainingResponseDto;
  return data.id;
}

async function depositBalance(
  request: APIRequestContext,
  userId: string,
  amount: number,
  adminToken: string,
): Promise<number> {
  const response = await request.post(
    `${TEST_CONFIG.baseURL}/api/auth/balance/deposit`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      data: { userId, amount },
    },
  );

  const data = (await response.json()) as DepositResponse;
  return data.balance;
}

export default async function globalSetup() {
  // Dynamic import of playwright to avoid issues in global setup
  const pw = await import('playwright');
  const playwright = pw.default;

  const request: APIRequestContext = await playwright.request.newContext({
    baseURL: TEST_CONFIG.baseURL,
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
  // Schedule training for tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const training1Id = await createTraining(
    request,
    'Test Training 1',
    1,
    500,
    trainerId,
    tomorrow,
    admin.token,
  );
  process.env.TRAINING_ID_1 = training1Id;

  // Create Training 2: capacity=10, price=300, different type
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(tomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);
  const training2Id = await createTraining(
    request,
    'Test Training 2',
    10,
    300,
    trainerId,
    dayAfterTomorrow,
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
