import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string | undefined;
  password: string | undefined;
  database: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  password: string | undefined;
  from: string;
}

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  getDatabaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME', 'dreamfitness'),
    };
  }

  getSmtpConfig(): SmtpConfig {
    return {
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      user: this.configService.get<string>('SMTP_USER'),
      password: this.configService.get<string>('SMTP_PASSWORD'),
      from: this.configService.get<string>(
        'SMTP_FROM',
        'noreply@dreamfitness.com',
      ),
    };
  }

  get(key: string): string | undefined {
    return this.configService.get<string>(key);
  }
}
