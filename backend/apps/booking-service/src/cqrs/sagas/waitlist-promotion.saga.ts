import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map, catchError, mergeMap, of } from 'rxjs';
import { CheckWaitlistPromotionEvent } from '../events';
import { PromoteFromWaitlistCommand } from '../commands';
import { EventsPublisher } from '../../events/events.publisher';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class WaitlistPromotionSaga {
  private readonly logger = new Logger(WaitlistPromotionSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventsPublisher: EventsPublisher,
  ) {}

  @Saga()
  checkWaitlistPromotion = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(CheckWaitlistPromotionEvent),
      mergeMap((event: CheckWaitlistPromotionEvent) => {
        this.logger.log(
          `Checking waitlist promotion for training ${event.trainingId}`,
        );
        return from(
          this.commandBus.execute(
            new PromoteFromWaitlistCommand(event.trainingId),
          ),
        ).pipe(
          map((result) => {
            if (result) {
              this.logger.log(`Waitlist user promoted to booking ${result.id}`);
              void this.eventsPublisher.publishWaitlistPromoted({
                waitlistId: result.waitlistId || '',
                trainingId: event.trainingId,
                userId: result.userId,
                promotedAt: new Date().toISOString(),
              });
            }
            return null;
          }),
          catchError((error: any) => {
            this.logger.error(
              `Waitlist promotion failed: ${error.message}`,
              error.stack,
            );
            return of(null);
          }),
        );
      }),
    );
  };
}
