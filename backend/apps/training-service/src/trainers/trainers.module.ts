import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './entities/trainer.entity';
import { TrainerRepository } from './repositories/trainer.repository';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer])],
  providers: [TrainerRepository, TrainersService],
  controllers: [TrainersController],
  exports: [TrainersService],
})
export class TrainersModule {}
