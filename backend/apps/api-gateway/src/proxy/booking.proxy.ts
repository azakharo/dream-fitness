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
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@app/shared';
import { ProxyService } from './proxy.service';
import {
  CreateBookingDto,
  CancelBookingDto,
  JoinWaitlistDto,
  BookingListResponseDto,
  BookingDto,
  WaitlistResponseDto,
  WaitlistDto,
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
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved',
    type: BookingListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved',
    type: BookingDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
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
  @ApiResponse({
    status: 201,
    description: 'Booking created',
    type: BookingDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  @ApiResponse({
    status: 409,
    description: 'Booking already exists or no available slots',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled',
    type: BookingDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({
    status: 409,
    description: 'Booking already cancelled or past training',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Waitlist retrieved',
    type: WaitlistResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({
    status: 200,
    description: 'Waitlist position retrieved',
    type: WaitlistDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not on waitlist' })
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
  @ApiResponse({
    status: 201,
    description: 'Added to waitlist',
    type: WaitlistDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  @ApiResponse({
    status: 409,
    description: 'Already on waitlist or has active booking',
  })
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

  @Delete('waitlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Left waitlist',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Removed from waitlist' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not on waitlist' })
  leaveWaitlist(
    @Req() req: RequestWithUser,
    @Query('trainingId') trainingId: string,
  ) {
    return this.proxyService.proxyRequest(
      req,
      null,
      `/waitlist?trainingId=${trainingId}`,
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
