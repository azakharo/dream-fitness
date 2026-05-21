import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getDatabaseConfig().host,
        port: configService.getDatabaseConfig().port,
        username: configService.getDatabaseConfig().username,
        password: configService.getDatabaseConfig().password,
        database: configService.getDatabaseConfig().database,
        entities: [User, Transaction, Payment],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
