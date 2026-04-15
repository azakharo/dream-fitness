import { EventsPublisher } from '../../src/events/events.publisher';
import { EventsModule as RealEventsModule } from '../../src/events/events.module';
import { RabbitMQModule, RabbitMQPublisher } from '@app/shared/rabbitmq';

export const mockEventsPublisher = {
  publishTrainingCreated: jest.fn(),
  publishTrainingUpdated: jest.fn(),
  publishTrainingCancelled: jest.fn(),
};

export class MockEventsModule {
  static overrideFrom = RealEventsModule;

  static forRoot() {
    return {
      module: MockEventsModule,
      imports: [RabbitMQModule.forRoot()],
      providers: [
        {
          provide: EventsPublisher,
          useValue: mockEventsPublisher,
        },
        {
          provide: RabbitMQPublisher,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [EventsPublisher],
    };
  }
}
