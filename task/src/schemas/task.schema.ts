import { Schema, Types } from 'mongoose';

export interface ITask {
  user_id: Types.ObjectId;
  name: string;
  start_time: Date;
  duration: number;

  _id: Types.ObjectId;
  is_solved: boolean;
  created_at: Date;
  updated_at: Date;

  description?: string;
}

export const TaskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    is_solved: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  },
);
