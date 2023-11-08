import { Types } from 'mongoose';

interface IUserId {
  userId: Types.ObjectId;
}
interface ITokenString {
  token: string;
}

interface IValidateTokenPayload extends ITokenString {
  ignoreExpiration?: boolean;
}

interface IRefreshTokenBody {
  accessToken: string;
  refreshToken: string;
}

interface ICreateTokenResData {
  _id: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
  prm: string;
}

export {
  IUserId,
  ITokenString,
  IValidateTokenPayload,
  IRefreshTokenBody,
  ICreateTokenResData,
  JwtPayload,
};
