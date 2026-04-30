import 'dotenv/config'; // Ensure this is at the very top
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow frontend to talk to backend
  await app.listen(3000); // Change this to 3000
 
}
bootstrap();