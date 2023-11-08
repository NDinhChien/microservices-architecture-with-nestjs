import { Request } from 'express';
import { IUser } from './schemas.interface';

export interface IAuthorizedRequest extends Request {
  user: IUser;
}
