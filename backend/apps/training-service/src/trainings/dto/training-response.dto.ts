export class TrainingResponseDto {
  id!: string;
  trainerId!: string;
  title!: string;
  description!: string | null;
  type!: string;
  scheduledAt!: string;
  durationMinutes!: number;
  capacity!: number;
  price!: number;
  status!: string;
  createdAt!: string;
  updatedAt!: string;
  availableSlots!: number;
  currentParticipants!: number;
}
