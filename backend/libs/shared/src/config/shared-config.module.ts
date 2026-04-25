import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { BaseConfigService } from './base-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
  ],
  providers: [BaseConfigService],
  exports: [BaseConfigService],
})
export class SharedConfigModule {}
