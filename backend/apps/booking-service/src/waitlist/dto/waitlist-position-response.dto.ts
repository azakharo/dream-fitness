import { ApiProperty } from '@nestjs/swagger';

export class WaitlistPositionResponseDto {
  @ApiProperty({
    description:
      'Position in the waitlist queue. Value -1 indicates the user is not on the waitlist.',
    example: 3,
  })
  position: number;

  @ApiProperty({
    description: 'Total number of users in the waitlist queue',
    example: 5,
  })
  totalInQueue: number;

  @ApiProperty({
    description:
      'Unique identifier of the waitlist entry. Empty string if user is not on waitlist.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  waitlistId: string;
}
