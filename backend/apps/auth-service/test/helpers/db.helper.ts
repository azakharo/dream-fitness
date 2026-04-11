import { DataSource } from 'typeorm';
import { Transaction } from '../../src/balance/entities/transaction.entity';
import { User } from '../../src/users/entities/user.entity';

export class DbHelper {
  constructor(private dataSource: DataSource) {}

  async truncateTables(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.createQueryBuilder().delete().from(Transaction).execute();
      await manager.createQueryBuilder().delete().from(User).execute();
    });
  }
}
