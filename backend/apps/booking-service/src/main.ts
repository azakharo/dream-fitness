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

  // Health check endpoint
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_, res) => {
    res.json({ status: 'ok', service: 'booking-service' });
  });

  const config = new DocumentBuilder()
    .setTitle('Booking Service API')
    .setDescription('Booking and waitlist management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.BOOKING_SERVICE_PORT || 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`Booking Service is running on port ${port}`);
}
void bootstrap();
