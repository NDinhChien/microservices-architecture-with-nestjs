import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { AllExceptionFilter } from '../../gateway/core/ExceptionFilter';
import { UserServiceConfig } from './services/service.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UserModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: UserServiceConfig.port,
    },
  } as TcpOptions);

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen();
}
bootstrap();
