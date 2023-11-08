import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ITask } from '../schemas/task.schema';
import { ICreateTaskPayload, IUpdateTaskBody } from '../task.dto.interfaces';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private readonly taskModel: Model<ITask>) {}

  public async createTask(payload: ICreateTaskPayload): Promise<ITask> {
    const { userId, ...body } = payload;

    return (
      await this.taskModel.create({ user_id: userId, ...body })
    ).toObject();
  }

  public async getUserTasks(userId: Types.ObjectId): Promise<ITask[]> {
    return await this.taskModel.find({ user_id: userId }).lean().exec();
  }

  public async getTaskById(id: Types.ObjectId): Promise<ITask | null> {
    return await this.taskModel.findById(id).lean().exec();
  }

  public async removeTaskById(id: Types.ObjectId): Promise<any> {
    return await this.taskModel.deleteOne({ _id: id }).exec();
  }

  public async removeTask(
    id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ITask | null> {
    return await this.taskModel
      .findOneAndDelete({ _id: id, user_id: userId })
      .lean()
      .exec();
  }

  public async updateTask(
    id: Types.ObjectId,
    userId: Types.ObjectId,
    payload: IUpdateTaskBody,
  ): Promise<ITask | null> {
    return await this.taskModel
      .findOneAndUpdate({ _id: id, user_id: userId }, payload, { new: true })
      .lean()
      .exec();
  }
}
