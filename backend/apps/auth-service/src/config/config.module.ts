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

    const databaseConfigProvider: Provider = {
      provide: 'DATABASE_CONFIG',
      useValue: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'dreamfitness',
      },
    };

    return {
      module: ConfigModule,
      global: true,
      providers: [
        {
          provide: 'JWT_CONFIG',
          useValue: jwtConfig,
        },
        databaseConfigProvider,
        configServiceProvider,
      ],
      exports: ['JWT_CONFIG', 'DATABASE_CONFIG', 'ConfigService'],
    };
  }
}
