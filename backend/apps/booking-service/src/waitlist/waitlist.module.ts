import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistRepository } from './repositories/waitlist.repository';
import { WaitlistController } from './waitlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Waitlist]), CqrsModule],
  controllers: [WaitlistController],
  providers: [WaitlistRepository],
  exports: [WaitlistRepository],
})
export class WaitlistModule {}
