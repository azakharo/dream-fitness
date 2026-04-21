import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationsTable1744032100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old enum type if it exists
    await queryRunner.query(`
      DROP TYPE IF EXISTS notification_type_enum_old;
    `);

    // Rename the existing enum to a temporary name
    await queryRunner.query(`
      ALTER TYPE notification_type_enum RENAME TO notification_type_enum_old;
    `);

    // Create the new enum type with correct values
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'booking_confirmation',
        'booking_cancellation',
        'balance_change',
        'training_reminder',
        'waitlist_joined',
        'waitlist_promoted'
      );
    `);

    // Rename message column to content (text type, no cast needed)
    await queryRunner.query(`
      ALTER TABLE notifications
      ALTER COLUMN message TYPE text,
      ALTER COLUMN message DROP NOT NULL,
      ALTER COLUMN message SET DEFAULT NULL;
    `);

    // Drop the old column and add new one with correct name
    // First, add the new content column with default
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD COLUMN content text;
    `);

    // Copy data from message to content
    await queryRunner.query(`
      UPDATE notifications
      SET content = message;
    `);

    // Drop the old message column
    await queryRunner.query(`
      ALTER TABLE notifications
      DROP COLUMN message;
    `);

    // Now change the type column using a temp column approach
    // Add temporary column for new enum
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD COLUMN type_new notification_type_enum;
    `);

    // Map old enum values to new enum values and update
    await queryRunner.query(`
      UPDATE notifications
      SET type_new = CASE
        WHEN type::text = 'booking' THEN 'booking_confirmation'::notification_type_enum
        WHEN type::text = 'cancellation' THEN 'booking_cancellation'::notification_type_enum
        WHEN type::text = 'transaction' THEN 'balance_change'::notification_type_enum
        WHEN type::text = 'reminder' THEN 'training_reminder'::notification_type_enum
        ELSE NULL
      END;
    `);

    // Drop old type column and rename new one
    await queryRunner.query(`
      ALTER TABLE notifications
      DROP COLUMN type;
    `);

    await queryRunner.query(`
      ALTER TABLE notifications
      RENAME COLUMN type_new TO type;
    `);

    // Make type column NOT NULL
    await queryRunner.query(`
      ALTER TABLE notifications
      ALTER COLUMN type SET NOT NULL;
    `);

    // Make content column NOT NULL with empty string as default
    await queryRunner.query(`
      ALTER TABLE notifications
      ALTER COLUMN content SET NOT NULL;
    `);

    // Add default empty string for existing NULL content
    await queryRunner.query(`
      UPDATE notifications
      SET content = ''
      WHERE content IS NULL;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE notification_type_enum_old;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create the old enum type
    await queryRunner.query(`
      CREATE TYPE notification_type_enum_old AS ENUM (
        'booking',
        'cancellation',
        'transaction',
        'reminder'
      );
    `);

    // Rename current enum to backup
    await queryRunner.query(`
      ALTER TYPE notification_type_enum RENAME TO notification_type_enum_new;
    `);

    // Recreate old enum
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'booking',
        'cancellation',
        'transaction',
        'reminder'
      );
    `);

    // Add temp column for old enum
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD COLUMN type_old notification_type_enum_old;
    `);

    // Map new enum values to old enum values
    await queryRunner.query(`
      UPDATE notifications
      SET type_old = CASE
        WHEN type::text = 'booking_confirmation' THEN 'booking'::notification_type_enum_old
        WHEN type::text = 'booking_cancellation' THEN 'cancellation'::notification_type_enum_old
        WHEN type::text = 'balance_change' THEN 'transaction'::notification_type_enum_old
        WHEN type::text = 'training_reminder' THEN 'reminder'::notification_type_enum_old
        WHEN type::text = 'waitlist_joined' THEN 'reminder'::notification_type_enum_old
        WHEN type::text = 'waitlist_promoted' THEN 'reminder'::notification_type_enum_old
        ELSE NULL
      END;
    `);

    // Drop new type column and rename old one
    await queryRunner.query(`
      ALTER TABLE notifications
      DROP COLUMN type;
    `);

    await queryRunner.query(`
      ALTER TABLE notifications
      RENAME COLUMN type_old TO type;
    `);

    // Rename content back to message
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD COLUMN message text;
    `);

    await queryRunner.query(`
      UPDATE notifications
      SET message = content;
    `);

    await queryRunner.query(`
      ALTER TABLE notifications
      DROP COLUMN content;
    `);

    // Drop backup enum
    await queryRunner.query(`
      DROP TYPE notification_type_enum_new;
    `);

    // Drop old enum (we'll recreate it clean)
    await queryRunner.query(`
      DROP TYPE notification_type_enum_old;
    `);
  }
}
