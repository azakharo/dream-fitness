import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePaymentsTable1744032200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'AUTHORIZED', 'CONFIRMED', 'CANCELED', 'REJECTED')
    `);

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'amount', type: 'integer' },
          {
            name: 'status',
            type: 'payment_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'tinkoff_payment_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tinkoff_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_payments_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('payments', 'IDX_payments_created_at');
    await queryRunner.dropIndex('payments', 'IDX_payments_status');
    await queryRunner.dropIndex('payments', 'IDX_payments_user_id');

    // Drop foreign key
    await queryRunner.dropForeignKey('payments', 'FK_payments_user_id');

    // Drop table
    await queryRunner.dropTable('payments');

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
  }
}
