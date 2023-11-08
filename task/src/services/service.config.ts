export class TaskServiceConfig {
  public static readonly port: number = Number(
    process.env.TASK_SERVICE_PORT || '8001',
  );
  public static readonly mongoUri: string = process.env.MONGO_URI || '';
}
