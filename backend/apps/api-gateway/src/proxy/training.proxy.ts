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
  getTrainers(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('specialization') specialization?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (specialization) queryParams.append('specialization', specialization);
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
  getTrainerById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainers/${id}`, 'GET');
  }

  @Post('trainers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createTrainer(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/trainers', 'POST');
  }

  @Patch('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  deleteTrainer(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainers/${id}`, 'DELETE');
  }

  // Trainings endpoints
  @Get('trainings')
  @UseGuards(JwtAuthGuard)
  getTrainings(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('trainerId') trainerId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (trainerId) queryParams.append('trainerId', trainerId);
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);
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
  getTrainingById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainings/${id}`, 'GET');
  }

  @Post('trainings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createTraining(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/trainings', 'POST');
  }

  @Patch('trainings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  deleteTraining(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/trainings/${id}`, 'DELETE');
  }

  // Schedule endpoints
  @Get('schedule')
  @UseGuards(JwtAuthGuard)
  getSchedule(
    @Req() req: RequestWithUser,
    @Query('date') date?: string,
    @Query('trainerId') trainerId?: string,
    @Query('week') week?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    if (trainerId) queryParams.append('trainerId', trainerId);
    if (week) queryParams.append('week', week);
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
  getScheduleByDate(@Req() req: RequestWithUser, @Param('date') date: string) {
    return this.proxyRequest(req, null, `/schedule/${date}`, 'GET');
  }

  // Catch-all for training routes
  @All('trainers/*path')
  catchAllTrainers(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  @All('trainings/*path')
  catchAllTrainings(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  @All('schedule/*path')
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

    const response = await this.httpService.axiosRef.request({
      method,
      url,
      headers,
      data: body,
      params: req.query,
    });
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
