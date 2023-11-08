export type CreateExceptionPayload<TData> = {
  message?: string;
  status?: number;
  data?: TData;
};

export class Exception<TData> extends Error {
  
  public readonly status: number;

  public readonly data: TData|null;

  private constructor(
    status?: number,
    message?: string,
    data?: TData,
  ) {
    super();
    this.name = this.constructor.name;
    this.message = message || 'Internal server error.';
    this.status = status || 500;
    this.data = data || null;

    Error.captureStackTrace(this, this.constructor);
  }

  public static new<TData>(
    status?: number,
    message?: string,
    data?: TData,
  ): Exception<TData> {
    return new Exception(status, message, data);
  }
}


