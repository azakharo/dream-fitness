import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from './entities/training.entity';
import { TrainingRepository } from './repositories/training.repository';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TrainersModule } from '../trainers/trainers.module';
import { EventsModule } from '../events/events.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training]),
    TrainersModule,
    EventsModule,
    ClientsModule,
  ],
  providers: [TrainingsService, TrainingRepository],
  controllers: [TrainingsController],
  exports: [TrainingsService, TrainingRepository],
})
export class TrainingsModule {}
