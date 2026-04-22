import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InternalGuard } from '@app/shared';
import { ScheduleService } from './schedule.service';
import { WeekScheduleResponseDto, TrainerScheduleResponseDto } from './dto';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('week')
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly schedule' })
  @ApiOkResponse({ type: WeekScheduleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWeekSchedule(@Query('date') date?: string) {
    return this.scheduleService.getWeekSchedule(date);
  }

  @Get('trainer/:id')
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trainer schedule' })
  @ApiOkResponse({ type: TrainerScheduleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getTrainerSchedule(
    @Param('id') trainerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.scheduleService.getTrainerSchedule(trainerId, dateFrom, dateTo);
  }
}
