import { Global, Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/shared/config';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [SharedConfigModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
