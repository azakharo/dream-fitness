import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@app/shared/config';

@Injectable()
export class ConfigService extends BaseConfigService {
  getAuthServiceUrl(): string {
    return this.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
  }

  getTrainingServiceUrl(): string {
    return this.get<string>('TRAINING_SERVICE_URL') || 'http://localhost:3002';
  }
}
