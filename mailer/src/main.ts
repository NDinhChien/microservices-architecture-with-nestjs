import { NestFactory } from '@nestjs/core';
import { Transport, TcpOptions } from '@nestjs/microservices';
import { MailerServiceConfig } from './services/service.config';
import { AppMailerModule } from './mailer.module';
import { AllExceptionFilter } from '../../gateway/core/ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppMailerModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: MailerServiceConfig.port,
    },
  } as TcpOptions);

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen();
}
bootstrap();
