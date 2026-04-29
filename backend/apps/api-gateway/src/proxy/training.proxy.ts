import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { type RequestWithUser, Roles } from '@app/shared';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import {
  CreateTrainerDto,
  UpdateTrainerDto,
  CreateTrainingDto,
  UpdateTrainingDto,
} from '@app/contracts/training';

const TRAINING_SERVICE_URL = 'TRAINING_SERVICE_URL';
const TRAINING_SERVICE_DEFAULT_URL = 'http://localhost:3002';

@ApiTags('Trainings')
@Controller('api')
export class TrainingProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Trainers endpoints
  @Get('trainers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainers(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/trainers',
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('trainers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainerById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/trainers/${id}`,
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Post('trainers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiBody({ type: CreateTrainerDto })
  createTrainer(@Req() req: RequestWithUser, @Body() body: CreateTrainerDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/trainers',
      'POST',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Patch('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateTrainerDto })
  updateTrainer(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateTrainerDto,
  ) {
    return this.proxyService.proxyRequest(
      req,
      body,
      `/trainers/${id}`,
      'PATCH',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  deleteTrainer(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/trainers/${id}`,
      'DELETE',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  // Trainings endpoints
  @Get('trainings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainings(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/trainings',
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('trainings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainingById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/trainings/${id}`,
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Post('trainings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiBody({ type: CreateTrainingDto })
  createTraining(@Req() req: RequestWithUser, @Body() body: CreateTrainingDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/trainings',
      'POST',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Patch('trainings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateTrainingDto })
  updateTraining(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateTrainingDto,
  ) {
    return this.proxyService.proxyRequest(
      req,
      body,
      `/trainings/${id}`,
      'PATCH',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('trainings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  deleteTraining(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/trainings/${id}`,
      'DELETE',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  // Schedule endpoints
  @Get('schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSchedule(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/schedule',
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('schedule/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getScheduleByDate(@Req() req: RequestWithUser, @Param('date') date: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/schedule/${date}`,
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  // Catch-all for training routes
  @All('trainers/*path')
  @ApiExcludeEndpoint()
  catchAllTrainers(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @All('trainings/*path')
  @ApiExcludeEndpoint()
  catchAllTrainings(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @All('schedule/*path')
  @ApiExcludeEndpoint()
  catchAllSchedule(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }
}
