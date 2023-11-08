import { HttpStatus, Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ServiceConfig } from './services/service.config';
import { UsersController } from './controller/users.controller';
import { TasksController } from './controller/tasks.controller';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ToHttpExceptionFilter } from '../core/ExceptionFilter';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Exception } from '../core/Exception';

@Module({
  controllers: [UsersController, TasksController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ToHttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true,
          stopAtFirstError: true,
          exceptionFactory: (errors) => {
            const messages = errors[0].constraints;
            throw Exception.new(
              HttpStatus.BAD_REQUEST,
              'use_case_bad_request',
              messages,
            );
          },
        });
      },
    },
    {
      provide: 'USER_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create(ServiceConfig.userService as any);
      },
    },
    {
      provide: 'TASK_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create(ServiceConfig.taskService as any);
      },
    },
  ],
})
export class AppModule {}
