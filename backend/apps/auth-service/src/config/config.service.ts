import { Injectable } from '@nestjs/common';
import { BaseConfigService } from '@app/shared/config';

@Injectable()
export class ConfigService extends BaseConfigService {
  // Auth-service specific config methods can be added here
}
