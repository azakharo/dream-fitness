import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { BaseConfigService } from './base-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        `.env`, // Base configuration (loaded first)
        `.env.${process.env.NODE_ENV || 'development'}`, // Environment-specific (overrides base)
      ],
      isGlobal: true,
    }),
  ],
  providers: [BaseConfigService],
  exports: [BaseConfigService],
})
export class SharedConfigModule {}
