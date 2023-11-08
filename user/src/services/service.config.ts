import { Transport } from '@nestjs/microservices';
export class UserServiceConfig {
  public static port: number = Number(process.env.USER_SERVICE_PORT || '8003');
  public static mongoUri: string = process.env.MONGO_URI || '';

  public static gateway = {
    port: Number(process.env.API_GATEWAY_PORT || '8000'),
    baseUri: 'http://localhost',
  };

  public static mailerService = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: Number(process.env.MAILER_SERVICE_PORT || '8004'),
    },
  };

  public static tokenService = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: Number(process.env.TOKEN_SERVICE_PORT || '8002'),
    },
  };

  public static Rule = {
    linkValidIn: Number(process.env.LINK_VALID_IN || '0'),
    maxLoginAttempts: Number(process.env.LOGIN_ATTEMPTS || '0'),
    reloginIn: Number(process.env.RELOGIN_IN || '0'),
    mailSendDuration: Number(process.env.MAILSEND_DURATION || '0'),
    resetPwdIn: Number(process.env.RESET_PWD_IN || '0'),
  };
}
