import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config';
import { AuthModule } from './auth/auth.module';
import { ProxyModule } from './proxy/proxy.module';
import { ProxyExceptionFilter } from './filters/proxy-exception.filter';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    ProxyModule,
    ThrottlerModule.forRoot({
      skipIf: () => {
        return process.env.NODE_ENV !== 'production';
      },
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // ms
          limit: 30, // requests
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 200,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 1000,
        },
      ],
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ProxyExceptionFilter,
    },
  ],
})
export class AppModule {}
