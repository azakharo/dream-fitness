import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class DepositDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
