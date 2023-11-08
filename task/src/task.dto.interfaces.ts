import { Types } from 'mongoose';

interface ITaskId {
  id: Types.ObjectId;
}

interface IUserId {
  userId: Types.ObjectId;
}

interface IGetTaskPayload extends ITaskId, IUserId {}

interface ICreateTaskBody {
  name: string;
  start_time: Date;
  duration: number;
  description?: string;
}

interface ICreateTaskPayload extends ICreateTaskBody {
  userId: Types.ObjectId;
}

interface IUpdateTaskBody {
  is_solved?: boolean;

  name?: string;
  start_time?: Date;
  duration?: number;

  description?: string;
}

interface IUpdateTaskPayload {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  task: IUpdateTaskBody;
}

interface IDeleteTaskPayload {
  id: Types.ObjectId;
  userId: Types.ObjectId;
}

export {
  ITaskId,
  IUserId,
  IGetTaskPayload,
  ICreateTaskBody,
  ICreateTaskPayload,
  IUpdateTaskBody,
  IUpdateTaskPayload,
  IDeleteTaskPayload,
};
