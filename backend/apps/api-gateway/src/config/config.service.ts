import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

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

  // Rate Limiting
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
}

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T = string>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }

  getOrThrow<T = string>(key: string): T {
    return this.configService.getOrThrow<T>(key);
  }

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
      THROTTLE_TTL: this.get<number>('THROTTLE_TTL') || 60,
      THROTTLE_LIMIT: this.get<number>('THROTTLE_LIMIT') || 100,
    };
  }
}
