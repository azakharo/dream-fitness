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
    const result = await this.findOne({
      where: { trainingId },
      order: { createdAt: 'ASC' },
    });
    return result || null;
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
      position: string;
      total: string;
      waitlistId: string;
    }> = await this.query(query, [trainingId, userId]);

    if (result.length === 0) {
      return null;
    }

    return {
      position: Number.parseInt(result[0].position, 10),
      totalInQueue: Number.parseInt(result[0].total, 10),
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
