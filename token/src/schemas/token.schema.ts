import { Schema, Types } from 'mongoose';

export interface IToken {
  _id: Types.ObjectId; // userId

  access_key: string;
  refresh_key: string;
  created_at: Date;
  updated_at: Date;
}

export const TokenSchema = new Schema<IToken>(
  {
    access_key: {
      type: String,
      required: true,
    },
    refresh_key: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
