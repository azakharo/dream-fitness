import { DataSource } from 'typeorm';
import { Training } from '../../src/trainings/entities/training.entity';
import { Trainer } from '../../src/trainers/entities/trainer.entity';

export class DbHelper {
  constructor(private dataSource: DataSource) {}

  async truncateTables(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.createQueryBuilder().delete().from(Training).execute();
      await manager.createQueryBuilder().delete().from(Trainer).execute();
    });
  }
}
