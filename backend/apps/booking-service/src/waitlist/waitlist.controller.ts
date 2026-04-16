import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@app/shared';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WaitlistResponseDto } from './dto';
import { WaitlistPositionResponseDto } from './dto/waitlist-position-response.dto';
import { JoinWaitlistDto } from '@app/contracts/booking';
import { JoinWaitlistCommand, LeaveWaitlistCommand } from '../cqrs/commands';
import { GetWaitlistPositionQuery } from '../cqrs/queries';
import type { AuthenticatedUser } from '@app/shared';

@ApiTags('Waitlist')
@ApiBearerAuth()
@Controller('waitlist')
@UseGuards(JwtAuthGuard)
export class WaitlistController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join waitlist for a training' })
  @ApiCreatedResponse({ type: WaitlistResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: JoinWaitlistDto })
  async join(
    @Body() dto: JoinWaitlistDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WaitlistResponseDto> {
    const result = await this.commandBus.execute<
      JoinWaitlistCommand,
      WaitlistResponseDto
    >(new JoinWaitlistCommand(user.id, dto.trainingId));
    return result;
  }

  @Get('position')
  @ApiOperation({ summary: 'Get current waitlist position' })
  @ApiOkResponse({ type: WaitlistPositionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPosition(
    @Query('trainingId') trainingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WaitlistPositionResponseDto> {
    return this.queryBus.execute<
      GetWaitlistPositionQuery,
      WaitlistPositionResponseDto
    >(new GetWaitlistPositionQuery(user.id, trainingId));
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave waitlist' })
  @ApiOkResponse({
    description: 'Removed from waitlist successfully',
    schema: { example: { message: 'Removed from waitlist' } },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async leave(
    @Query('trainingId') trainingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.commandBus.execute<LeaveWaitlistCommand, void>(
      new LeaveWaitlistCommand(user.id, trainingId),
    );
    return { message: 'Removed from waitlist' };
  }
}
