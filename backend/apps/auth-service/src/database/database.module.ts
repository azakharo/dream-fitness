import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        ...configService.getDatabaseConfig(),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
