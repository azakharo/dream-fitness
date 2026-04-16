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
import { JwtAuthGuard } from '@app/shared';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BookingResponseDto } from './dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { CreateBookingDto } from '@app/contracts/booking';
import { CancelBookingDto } from '@app/contracts/booking';
import { BookTrainingCommand, CancelBookingCommand } from '../cqrs/commands';
import { GetUserBookingsQuery, GetBookingByIdQuery } from '../cqrs/queries';
import type { AuthenticatedUser } from '@app/shared';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
    const result = await this.commandBus.execute(
      new BookTrainingCommand(user.id, dto.trainingId),
    );
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings with filters' })
  @ApiOkResponse({ type: BookingResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: BookingFilterDto,
  ): Promise<BookingResponseDto[]> {
    const result = await this.queryBus.execute(
      new GetUserBookingsQuery(user.id, filters),
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    const result = await this.queryBus.execute(
      new GetBookingByIdQuery(id, user.id),
    );
    return result;
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
    const result = await this.commandBus.execute(
      new CancelBookingCommand(id, user.id, dto.reason),
    );
    return result;
  }
}
