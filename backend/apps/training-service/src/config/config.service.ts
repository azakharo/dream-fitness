import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@app/shared/config';

@Injectable()
export class ConfigService extends BaseConfigService {
  // Training-service specific config methods can be added here

  getBookingServiceUrl(): string {
    return this.get<string>('BOOKING_SERVICE_URL') || 'http://localhost:3003';
  }
}
