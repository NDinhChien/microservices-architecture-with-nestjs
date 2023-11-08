import { Transport } from '@nestjs/microservices';

export class ServiceConfig {
  public static readonly baseUri: string = 'http://localhost';
  public static readonly port: number = Number(
    process.env.API_GATEWAY_PORT || '8000',
  );
  public static mongoUri: string = process.env.MONGO_URI || '';

  public static readonly taskService = {
    options: {
      host: 'localhost',
      port: Number(process.env.TASK_SERVICE_PORT || '8001'),
    },
    transport: Transport.TCP,
  };

  public static readonly userService = {
    options: {
      host: 'localhost',
      port: Number(process.env.USER_SERVICE_PORT || '8003'),
    },
    transport: Transport.TCP,
  };
}
