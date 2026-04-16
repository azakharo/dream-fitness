import { Injectable, Logger } from '@nestjs/common';
import { Saga, ofType, CommandBus } from '@nestjs/cqrs';
import { Observable, from, map, catchError, mergeMap, of } from 'rxjs';
import { CheckWaitlistPromotionEvent } from '../events';
import { PromoteFromWaitlistCommand } from '../commands';

@Injectable()
export class WaitlistPromotionSaga {
  private readonly logger = new Logger(WaitlistPromotionSaga.name);

  constructor(private readonly commandBus: CommandBus) {}

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
          map(() => {
            this.logger.log(
              `Waitlist promotion processed for training ${event.trainingId}`,
            );
          }),
          catchError((error: Error) => {
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
