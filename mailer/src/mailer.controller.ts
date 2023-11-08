import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MailerServiceConfig } from './services/service.config';
import { MailerService } from './services/mailer.service';
import { Exception } from '../../gateway/core/Exception';
import { CoreApiResponse } from '../../gateway/core/CoreApiResponse';
import * as validator from 'class-validator';
import { IMailPayload } from './mailer.dto.interfaces';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern('send_mail')
  public async sendMail(payload: IMailPayload): Promise<CoreApiResponse<null>> {
    if (
      !payload ||
      !payload.to ||
      !payload.html ||
      !validator.isEmail(payload.to)
    ) {
      throw Exception.new(
        HttpStatus.BAD_REQUEST,
        'mail_send_bad_request',
        null,
      );
    }
    if (!MailerServiceConfig.emailsDisabled) {
      await this.mailerService.sendMail({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      return CoreApiResponse.new(
        HttpStatus.ACCEPTED,
        'mail_send_success',
        null,
      );
    }
    return CoreApiResponse.new(
      HttpStatus.SERVICE_UNAVAILABLE,
      'mail_send_disabled',
      null,
    );
  }
}
