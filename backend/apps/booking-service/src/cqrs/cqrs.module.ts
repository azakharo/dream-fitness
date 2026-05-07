import { Module } from '@nestjs/common';
import { CqrsModule as NestCqrsModule } from '@nestjs/cqrs';
import { BookingsModule } from '../bookings/bookings.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { ClientsModule } from '../clients/clients.module';
import { EventsModule } from '../events/events.module';
import { BookTrainingHandler } from './commands';
import { CancelBookingHandler } from './commands';
import { JoinWaitlistHandler } from './commands';
import { LeaveWaitlistHandler } from './commands';
import { PromoteFromWaitlistHandler } from './commands';
import { GetUserBookingsHandler } from './queries';
import { GetBookingByIdHandler } from './queries';
import { GetWaitlistPositionHandler } from './queries';
import { GetTrainingAvailabilityHandler } from './queries';
import { GetUserWaitlistHandler } from './queries';
import { BookingSaga } from './sagas';
import { CancellationSaga } from './sagas';
import { WaitlistPromotionSaga } from './sagas';

@Module({
  imports: [
    NestCqrsModule,
    BookingsModule,
    WaitlistModule,
    ClientsModule,
    EventsModule,
  ],
  providers: [
    BookTrainingHandler,
    CancelBookingHandler,
    JoinWaitlistHandler,
    LeaveWaitlistHandler,
    PromoteFromWaitlistHandler,
    GetUserBookingsHandler,
    GetBookingByIdHandler,
    GetWaitlistPositionHandler,
    GetTrainingAvailabilityHandler,
    GetUserWaitlistHandler,
    BookingSaga,
    CancellationSaga,
    WaitlistPromotionSaga,
  ],
})
export class BookingCqrsModule {}
