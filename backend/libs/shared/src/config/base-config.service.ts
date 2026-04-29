import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { DatabaseConfig } from './database-config.interface';

@Injectable()
export class BaseConfigService {
  constructor(protected readonly configService: NestConfigService) {}

  get<T = string>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }

  getOrThrow<T = string>(key: string): T {
    return this.configService.getOrThrow<T>(key);
  }

  getDatabaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME', 'dreamfitness'),
    };
  }
}
