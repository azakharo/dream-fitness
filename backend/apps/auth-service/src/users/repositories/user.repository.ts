import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.findOne({ where: { email } });
    return user || undefined;
  }

  async findByIdWithBalance(id: string): Promise<User | undefined> {
    const user = await this.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'balance', 'role', 'status'],
    });
    return user || undefined;
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({ balance: () => `balance + ${amount}` })
      .where('id = :id', { id })
      .execute();
  }
}
