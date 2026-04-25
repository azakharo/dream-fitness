import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@app/shared/config';
import { SmtpConfig } from './smtp-config.interface';

@Injectable()
export class ConfigService extends BaseConfigService {
  getSmtpConfig(): SmtpConfig {
    return {
      host: this.get<string>('SMTP_HOST') || 'localhost',
      port: this.get<number>('SMTP_PORT') || 587,
      secure: this.get<boolean>('SMTP_SECURE') || false,
      user: this.get<string>('SMTP_USER'),
      password: this.get<string>('SMTP_PASSWORD'),
      from: this.get<string>('SMTP_FROM') || 'noreply@dreamfitness.com',
    };
  }
}
