import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus, UserRole } from '@app/shared';

export interface FindAllUsersFilters {
  status?: UserStatus;
  role?: UserRole;
  page: number;
  limit: number;
}

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

  async findAllWithFilters(
    options: FindAllUsersFilters,
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit, status, role } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder('user').select([
      'user.id',
      'user.email',
      'user.name',
      'user.phone',
      'user.birthDate',
      'user.gender',
      'user.role',
      'user.balance',
      'user.status',
      'user.createdAt',
    ]);

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { users, total };
  }
}
