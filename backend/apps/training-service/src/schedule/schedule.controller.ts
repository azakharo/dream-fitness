import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('week')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly schedule' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', format: 'date-time' },
        weekEnd: { type: 'string', format: 'date-time' },
        days: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              dayOfWeek: { type: 'string' },
              trainings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    type: { type: 'string' },
                    scheduledAt: { type: 'string', format: 'date-time' },
                    durationMinutes: { type: 'number' },
                    capacity: { type: 'number' },
                    price: { type: 'number' },
                    trainerId: { type: 'string' },
                    trainerName: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWeekSchedule(@Query('date') date?: string) {
    return this.scheduleService.getWeekSchedule(date);
  }

  @Get('trainer/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trainer schedule' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        trainer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        trainings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              scheduledAt: { type: 'string', format: 'date-time' },
              durationMinutes: { type: 'number' },
              capacity: { type: 'number' },
              price: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getTrainerSchedule(
    @Param('id') trainerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.scheduleService.getTrainerSchedule(trainerId, dateFrom, dateTo);
  }
}
