import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';

@Injectable()
export class TrainerRepository extends Repository<Trainer> {
  constructor(dataSource: DataSource) {
    super(Trainer, dataSource.createEntityManager());
  }

  async findActive(): Promise<Trainer[]> {
    return this.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Trainer | undefined> {
    return this.findOne({
      where: { id },
      select: ['id', 'name', 'bio', 'avatarUrl', 'isActive', 'createdAt', 'updatedAt'],
    }) ?? undefined;
  }

  async findByName(name: string): Promise<Trainer | undefined> {
    return this.findOne({
      where: { name },
      select: ['id', 'name', 'bio', 'avatarUrl', 'isActive', 'createdAt', 'updatedAt'],
    }) ?? undefined;
  }
}
