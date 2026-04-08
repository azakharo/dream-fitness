import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTable1745035600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for transaction_type
    await queryRunner.query(`
      CREATE TYPE transaction_type_enum AS ENUM (
        'deposit',
        'withdraw',
        'refund',
        'reserve',
        'release'
      )
    `);

    // Create transactions table
    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL,
        type transaction_type_enum NOT NULL,
        amount INTEGER NOT NULL,
        booking_id UUID NULL,
        description VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT transactions_booking_id_fkey FOREIGN KEY (booking_id)
          REFERENCES bookings (id) ON DELETE SET NULL,
        CONSTRAINT transactions_amount_check CHECK (amount > 0)
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX transactions_user_id_index ON transactions (user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX transactions_booking_id_index ON transactions (booking_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX transactions_created_at_index ON transactions (created_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE transactions`);
    await queryRunner.query(`DROP TYPE transaction_type_enum`);
  }
}
