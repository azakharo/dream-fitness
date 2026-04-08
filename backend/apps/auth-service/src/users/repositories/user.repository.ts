import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  async findByIdWithBalance(id: string): Promise<User | undefined> {
    return this.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'balance', 'role', 'status'],
    });
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({ balance: () => `balance + ${amount}` })
      .where('id = :id', { id })
      .execute();
  }
}
