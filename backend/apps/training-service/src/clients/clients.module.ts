import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config/config.module';
import { BookingClientService } from './booking-client.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [BookingClientService],
  exports: [BookingClientService],
})
export class ClientsModule {}
