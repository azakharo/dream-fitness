import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('waitlist')
@Index(['userId'])
@Index(['trainingId'])
export class Waitlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'training_id' })
  trainingId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
