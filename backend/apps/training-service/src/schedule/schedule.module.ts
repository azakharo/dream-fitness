import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { TrainingsModule } from '../trainings/trainings.module';
import { TrainersModule } from '../trainers/trainers.module';

@Module({
  imports: [TrainingsModule, TrainersModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
