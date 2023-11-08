import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HandleBarService {
  private readonly confirmationTemplate: handlebars.TemplateDelegate;
  private readonly passwordResetTemplate: handlebars.TemplateDelegate;

  constructor() {
    this.confirmationTemplate = this.loadTemplate('confirmation.hbs');
    this.passwordResetTemplate = this.loadTemplate('password-reset.hbs');
  }

  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatesFolderPath = path.join(__dirname, '../templates');
    const templatePath = path.join(templatesFolderPath, templateName);

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }

  public genConfirmationHtml(firstName: string, url: string): string {
    return this.confirmationTemplate({
      name: firstName,
      url,
    });
  }
  public genPasswordResetHtml(firstName: string, url: string): string {
    return this.passwordResetTemplate({
      name: firstName,
      url,
    });
  }
}
