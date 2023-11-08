import { Catch, Logger, RpcExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { Exception } from './Exception';
import { CoreApiResponse } from './CoreApiResponse';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { Error as MongoError } from 'mongoose'

export function handle (exception: Error): {
  errorMessage: string,
  res: CoreApiResponse<any>
} {
  
  const { status, message, data} = exception as any;
  let errorMessage: string = `${message}` || 'internal_server_error';
  let res : CoreApiResponse<any> = CoreApiResponse.new(status||500, errorMessage, data||null);

  if (exception instanceof Exception) {
    errorMessage = exception.message;
    res = CoreApiResponse.new(exception.status, errorMessage, exception.data);
  }

  else if (exception instanceof RpcException) {

    const error = exception.getError();
    if (isObject(error)) {
      const { status, message, data} = error as any;
      errorMessage = message;
      res = CoreApiResponse.new(status, message, data);
    }

    else if (typeof error === 'string') {
      errorMessage = error;
      res = CoreApiResponse.new(500, errorMessage, null)
    }
  }
  
  else if (exception instanceof HttpException) {
    errorMessage = exception.message;
    res = CoreApiResponse.new(exception.getStatus(), errorMessage, {
      cause: exception.cause,
    })
  }

  else if (exception instanceof MongoError ) {

    errorMessage = `${exception.message}`;
    res = CoreApiResponse.new(500, errorMessage, null);
  
  }
  return {
    errorMessage,
    res
  }
}

@Catch()
export class AllExceptionFilter implements RpcExceptionFilter<Error> {

  catch(exception: Error, host: ArgumentsHost): Observable<any> {

    const { errorMessage, res } = handle(exception);
    
    Logger.error(
      `Error: ${errorMessage};`,
    );
    return throwError(() => res)
  }
}

@Catch()
export class ToHttpExceptionFilter implements RpcExceptionFilter<Error> {

  catch(exception: Error, host: ArgumentsHost): any {

    const request = host.switchToHttp().getRequest();
    const response = host.switchToHttp().getResponse();

    const {errorMessage, res} = handle(exception);

    Logger.error(
      
      `Error: ${errorMessage}; ` +
      `Method:  ${request.method}; ` +
      `Path: ${request.path}; ` 
    );

    response.json(res);
  }
}