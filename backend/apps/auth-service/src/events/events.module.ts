import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@app/shared/rabbitmq';
import { EventsPublisher } from './events.publisher';

@Module({
  imports: [RabbitMQModule.forRoot()],
  providers: [EventsPublisher],
  exports: [EventsPublisher],
})
export class EventsModule {}
