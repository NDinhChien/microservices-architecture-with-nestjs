import { Module } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { MailerService } from './services/mailer.service';

@Module({
  imports: [],
  providers: [MailerService],
  controllers: [MailerController],
})
export class AppMailerModule {}
