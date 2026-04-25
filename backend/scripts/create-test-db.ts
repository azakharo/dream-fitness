import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load .env.test variables
dotenv.config({ path: '.env.test' });

async function createTestDb() {
  // Connect to default 'postgres' DB to create our test DB
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres', // Connect to default DB
  });

  await dataSource.initialize();

  try {
    const result = await dataSource.query<string[]>(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DATABASE_NAME}'`,
    );

    if (result.length === 0) {
      await dataSource.query(`CREATE DATABASE "${process.env.DATABASE_NAME}"`);
      console.log(`✅ Test database "${process.env.DATABASE_NAME}" created`);
    } else {
      console.log(
        `ℹ️ Test database "${process.env.DATABASE_NAME}" already exists`,
      );
    }
  } finally {
    await dataSource.destroy();
  }
}

void createTestDb();
