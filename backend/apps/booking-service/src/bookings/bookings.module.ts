import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Booking } from './entities/booking.entity';
import { BookingRepository } from './repositories/booking.repository';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), CqrsModule],
  controllers: [BookingsController],
  providers: [BookingRepository],
  exports: [BookingRepository],
})
export class BookingsModule {}
