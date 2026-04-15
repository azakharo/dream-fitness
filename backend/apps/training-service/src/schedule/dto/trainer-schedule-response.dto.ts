import { ScheduleTrainingDto } from './schedule-training.dto';

export class TrainerScheduleResponseDto {
  trainer!: {
    id: string;
    name: string;
  };
  trainings!: ScheduleTrainingDto[];
}
