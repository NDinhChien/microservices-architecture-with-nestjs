export class MailerServiceConfig {
  public static emailsDisabled: boolean =
    process.env.MAILER_DISABLED === 'true';
  public static port: number = Number(
    process.env.MAILER_SERVICE_PORT || '8004',
  );
}
