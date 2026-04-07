import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1744032000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('client', 'admin');
      CREATE TYPE user_status_enum AS ENUM ('active', 'blocked');
      CREATE TYPE user_gender_enum AS ENUM ('male', 'female');
      CREATE TYPE training_type_enum AS ENUM ('yoga', 'pilates', 'crossfit', 'boxing', 'strength', 'cardio', 'dance', 'stretching');
      CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'cancelled');
      CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdraw', 'refund');
      CREATE TYPE notification_type_enum AS ENUM ('booking', 'cancellation', 'transaction', 'reminder');
    `);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'birth_date', type: 'date', isNullable: true },
          { name: 'gender', type: 'user_gender_enum', isNullable: true },
          { name: 'role', type: 'user_role_enum', default: "'client'" },
          { name: 'balance', type: 'integer', default: 0 },
          { name: 'status', type: 'user_status_enum', default: "'active'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create trainers table
    await queryRunner.createTable(
      new Table({
        name: 'trainers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'avatar_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create trainings table
    await queryRunner.createTable(
      new Table({
        name: 'trainings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'trainer_id', type: 'uuid' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'type', type: 'training_type_enum' },
          { name: 'scheduled_at', type: 'timestamp' },
          { name: 'duration_minutes', type: 'integer' },
          { name: 'capacity', type: 'integer' },
          { name: 'price', type: 'integer' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create bookings table
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'training_id', type: 'uuid' },
          { name: 'status', type: 'booking_status_enum', default: "'confirmed'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create waitlist table
    await queryRunner.createTable(
      new Table({
        name: 'waitlist',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'training_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create transactions table
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'amount', type: 'integer' },
          { name: 'type', type: 'transaction_type_enum' },
          { name: 'reference_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create notifications table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'notification_type_enum' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'message', type: 'text' },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'trainings',
      new TableForeignKey({
        name: 'FK_trainings_trainer_id',
        columnNames: ['trainer_id'],
        referencedTableName: 'trainers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        name: 'FK_bookings_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        name: 'FK_bookings_training_id',
        columnNames: ['training_id'],
        referencedTableName: 'trainings',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'waitlist',
      new TableForeignKey({
        name: 'FK_waitlist_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'waitlist',
      new TableForeignKey({
        name: 'FK_waitlist_training_id',
        columnNames: ['training_id'],
        referencedTableName: 'trainings',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'FK_transactions_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notifications_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex('users', new TableIndex({ name: 'IDX_users_email', columnNames: ['email'] }));
    await queryRunner.createIndex('trainings', new TableIndex({ name: 'IDX_trainings_trainer_id', columnNames: ['trainer_id'] }));
    await queryRunner.createIndex('trainings', new TableIndex({ name: 'IDX_trainings_scheduled_at', columnNames: ['scheduled_at'] }));
    await queryRunner.createIndex('trainings', new TableIndex({ name: 'IDX_trainings_type', columnNames: ['type'] }));
    await queryRunner.createIndex('bookings', new TableIndex({ name: 'IDX_bookings_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('bookings', new TableIndex({ name: 'IDX_bookings_training_id', columnNames: ['training_id'] }));
    await queryRunner.createIndex('bookings', new TableIndex({ name: 'IDX_bookings_status', columnNames: ['status'] }));
    await queryRunner.createIndex('waitlist', new TableIndex({ name: 'IDX_waitlist_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('waitlist', new TableIndex({ name: 'IDX_waitlist_training_id', columnNames: ['training_id'] }));
    await queryRunner.createIndex('transactions', new TableIndex({ name: 'IDX_transactions_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('transactions', new TableIndex({ name: 'IDX_transactions_created_at', columnNames: ['created_at'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ name: 'IDX_notifications_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ name: 'IDX_notifications_is_read', columnNames: ['is_read'] }));

    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('notifications', 'IDX_notifications_is_read');
    await queryRunner.dropIndex('notifications', 'IDX_notifications_user_id');
    await queryRunner.dropIndex('transactions', 'IDX_transactions_created_at');
    await queryRunner.dropIndex('transactions', 'IDX_transactions_user_id');
    await queryRunner.dropIndex('waitlist', 'IDX_waitlist_training_id');
    await queryRunner.dropIndex('waitlist', 'IDX_waitlist_user_id');
    await queryRunner.dropIndex('bookings', 'IDX_bookings_status');
    await queryRunner.dropIndex('bookings', 'IDX_bookings_training_id');
    await queryRunner.dropIndex('bookings', 'IDX_bookings_user_id');
    await queryRunner.dropIndex('trainings', 'IDX_trainings_type');
    await queryRunner.dropIndex('trainings', 'IDX_trainings_scheduled_at');
    await queryRunner.dropIndex('trainings', 'IDX_trainings_trainer_id');
    await queryRunner.dropIndex('users', 'IDX_users_email');

    // Drop foreign keys
    await queryRunner.dropForeignKey('notifications', 'FK_notifications_user_id');
    await queryRunner.dropForeignKey('transactions', 'FK_transactions_user_id');
    await queryRunner.dropForeignKey('waitlist', 'FK_waitlist_training_id');
    await queryRunner.dropForeignKey('waitlist', 'FK_waitlist_user_id');
    await queryRunner.dropForeignKey('bookings', 'FK_bookings_training_id');
    await queryRunner.dropForeignKey('bookings', 'FK_bookings_user_id');
    await queryRunner.dropForeignKey('trainings', 'FK_trainings_trainer_id');

    // Drop tables
    await queryRunner.dropTable('notifications');
    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('waitlist');
    await queryRunner.dropTable('bookings');
    await queryRunner.dropTable('trainings');
    await queryRunner.dropTable('trainers');
    await queryRunner.dropTable('users');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS notification_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS booking_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS training_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_gender_enum`);
  }
}
