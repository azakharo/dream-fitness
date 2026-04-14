import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingDescriptionAndStatus1744032000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create training_status_enum
    await queryRunner.query(`
      CREATE TYPE training_status_enum AS ENUM ('scheduled', 'cancelled', 'completed');
    `);

    // Add status column to trainings table
    await queryRunner.query(`
      ALTER TABLE trainings
      ADD COLUMN status training_status_enum DEFAULT 'scheduled';
    `);

    // Create trigger to update updated_at on UPDATE
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for trainings table
    await queryRunner.query(`
      CREATE TRIGGER update_trainings_updated_at
      BEFORE UPDATE ON trainings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for trainers table
    await queryRunner.query(`
      CREATE TRIGGER update_trainers_updated_at
      BEFORE UPDATE ON trainers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_trainers_updated_at ON trainers;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
    `);

    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop status column
    await queryRunner.query(`
      ALTER TABLE trainings DROP COLUMN status;
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS training_status_enum;
    `);
  }
}
