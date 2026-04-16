import { ApiProperty } from '@nestjs/swagger';

export class WaitlistPositionResponseDto {
  @ApiProperty()
  position: number;

  @ApiProperty()
  totalInQueue: number;

  @ApiProperty()
  waitlistId: string;
}
