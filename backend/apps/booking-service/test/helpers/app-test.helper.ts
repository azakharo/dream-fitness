import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { mockAuthClientService } from '../mocks/auth-client.mock';
import { mockTrainingClientService } from '../mocks/training-client.mock';
import { AuthClientService } from '../../src/clients/auth-client.service';
import { TrainingClientService } from '../../src/clients/training-client.service';
import { DataSource } from 'typeorm';
import { Server } from 'node:http';
import request from 'supertest';

export class AppTestHelper {
  private app: INestApplication;
  private dataSource: DataSource;
  private httpServer: Server;
  private request: request.SuperTest<request.Test>;

  async init(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthClientService)
      .useValue(mockAuthClientService)
      .overrideProvider(TrainingClientService)
      .useValue(mockTrainingClientService)
      .compile();

    this.app = moduleFixture.createNestApplication();

    const validationPipeOptions = {
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

  getApp(): INestApplication {
    return this.app;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
