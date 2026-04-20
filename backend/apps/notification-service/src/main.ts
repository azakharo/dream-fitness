import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('API for managing user notifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/notification-service', app, document);

  const port = process.env.NOTIFICATION_SERVICE_PORT || 3004;
  await app.listen(port);
  console.log(`Notification Service is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start Notification Service:', err);
  process.exit(1);
});
