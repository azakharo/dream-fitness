import { ApiProperty } from '@nestjs/swagger';

export class WaitlistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  trainingId: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  joinedAt: string;
}
