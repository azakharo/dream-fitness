import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BookingCancelledEvent } from '../events';
import { CheckWaitlistPromotionEvent } from '../events';
import { EventsPublisher } from '../../events/events.publisher';
import { WaitlistRepository } from '../../waitlist/repositories/waitlist.repository';

@Injectable()
export class CancellationSaga {
  private readonly logger = new Logger(CancellationSaga.name);

  constructor(
    private readonly eventsPublisher: EventsPublisher,
    private readonly waitlistRepository: WaitlistRepository,
  ) {}

  @Saga()
  bookingCancelled = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(BookingCancelledEvent),
      mergeMap(async (event: BookingCancelledEvent) => {
        this.logger.log(
          `Booking cancelled: ${event.bookingId}, triggering waitlist promotion check`,
        );
        void this.eventsPublisher.publishBookingCancelled({
          bookingId: event.bookingId,
          trainingId: event.trainingId,
          userId: event.userId,
          reason: event.reason,
          cancelledAt: new Date().toISOString(),
        });
        const waitlistEntry =
          await this.waitlistRepository.findFirstByTrainingId(event.trainingId);
        return new CheckWaitlistPromotionEvent(
          event.trainingId,
          waitlistEntry?.id || '',
        );
      }),
    );
  };
}
