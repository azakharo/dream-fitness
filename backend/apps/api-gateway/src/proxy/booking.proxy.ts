import {
  Controller,
  Get,
  Post,
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
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('api')
export class BookingProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Bookings endpoints
  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  getBookings(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('trainingId') trainingId?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (trainingId) queryParams.append('trainingId', trainingId);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/bookings${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  getBookingById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/bookings/${id}`, 'GET');
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  createBooking(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/bookings', 'POST');
  }

  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  cancelBooking(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyRequest(req, null, `/bookings/${id}`, 'DELETE');
  }

  // Waitlist endpoints
  @Get('waitlist')
  @UseGuards(JwtAuthGuard)
  getWaitlist(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('trainingId') trainingId?: string,
  ) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (trainingId) queryParams.append('trainingId', trainingId);
    const query = queryParams.toString();
    return this.proxyRequest(
      req,
      null,
      `/waitlist${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  @Get('waitlist/:trainingId')
  @UseGuards(JwtAuthGuard)
  getWaitlistPosition(
    @Req() req: RequestWithUser,
    @Param('trainingId') trainingId: string,
  ) {
    return this.proxyRequest(req, null, `/waitlist/${trainingId}`, 'GET');
  }

  @Post('waitlist')
  @UseGuards(JwtAuthGuard)
  joinWaitlist(@Req() req: RequestWithUser, @Body() body: unknown) {
    return this.proxyRequest(req, body, '/waitlist', 'POST');
  }

  @Delete('waitlist/:trainingId')
  @UseGuards(JwtAuthGuard)
  leaveWaitlist(
    @Req() req: RequestWithUser,
    @Param('trainingId') trainingId: string,
  ) {
    return this.proxyRequest(req, null, `/waitlist/${trainingId}`, 'DELETE');
  }

  // Catch-all for booking routes
  @All('bookings/*path')
  catchAllBookings(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyRequest(req, req.body, path, req.method);
  }

  @All('waitlist/*path')
  catchAllWaitlist(@Req() req: RequestWithUser) {
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
      this.configService.get<string>('BOOKING_SERVICE_URL') ||
      'http://localhost:3003';
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
