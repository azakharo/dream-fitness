import {
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateTrainingDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsUUID()
  trainerId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  maxParticipants: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}

export class UpdateTrainingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  maxParticipants?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsEnum(['scheduled', 'cancelled', 'completed'])
  status?: 'scheduled' | 'cancelled' | 'completed';
}

export class TrainingDto {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  trainerId: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class TrainerDto {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  createdAt: Date;
}
