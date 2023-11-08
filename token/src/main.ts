import { NestFactory } from '@nestjs/core';
import { Transport, TcpOptions } from '@nestjs/microservices';

import { TokenModule } from './token.module';
import { TokenServiceConfig } from './services/service.config';
import { AllExceptionFilter } from '../../gateway/core/ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(TokenModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: TokenServiceConfig.port,
    },
  } as TcpOptions);

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen();
}
bootstrap();
