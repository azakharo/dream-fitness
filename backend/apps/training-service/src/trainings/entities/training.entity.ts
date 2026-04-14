import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Trainer } from '../trainers/entities/trainer.entity';
import { TrainingType } from '@app/shared';
import { TrainingStatus } from '@app/shared';

@Entity('trainings')
@Index(['trainerId'])
@Index(['scheduledAt'])
@Index(['type'])
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'trainer_id' })
  trainerId: string;

  @ManyToOne(() => Trainer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'training_type_enum' })
  type: TrainingType;

  @Column({ type: 'timestamp', name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ type: 'integer', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ type: 'integer' })
  price: number;

  @Column({
    type: 'training_status_enum',
    default: TrainingStatus.SCHEDULED,
  })
  status: TrainingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
