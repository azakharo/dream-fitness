import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthClientService } from './auth-client.service';
import { TrainingClientService } from './training-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL:
          configService.get('API_GATEWAY_URL') || 'http://localhost:3000',
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthClientService, TrainingClientService],
  exports: [AuthClientService, TrainingClientService],
})
export class ClientsModule {}
