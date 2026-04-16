import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Waitlist } from '../entities/waitlist.entity';

@Injectable()
export class WaitlistRepository extends Repository<Waitlist> {
  constructor(dataSource: DataSource) {
    super(Waitlist, dataSource.createEntityManager());
  }

  async findByUserAndTraining(
    userId: string,
    trainingId: string,
  ): Promise<Waitlist | null> {
    return this.findOne({
      where: {
        userId,
        trainingId,
      },
    });
  }

  async findFirstByTrainingId(trainingId: string): Promise<Waitlist | null> {
    return this.findOne({
      where: { trainingId },
      order: { createdAt: 'ASC' },
      take: 1,
    } as any);
  }

  async getPositionByUserId(
    userId: string,
    trainingId: string,
  ): Promise<{
    position: number;
    totalInQueue: number;
    waitlistId: string;
  } | null> {
    const query = `
      SELECT ranked.position, ranked.id as waitlistId, ranked.total
      FROM (
        SELECT id, user_id,
          RANK() OVER (ORDER BY created_at) as position,
          COUNT(*) OVER () as total
        FROM waitlist
        WHERE training_id = $1
      ) ranked
      WHERE ranked.user_id = $2
    `;

    const result: Array<{
      position: number;
      total: number;
      waitlistId: string;
    }> = await this.query(query, [trainingId, userId]);

    if (result.length === 0) {
      return null;
    }

    return {
      position: result[0].position,
      totalInQueue: result[0].total,
      waitlistId: result[0].waitlistId,
    };
  }

  async countByTrainingId(trainingId: string): Promise<number> {
    return this.count({
      where: { trainingId },
    });
  }

  async findByTrainingId(trainingId: string): Promise<Waitlist[]> {
    return this.find({
      where: { trainingId },
      order: { createdAt: 'ASC' },
    });
  }
}
