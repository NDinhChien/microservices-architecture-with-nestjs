import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { TaskService } from './services/task.service';
import { CoreApiResponse } from '../../gateway/core/CoreApiResponse';
import { Exception } from '../../gateway/core/Exception';
import { ITask } from './schemas/task.schema';
import {
  IUpdateTaskPayload,
  IUserId,
  IDeleteTaskPayload,
  ICreateTaskPayload,
  IGetTaskPayload,
} from './task.dto.interfaces';
import { Types } from 'mongoose';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @MessagePattern('create_task')
  public async createTask(
    payload: ICreateTaskPayload,
  ): Promise<CoreApiResponse<ITask>> {
    const task = await this.taskService.createTask(payload);
    return CoreApiResponse.new(HttpStatus.CREATED, 'task_create_success', task);
  }

  @MessagePattern('get_user_tasks')
  public async getUserTasks(
    payload: IUserId,
  ): Promise<CoreApiResponse<ITask[]>> {
    payload.userId = new Types.ObjectId(payload.userId);

    const tasks = await this.taskService.getUserTasks(payload.userId);
    return CoreApiResponse.new(HttpStatus.OK, 'tasks_get_success', tasks);
  }

  @MessagePattern('get_task')
  public async getTaskById(
    payload: IGetTaskPayload,
  ): Promise<CoreApiResponse<ITask>> {
    const task = await this.taskService.getTaskById(payload.id);
    if (!task) {
      throw Exception.new(HttpStatus.NOT_FOUND, 'task_get_not_found', null);
    }
    if (task.user_id.equals(payload.userId))
      return CoreApiResponse.new(HttpStatus.OK, 'task_get_success', task);
    throw Exception.new(HttpStatus.FORBIDDEN, 'task_get_forbidden', null);
  }

  @MessagePattern('delete_task')
  public async deleteTaskForUser(
    payload: IDeleteTaskPayload,
  ): Promise<CoreApiResponse<null>> {
    const task = await this.taskService.removeTask(payload.id, payload.userId);

    if (!task) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'task_delete_not_found_or_forbidden',
        null,
      );
    }

    return CoreApiResponse.new(HttpStatus.OK, 'task_delete_success', null);
  }

  @MessagePattern('update_task')
  public async updateTask(
    payload: IUpdateTaskPayload,
  ): Promise<CoreApiResponse<ITask>> {
    const updatedTask: ITask | null = await this.taskService.updateTask(
      payload.id,
      payload.userId,
      payload.task,
    );
    if (!updatedTask) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'task_update_not_found_or_forbidden',
        null,
      );
    }
    return CoreApiResponse.new(
      HttpStatus.OK,
      'task_update_success',
      updatedTask,
    );
  }
}
