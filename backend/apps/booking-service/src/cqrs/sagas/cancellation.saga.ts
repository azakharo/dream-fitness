import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingCancelledEvent } from '../events';
import { CheckWaitlistPromotionEvent } from '../events';
import { EventsPublisher } from '../../events/events.publisher';

@Injectable()
export class CancellationSaga {
  private readonly logger = new Logger(CancellationSaga.name);

  constructor(private readonly eventsPublisher: EventsPublisher) {}

  @Saga()
  bookingCancelled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(BookingCancelledEvent),
      map((event: BookingCancelledEvent) => {
        this.logger.log(
          `Booking cancelled: ${event.bookingId}, triggering waitlist promotion check`,
        );
        this.eventsPublisher.publishBookingCancelled({
          bookingId: event.bookingId,
          trainingId: event.trainingId,
          userId: event.userId,
          reason: event.reason,
          cancelledAt: new Date().toISOString(),
        });
        return new CheckWaitlistPromotionEvent(event.trainingId);
      }),
    );
  };
}
