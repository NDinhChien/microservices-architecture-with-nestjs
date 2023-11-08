import { Schema, Types } from 'mongoose';
import { Role } from './constants';

export interface IUser {
  email: string;
  password: string;

  _id: Types.ObjectId;
  is_confirmed: boolean;
  role: Role;

  login_attempts: number;
  last_try: Date | null;
  last_pwd_reset: Date | null;

  created_at: Date;
  updated_at: Date;

  firstName?: string;
  lastName?: string;
  intro?: string;
}

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    is_confirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [Role.ADMIN, Role.USER],
      default: Role.USER,
    },
    password: {
      type: String,
      required: true,
    },

    login_attempts: {
      type: Number,
      default: 0,
    },
    last_try: {
      type: Date,
      default: null,
    },
    last_pwd_reset: {
      type: Date,
      default: null,
    },

    firstName: {
      type: String,
      maxlength: 30,
    },
    lastName: {
      type: String,
      maxlength: 30,
    },
    intro: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  },
);
