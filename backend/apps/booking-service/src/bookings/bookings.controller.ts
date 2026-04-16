import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@app/shared';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BookingResponseDto } from './dto';
import { BookingListResponseDto } from './dto/booking-list-response.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { CreateBookingDto } from '@app/contracts/booking';
import { CancelBookingDto } from '@app/contracts/booking';
import { BookTrainingCommand, CancelBookingCommand } from '../cqrs/commands';
import { GetUserBookingsQuery, GetBookingByIdQuery } from '../cqrs/queries';
import type { AuthenticatedUser } from '@app/shared';
import { Booking } from './entities/booking.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private toBookingResponseDto(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      userId: booking.userId,
      trainingId: booking.trainingId,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a training' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateBookingDto })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const booking = await this.commandBus.execute<BookTrainingCommand, Booking>(
      new BookTrainingCommand(user.id, dto.trainingId),
    );
    return this.toBookingResponseDto(booking);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings with filters' })
  @ApiOkResponse({ type: BookingResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: BookingFilterDto,
  ): Promise<BookingListResponseDto> {
    const result = await this.queryBus.execute<
      GetUserBookingsQuery,
      { items: Booking[]; total: number; page: number; limit: number }
    >(new GetUserBookingsQuery(user.id, filters));
    return {
      items: result.items.map((booking) => this.toBookingResponseDto(booking)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const booking = await this.queryBus.execute<GetBookingByIdQuery, Booking>(
      new GetBookingByIdQuery(id, user.id),
    );
    return this.toBookingResponseDto(booking);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CancelBookingDto })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const booking = await this.commandBus.execute<
      CancelBookingCommand,
      Booking
    >(new CancelBookingCommand(id, user.id, dto.reason));
    return this.toBookingResponseDto(booking);
  }
}
