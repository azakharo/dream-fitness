import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@app/shared/config';

interface GatewayConfig {
  // Ports
  PORT: number;

  // Service URLs
  AUTH_SERVICE_URL: string;
  TRAINING_SERVICE_URL: string;
  BOOKING_SERVICE_URL: string;
  NOTIFICATION_SERVICE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_TTL: string;
}

@Injectable()
export class ConfigService extends BaseConfigService {
  getGatewayConfig(): GatewayConfig {
    return {
      PORT: this.get<number>('PORT') || 3000,
      AUTH_SERVICE_URL:
        this.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001',
      TRAINING_SERVICE_URL:
        this.get<string>('TRAINING_SERVICE_URL') || 'http://localhost:3002',
      BOOKING_SERVICE_URL:
        this.get<string>('BOOKING_SERVICE_URL') || 'http://localhost:3003',
      NOTIFICATION_SERVICE_URL:
        this.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:3004',
      JWT_SECRET: this.getOrThrow<string>('JWT_SECRET'),
      JWT_ACCESS_TTL: this.get<string>('JWT_ACCESS_TTL') || '15m',
    };
  }
}
