import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingCreatedEvent } from '../events';
import { EventsPublisher } from '../../events/events.publisher';

@Injectable()
export class BookingSaga {
  private readonly logger = new Logger(BookingSaga.name);

  constructor(private readonly eventsPublisher: EventsPublisher) {}

  @Saga()
  bookingCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(BookingCreatedEvent),
      map((event: BookingCreatedEvent) => {
        this.logger.log(`Booking created: ${event.bookingId}`);
        void this.eventsPublisher.publishBookingCreated({
          bookingId: event.bookingId,
          trainingId: event.trainingId,
          userId: event.userId,
          bookedAt: new Date().toISOString(),
        });
        return null;
      }),
    );
  };
}
