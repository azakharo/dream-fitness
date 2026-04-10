import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  // This method returns user password hash!!!
  // It's expected, because it's used for checking password during the login
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'name',
        'phone',
        'birthDate',
        'gender',
        'role',
        'balance',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    return user || undefined;
  }

  async findByIdWithBalance(id: string): Promise<User | undefined> {
    const user = await this.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'balance', 'role', 'status'],
    });
    return user || undefined;
  }

  async updateBalance(
    id: string,
    amount: number,
    manager?: EntityManager,
  ): Promise<void> {
    const queryBuilder = manager
      ? manager.createQueryBuilder()
      : this.createQueryBuilder();

    await queryBuilder
      .update(User)
      .set({ balance: () => `balance + ${amount}` })
      .where('id = :id', { id })
      .execute();
  }

  async findByIdWithBalanceForUpdate(
    id: string,
    manager: EntityManager,
  ): Promise<User | undefined> {
    const user = await manager.findOne(User, {
      where: { id },
      select: ['id', 'email', 'name', 'balance', 'role', 'status'],
      lock: { mode: 'pessimistic_write' },
    });
    return user || undefined;
  }
}
