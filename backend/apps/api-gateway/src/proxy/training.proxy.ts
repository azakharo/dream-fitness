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
  ApiResponse,
} from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import {
  CreateTrainerDto,
  UpdateTrainerDto,
  CreateTrainingDto,
  UpdateTrainingDto,
  TrainerResponseDto,
  TrainingListResponseDto,
  TrainingResponseDto,
} from '@app/contracts/training';
import {
  WeekScheduleResponseDto,
  TrainerScheduleResponseDto,
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
  @ApiResponse({
    status: 200,
    description: 'Trainers retrieved',
    type: [TrainerResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Trainer retrieved',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
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
  @ApiResponse({
    status: 201,
    description: 'Trainer created',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
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
  @ApiResponse({
    status: 200,
    description: 'Trainer updated',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
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
  @ApiResponse({ status: 200, description: 'Trainer deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Trainings retrieved',
    type: TrainingListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Training retrieved',
    type: TrainingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Training not found' })
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
  @ApiResponse({
    status: 201,
    description: 'Training created',
    type: TrainingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
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
  @ApiResponse({
    status: 200,
    description: 'Training updated',
    type: TrainingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Training not found' })
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
  @ApiResponse({ status: 200, description: 'Training cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Training not found' })
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
  @ApiResponse({
    status: 200,
    description: 'Weekly schedule retrieved',
    type: WeekScheduleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSchedule(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/schedule/week',
      'GET',
      TRAINING_SERVICE_URL,
      TRAINING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('schedule/trainer/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Trainer schedule retrieved',
    type: TrainerScheduleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTrainerSchedule(
    @Req() req: RequestWithUser,
    @Param('id') trainerId: string,
  ) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/schedule/trainer/${trainerId}`,
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
