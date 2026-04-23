import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { ConfigService } from '../config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@app/shared';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  TrainerFilterDto,
  TrainingFilterDto,
  ScheduleFilterDto,
} from '@app/contracts/training';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('api')
export class TrainingProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Trainers endpoints
  @Get('trainers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainers(@Req() req: RequestWithUser, @Query() filters: TrainerFilterDto) {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.limit) queryParams.append('limit', String(filters.limit));
    if (filters.specialization)
      queryParams.append('specialization', filters.specialization);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/trainers${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('trainers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainerById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainers/${id}`, 'GET');
  }

  @Post('trainers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createTrainer(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/trainers', 'POST');
  }

  @Patch('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  updateTrainer(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.proxyRequest(req, body, `/trainers/${id}`, 'PATCH');
  }

  @Delete('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  deleteTrainer(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainers/${id}`, 'DELETE');
  }

  // Trainings endpoints
  @Get('trainings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainings(
    @Req() req: RequestWithUser,
    @Query() filters: TrainingFilterDto,
  ) {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.limit) queryParams.append('limit', String(filters.limit));
    if (filters.trainerId) queryParams.append('trainerId', filters.trainerId);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/trainings${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('trainings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTrainingById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainings/${id}`, 'GET');
  }

  @Post('trainings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createTraining(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/trainings', 'POST');
  }

  @Patch('trainings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  updateTraining(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.proxyRequest(req, body, `/trainings/${id}`, 'PATCH');
  }

  @Delete('trainings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  deleteTraining(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainings/${id}`, 'DELETE');
  }

  // Schedule endpoints
  @Get('schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSchedule(
    @Req() req: RequestWithUser,
    @Query() filters: ScheduleFilterDto,
  ) {
    const queryParams = new URLSearchParams();
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.trainerId) queryParams.append('trainerId', filters.trainerId);
    if (filters.week) queryParams.append('week', String(filters.week));
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/schedule${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('schedule/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getScheduleByDate(@Req() req: RequestWithUser, @Param('date') date: string) {
    return this.proxyRequest(req, null, `/schedule/${date}`, 'GET');
  }

  // Catch-all for training routes
  @All('trainers/*path')
  @ApiExcludeEndpoint()
  catchAllTrainers(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  @All('trainings/*path')
  @ApiExcludeEndpoint()
  catchAllTrainings(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  @All('schedule/*path')
  @ApiExcludeEndpoint()
  catchAllSchedule(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  private async proxyRequest(
    req: Request,
    body: unknown,
    path: string,
    method = 'GET',
  ): Promise<unknown> {
    const baseUrl =
      this.configService.get<string>('TRAINING_SERVICE_URL') ||
      'http://localhost:3002';
    const url = `${baseUrl}${path}`;

    const headers = this.buildHeaders(req as RequestWithUser);

    // Only include data property if body is not null/undefined,
    // otherwise axios sends "null" as body which causes JSON parsing errors
    const requestConfig: {
      method: string;
      url: string;
      headers: Record<string, string>;
      data?: unknown;
      params: typeof req.query;
    } = {
      method,
      url,
      headers,
      params: req.query,
    };

    if (body !== null && body !== undefined) {
      requestConfig.data = body;
    }

    const response = await this.httpService.axiosRef.request(requestConfig);
    return response.data;
  }

  private buildHeaders(req: RequestWithUser): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req.user) {
      headers['X-User-Id'] = req.user.id;
      headers['X-User-Role'] = req.user.role;
    }

    return headers;
  }
}
