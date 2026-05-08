import { Test, TestingModule } from '@nestjs/testing';
import {
  ValidationPipe,
  INestApplication,
  ValidationPipeOptions,
} from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { MockEventsModule } from '../mocks/events.module.mock';
import { mockBookingClientService } from '../mocks/booking-client.mock';
import { BookingClientService } from '../../src/clients/booking-client.service';
import { DataSource } from 'typeorm';
import { Server } from 'node:http';
import request from 'supertest';

export { mockBookingClientService };

export class AppTestHelper {
  private app: INestApplication;
  private dataSource: DataSource;
  private httpServer: Server;
  private request: request.SuperTest<request.Test>;

  async init(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MockEventsModule.overrideFrom)
      .useModule(MockEventsModule.forRoot())
      .overrideProvider(BookingClientService)
      .useValue(mockBookingClientService)
      .compile();

    this.app = moduleFixture.createNestApplication();

    const validationPipeOptions: ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    };

    this.app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

    await this.app.init();

    this.dataSource = moduleFixture.get<DataSource>(DataSource);
    this.httpServer = this.app.getHttpServer() as Server;
    this.request = request(
      this.httpServer,
    ) as unknown as request.SuperTest<request.Test>;
  }

  async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  getHttpServer(): Server {
    return this.httpServer;
  }

  getRequest(): request.SuperTest<request.Test> {
    return this.request;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
