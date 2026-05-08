import { ApiProperty } from '@nestjs/swagger';

export class ScheduleTrainingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  scheduledAt!: string;

  @ApiProperty()
  durationMinutes!: number;
}

export class WeekScheduleDayDto {
  @ApiProperty()
  date!: string;

  @ApiProperty({ type: [ScheduleTrainingDto] })
  trainings!: ScheduleTrainingDto[];
}

export class WeekScheduleResponseDto {
  @ApiProperty()
  weekStart!: string;

  @ApiProperty()
  weekEnd!: string;

  @ApiProperty({ type: [WeekScheduleDayDto] })
  days!: WeekScheduleDayDto[];
}

export class TrainerScheduleResponseDto {
  @ApiProperty()
  trainer!: {
    id: string;
    name: string;
  };

  @ApiProperty({ type: [ScheduleTrainingDto] })
  trainings!: ScheduleTrainingDto[];
}
