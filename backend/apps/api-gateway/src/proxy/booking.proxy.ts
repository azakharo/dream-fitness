import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  All,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';
import {
  CreateBookingDto,
  CancelBookingDto,
  JoinWaitlistDto,
} from '@app/contracts/booking';

const BOOKING_SERVICE_URL = 'BOOKING_SERVICE_URL';
const BOOKING_SERVICE_DEFAULT_URL = 'http://localhost:3003';

@ApiTags('Booking')
@Controller('api')
export class BookingProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Bookings endpoints
  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBookings(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/bookings',
      'GET',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBookingById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/bookings/${id}`,
      'GET',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateBookingDto })
  createBooking(@Req() req: RequestWithUser, @Body() body: CreateBookingDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/bookings',
      'POST',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CancelBookingDto })
  cancelBooking(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: CancelBookingDto,
  ) {
    return this.proxyService.proxyRequest(
      req,
      body,
      `/bookings/${id}`,
      'DELETE',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  // Waitlist endpoints
  @Get('waitlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getWaitlist(@Req() req: RequestWithUser) {
    return this.proxyService.proxyRequest(
      req,
      null,
      '/waitlist',
      'GET',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Get('waitlist/:trainingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getWaitlistPosition(
    @Req() req: RequestWithUser,
    @Param('trainingId') trainingId: string,
  ) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/waitlist/${trainingId}`,
      'GET',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Post('waitlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: JoinWaitlistDto })
  joinWaitlist(@Req() req: RequestWithUser, @Body() body: JoinWaitlistDto) {
    return this.proxyService.proxyRequest(
      req,
      body,
      '/waitlist',
      'POST',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @Delete('waitlist/:trainingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  leaveWaitlist(
    @Req() req: RequestWithUser,
    @Param('trainingId') trainingId: string,
  ) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/waitlist/${trainingId}`,
      'DELETE',
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  // Catch-all for booking routes
  @All('bookings/*path')
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  catchAllBookings(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }

  @All('waitlist/*path')
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  catchAllWaitlist(@Req() req: RequestWithUser) {
    const path = req.path.replace(/^\/api/, '');
    return this.proxyService.proxyRequest(
      req,
      req.body,
      path,
      req.method,
      BOOKING_SERVICE_URL,
      BOOKING_SERVICE_DEFAULT_URL,
    );
  }
}
