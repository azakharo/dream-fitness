import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Saga, ofType, CommandBus } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BookingCancelledEvent } from '../events';
import { EventsPublisher } from '../../events/events.publisher';
import { PromoteFromWaitlistCommand } from '../commands';

@Injectable()
export class CancellationSaga {
  private readonly logger = new Logger(CancellationSaga.name);

  constructor(
    private readonly eventsPublisher: EventsPublisher,
    private readonly commandBus: CommandBus,
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
        try {
          await this.commandBus.execute(
            new PromoteFromWaitlistCommand(event.trainingId),
          );
        } catch (error) {
          this.logger.error(
            `Waitlist promotion failed after booking cancellation: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }),
    );
  };
}
