import { WeekScheduleDayDto } from './week-schedule-day.dto';

export class WeekScheduleResponseDto {
  weekStart!: string;
  weekEnd!: string;
  days!: WeekScheduleDayDto[];
}
