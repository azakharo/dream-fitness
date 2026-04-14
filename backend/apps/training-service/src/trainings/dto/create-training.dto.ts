import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { TrainingType } from '@app/shared';

export class CreateTrainingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(TrainingType)
  type: TrainingType;

  @IsUUID()
  trainerId: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @IsInt()
  @Min(1)
  @Max(100)
  capacity: number;

  @IsInt()
  @Min(0)
  price: number;
}
