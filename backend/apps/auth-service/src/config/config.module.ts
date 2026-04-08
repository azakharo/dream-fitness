import { DynamicModule, Global } from '@nestjs/common';
import { jwtConfig } from './jwt.config';

@Global()
export class ConfigModule {
  static configure(): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [
        {
          provide: 'JWT_CONFIG',
          useValue: jwtConfig,
        },
      ],
      exports: ['JWT_CONFIG'],
    };
  }
}
