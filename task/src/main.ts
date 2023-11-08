import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { Transport, TcpOptions } from '@nestjs/microservices';

import { TaskServiceConfig } from './services/service.config';
import { AllExceptionFilter } from '../../gateway/core/ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(TaskModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: TaskServiceConfig.port,
    },
  } as TcpOptions);

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen();
}
bootstrap();
