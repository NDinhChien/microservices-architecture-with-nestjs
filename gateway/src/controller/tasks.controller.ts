import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Request,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { Auth } from '../decorators/auth.decorator';
import { IAuthorizedRequest } from '../interfaces/authorized-request.interface';
import { CreateTaskBody, CreateTaskRes } from './dto/task/create-task.dto';
import {
  ICreateTaskPayload,
  IDeleteTaskPayload,
  IGetTaskPayload,
  IUpdateTaskPayload,
} from './dto/task/task.dto.interfaces';
import { CoreApiResponse } from '../../core/CoreApiResponse';
import { ITask } from '../interfaces/schemas.interface';
import { IUserId } from './dto/user/user.dto.interfaces';
import { TaskList } from './dto/task/get-tasks.dto';
import { DeleteTaskRes, TaskId, TaskIdParam } from './dto/task/delete-task.dto';
import { Types } from 'mongoose';
import { UpdateTaskBody, UpdateTaskRes } from './dto/task/update-task.dto';
import { GetTaskRes } from './dto/task/get-task.dto';

@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
  constructor(
    @Inject('TASK_SERVICE') private readonly taskServiceClient: ClientProxy,
  ) {}

  @Post()
  @Auth()
  @ApiBearerAuth()
  @ApiBody({ type: CreateTaskBody })
  @ApiResponse({
    type: CreateTaskRes,
  })
  public async createTask(
    @Req() request: IAuthorizedRequest,
    @Body() body: CreateTaskBody,
  ): Promise<CoreApiResponse<ITask>> {
    const payload: ICreateTaskPayload = {
      ...body,
      userId: request.user._id,
    };

    return await firstValueFrom(
      this.taskServiceClient.send('create_task', payload),
    );
  }

  @Get('all')
  @Auth()
  @ApiBearerAuth()
  @ApiResponse({
    type: TaskList,
  })
  public async getUserTasks(
    @Req() request: IAuthorizedRequest,
  ): Promise<CoreApiResponse<ITask[]>> {
    const payload: IUserId = {
      userId: request.user._id,
    };
    return await firstValueFrom(
      this.taskServiceClient.send('get_user_tasks', payload),
    );
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiParam(TaskIdParam)
  @ApiResponse({
    type: GetTaskRes,
  })
  public async getTask(
    @Request() request: IAuthorizedRequest,
    @Param() params: TaskId,
  ): Promise<CoreApiResponse<ITask>> {
    const payload: IGetTaskPayload = {
      id: new Types.ObjectId(params.id),
      userId: request.user._id,
    };
    return await firstValueFrom(
      this.taskServiceClient.send('get_task', payload),
    );
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiParam(TaskIdParam)
  @ApiResponse({
    type: DeleteTaskRes,
  })
  public async deleteTask(
    @Req() request: IAuthorizedRequest,
    @Param() params: TaskId,
  ): Promise<CoreApiResponse<null>> {
    const payload: IDeleteTaskPayload = {
      id: new Types.ObjectId(params.id),
      userId: request.user._id,
    };

    return await firstValueFrom(
      this.taskServiceClient.send('delete_task', payload),
    );
  }

  @Put(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateTaskBody })
  @ApiParam(TaskIdParam)
  @ApiResponse({
    type: UpdateTaskRes,
  })
  public async updateTask(
    @Req() request: IAuthorizedRequest,
    @Param() params: TaskId,
    @Body() body: CreateTaskBody,
  ): Promise<CoreApiResponse<ITask>> {
    const payload: IUpdateTaskPayload = {
      id: new Types.ObjectId(params.id),
      userId: request.user._id,
      task: body,
    };
    return await firstValueFrom(
      this.taskServiceClient.send('update_task', payload),
    );
  }
}
