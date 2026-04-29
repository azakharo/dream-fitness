import { Pool } from 'pg';

/**
 * Global teardown for API Gateway Playwright tests.
 * Cleans up test data by truncating tables created during tests.
 */

async function cleanupDatabase(): Promise<void> {
  const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'dreamfitness',
    password: process.env.DATABASE_PASSWORD || 'dreamfitness123',
    database: process.env.DATABASE_NAME || 'dreamfitness_test',
  });

  const client = await pool.connect();

  try {
    // Truncate all test tables in correct order
    // Using CASCADE to handle the RESTRICT constraint from trainings -> trainers
    // RESTART IDENTITY to reset auto-increment sequences
    await client.query(`
      TRUNCATE TABLE
        bookings,
        notifications,
        waitlist,
        trainings,
        trainers,
        transactions
      RESTART IDENTITY CASCADE
    `);

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Database cleanup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export default async function globalTeardown() {
  // Clean up database
  await cleanupDatabase();

  // Clear all test data environment variables
  const testDataIds = [
    'ADMIN_TOKEN',
    'ADMIN_USER_ID',
    'TEST_USER_TOKEN',
    'TEST_USER_ID',
    'TRAINER_ID',
    'TRAINING_ID_1',
    'TRAINING_ID_2',
    'TEST_USER_BALANCE',
  ];

  testDataIds.forEach((key) => {
    delete process.env[key];
  });

  console.log('Global teardown completed successfully');
}
