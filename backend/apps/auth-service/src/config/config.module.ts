import 'dotenv/config';
import { Global, Module } from '@nestjs/common';
import { jwtConfig } from './jwt.config';
import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: 'JWT_CONFIG',
      useValue: jwtConfig,
    },
    {
      provide: 'DATABASE_CONFIG',
      useValue: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME || 'dreamfitness',
      },
    },
    ConfigService,
  ],
  exports: ['JWT_CONFIG', 'DATABASE_CONFIG', ConfigService],
})
export class ConfigModule {}
