import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMailPayload } from '../mailer.dto.interfaces';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'yesenia48@ethereal.email',
        pass: '9NGSNj8YKkBHe6tjnh',
      },
    });
  }

  public async sendMail(payload: IMailPayload): Promise<void> {
    const info = await this.transporter.sendMail(payload);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
