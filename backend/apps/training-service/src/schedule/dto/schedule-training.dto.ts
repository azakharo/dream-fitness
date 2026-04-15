export class ScheduleTrainingDto {
  id!: string;
  title!: string;
  type!: string;
  scheduledAt!: string;
  durationMinutes!: number;
  capacity!: number;
  price!: number;
  trainerId!: string;
  trainerName!: string;
}
