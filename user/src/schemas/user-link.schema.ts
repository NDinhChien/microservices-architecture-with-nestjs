import { Schema, Types } from 'mongoose';
import { LinkType } from './constants';

export interface IUserLink {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;

  link: string;
  type: LinkType;
  is_used: boolean;
  created_at: Date;
  updated_at: Date;
}

export const UserLinkSchema = new Schema<IUserLink>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    is_used: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [LinkType.CONFIRM, LinkType.RESETPW],
      default: LinkType.CONFIRM,
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

UserLinkSchema.index({ type: 1, userId: 1 });
UserLinkSchema.index({ link: 1 });
