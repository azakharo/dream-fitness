import { request } from 'httpie';

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
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  const response = await request(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    data: { email, password },
  });

  const data = response.data as LoginResponse;
  return {
    token: data.accessToken,
    userId: data.user.id,
  };
}

async function createTrainer(name: string, token: string): Promise<string> {
  const response = await request(`${BASE_URL}/api/trainers`, {
    method: 'POST',
    data: { name },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data as TrainerResponse;
  return data.id;
}

async function createTraining(
  name: string,
  capacity: number,
  price: number,
  trainerId: string,
  token: string,
): Promise<string> {
  const response = await request(`${BASE_URL}/api/trainings`, {
    method: 'POST',
    data: {
      name,
      capacity,
      price,
      trainerId,
      description: `Test training: ${name}`,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data as TrainingResponse;
  return data.id;
}

async function depositBalance(
  userId: string,
  amount: number,
  token: string,
): Promise<number> {
  const response = await request(`${BASE_URL}/api/auth/balance/deposit`, {
    method: 'POST',
    data: { userId, amount },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data as DepositResponse;
  return data.balance;
}

export default async function globalSetup() {
  // Login as admin
  const admin = await login('admin@dreamfitness.com', 'admin123');
  process.env.ADMIN_TOKEN = admin.token;
  process.env.ADMIN_USER_ID = admin.userId;

  // Login as test user
  const testUser = await login('test@example.com', 'test12345');
  process.env.TEST_USER_TOKEN = testUser.token;
  process.env.TEST_USER_ID = testUser.userId;

  // Create a trainer
  const trainerId = await createTrainer('Test Trainer', admin.token);
  process.env.TRAINER_ID = trainerId;

  // Create Training 1: capacity=1, price=500
  const training1Id = await createTraining(
    'Test Training 1',
    1,
    500,
    trainerId,
    admin.token,
  );
  process.env.TRAINING_1_ID = training1Id;

  // Create Training 2: capacity=10, price=300
  const training2Id = await createTraining(
    'Test Training 2',
    10,
    300,
    trainerId,
    admin.token,
  );
  process.env.TRAINING_2_ID = training2Id;

  // Deposit balance 5000 to test user
  await depositBalance(testUser.userId, 5000, admin.token);
  process.env.TEST_USER_BALANCE = '5000';

  console.log('Global setup completed successfully');
}
