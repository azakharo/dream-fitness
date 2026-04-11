import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { MockEventsModule } from '../mocks/events.module.mock';
import { DataSource } from 'typeorm';
import { INestApplication, ValidationPipeOptions } from '@nestjs/common';
import request from 'supertest';

export class AppTestHelper {
  private app: INestApplication;
  private dataSource: DataSource;
  private httpServer: any;
  private request: request.SuperTest<request.Test>;

  async init(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MockEventsModule.overrideFrom)
      .useModule(MockEventsModule.forRoot())
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
    this.httpServer = this.app.getHttpServer();
    this.request = request(this.httpServer);
  }

  async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  getHttpServer(): any {
    return this.httpServer;
  }

  getRequest(): request.SuperTest<request.Test> {
    return this.request;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
