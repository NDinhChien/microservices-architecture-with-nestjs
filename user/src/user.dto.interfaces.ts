import { Types } from 'mongoose';
import { LinkType } from './schemas/constants';

interface IUserId {
  userId: Types.ObjectId;
}

interface IUserLink {
  link: string;
}

interface IUserCredentials {
  email: string;
  password: string;
}

interface IGenUserLinkPayload {
  type: LinkType;
  email: string;
}

interface IUpdateProfileBody {
  firstName?: string;
  lastName?: string;
  intro?: string;
}

interface IUpdateProfilePayload extends IUpdateProfileBody {
  userId: Types.ObjectId;
}

interface IUpdateStatusPayload {
  login_attempts?: number;
  last_try?: Date;
  last_pwd_reset?: Date;
}

interface IUpdatePasswordBody {
  old_pwd: string;
  new_pwd: string;
}

interface IUpdatePasswordPayload extends IUpdatePasswordBody {
  userId: Types.ObjectId;
  hashed_pwd: string;
}

interface IResetPasswordBody {
  email: string;
  new_pwd: string;
}

interface IUpdateUserLinkPayload {
  is_used: boolean;
}

interface IAuthResData {
  is_allowed: boolean;
}

import {
  ICreateTokenResData,
  IRefreshTokenBody,
  JwtPayload,
} from '../../token/src/token.dto.interfaces';

export {
  IUserId,
  IUserLink,
  IUserCredentials,
  IGenUserLinkPayload,
  IUpdateProfileBody,
  IUpdateProfilePayload,
  IUpdateStatusPayload,
  IUpdatePasswordBody,
  IUpdatePasswordPayload,
  IResetPasswordBody,
  IUpdateUserLinkPayload,
  IAuthResData,
  ICreateTokenResData,
  IRefreshTokenBody,
  JwtPayload,
};
