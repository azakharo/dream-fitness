import { DataSource } from 'typeorm';
import { TEST_USERS, TEST_TRAINING } from '../fixtures/booking.fixtures';

export class DbHelper {
  constructor(private dataSource: DataSource) {}

  async truncateTables(): Promise<void> {
    await this.dataSource.query(`
      TRUNCATE TABLE bookings, waitlist, trainings, users, trainers CASCADE;
    `);
  }

  async seedTestData(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Seed trainer
      await manager.query(
        `INSERT INTO trainers (id, name, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (id) DO NOTHING`,
        [TEST_TRAINING.trainerId, 'Test Trainer'],
      );

      // Seed training
      await manager.query(
        `INSERT INTO trainings (id, trainer_id, title, type, scheduled_at, duration_minutes, capacity, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          TEST_TRAINING.id,
          TEST_TRAINING.trainerId,
          TEST_TRAINING.title,
          TEST_TRAINING.type,
          TEST_TRAINING.scheduledAt,
          TEST_TRAINING.durationMinutes,
          TEST_TRAINING.capacity,
          TEST_TRAINING.price,
        ],
      );

      // Seed users
      for (const user of Object.values(TEST_USERS)) {
        await manager.query(
          `INSERT INTO users (id, email, password_hash, name, role, balance, status)
           VALUES ($1, $2, $3, $4, 'client', 0, 'active')
           ON CONFLICT (id) DO NOTHING`,
          [user.id, user.email, 'hash', 'Test User'],
        );
      }
    });
  }
}
