import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@app/shared/rabbitmq';
import { EventsPublisher } from './events.publisher';
import { RabbitMQPublisher } from '@app/shared/rabbitmq';

@Module({
  imports: [RabbitMQModule.forRoot()],
  providers: [EventsPublisher, RabbitMQPublisher],
  exports: [EventsPublisher],
})
export class EventsModule {}
