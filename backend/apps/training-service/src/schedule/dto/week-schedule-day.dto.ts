import { ScheduleTrainingDto } from './schedule-training.dto';

export class WeekScheduleDayDto {
  date!: string;
  dayOfWeek!: string;
  trainings!: ScheduleTrainingDto[];
}
