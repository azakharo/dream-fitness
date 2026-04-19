import { DataSource } from 'typeorm';
import { Booking } from '../../src/bookings/entities/booking.entity';
import { Waitlist } from '../../src/waitlist/entities/waitlist.entity';

export class DbHelper {
  constructor(private dataSource: DataSource) {}

  async truncateTables(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.createQueryBuilder().delete().from(Booking).execute();
      await manager.createQueryBuilder().delete().from(Waitlist).execute();
    });
  }
}
