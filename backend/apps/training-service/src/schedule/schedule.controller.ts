import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { InternalGuard } from '@app/shared';
import { ScheduleService } from './schedule.service';
import { WeekScheduleResponseDto, TrainerScheduleResponseDto } from './dto';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('week')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get weekly schedule' })
  @ApiOkResponse({ type: WeekScheduleResponseDto })
  async getWeekSchedule(@Query('date') date?: string) {
    return this.scheduleService.getWeekSchedule(date);
  }

  @Get('trainer/:id')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get trainer schedule' })
  @ApiOkResponse({ type: TrainerScheduleResponseDto })
  async getTrainerSchedule(
    @Param('id') trainerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.scheduleService.getTrainerSchedule(trainerId, dateFrom, dateTo);
  }
}
