import { DynamicModule, Global, Provider, Module } from '@nestjs/common';
import { jwtConfig } from './jwt.config';
import { ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  static configure(): DynamicModule {
    const configServiceProvider: Provider = {
      provide: ConfigService,
      useClass: ConfigService,
    };

    return {
      module: ConfigModule,
      global: true,
      providers: [
        {
          provide: 'JWT_CONFIG',
          useValue: jwtConfig,
        },
        configServiceProvider,
      ],
      exports: ['JWT_CONFIG', 'ConfigService'],
    };
  }
}
