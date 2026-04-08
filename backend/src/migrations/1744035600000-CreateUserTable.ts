import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1744035600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        birth_date DATE NULL,
        gender VARCHAR(10) NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'client',
        balance INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(10) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT users_email_unique UNIQUE (email),
        CONSTRAINT users_balance_check CHECK (balance >= 0),
        CONSTRAINT users_gender_check CHECK (gender IN ('male', 'female') OR gender IS NULL),
        CONSTRAINT users_role_check CHECK (role IN ('client', 'admin')),
        CONSTRAINT users_status_check CHECK (status IN ('active', 'blocked'))
      )`,
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX users_role_index ON users (role)`);
    await queryRunner.query(
      `CREATE INDEX users_status_index ON users (status)`,
    );
    await queryRunner.query(`CREATE INDEX users_email_index ON users (email)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
