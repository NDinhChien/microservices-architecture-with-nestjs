import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from '../schemas/user.schema';
import { IUserLink } from '../schemas/user-link.schema';
import { UserServiceConfig } from './service.config';
import { LinkType, Role } from '../schemas/constants';
import { IUpdateUserLinkPayload } from '../user.dto.interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserLink') private readonly userLinkModel: Model<IUserLink>,
  ) {}

  public async createUser(email: string, password: string): Promise<IUser> {
    const user = await this.userModel.create({
      email,
      password,
    });

    return user.toObject();
  }

  public async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.userModel.findOne({ email }).lean().exec();
  }

  public async getUserById(id: Types.ObjectId): Promise<IUser | null> {
    return await this.userModel.findById(id).lean().exec();
  }

  public async updateUser(
    id: Types.ObjectId,
    payload: any,
  ): Promise<IUser | null> {
    return await this.userModel
      .findOneAndUpdate({ _id: id }, payload, { new: true })
      .lean()
      .exec();
  }

  public async deleteUser(id: Types.ObjectId): Promise<IUser | null> {
    return await this.userModel
      .findOneAndDelete({ _id: id, role: Role.USER })
      .lean()
      .exec();
  }

  public async createUserLink(
    user_id: Types.ObjectId,
    type: LinkType,
  ): Promise<IUserLink> {
    return await this.userLinkModel
      .findOneAndUpdate(
        { user_id, type },
        { link: this.generateLink() },
        { upsert: true, new: true },
      )
      .lean()
      .exec();
  }

  public async getUserLink(link: string): Promise<IUserLink | null> {
    return await this.userLinkModel.findOne({ link }).lean().exec();
  }

  public async getUserLinkByUserId(
    user_id: Types.ObjectId,
    type: LinkType,
  ): Promise<IUserLink | null> {
    return await this.userLinkModel.findOne({ type, user_id }).lean().exec();
  }

  public async updateUserLink(
    id: Types.ObjectId,
    payload: IUpdateUserLinkPayload,
  ): Promise<IUserLink> {
    return await this.userLinkModel
      .findOneAndUpdate({ _id: id }, payload, { new: true, upsert: true })
      .lean()
      .exec();
  }

  public async deleteLinkForUser(
    user_id: Types.ObjectId,
    type: LinkType,
  ): Promise<void> {
    await this.userLinkModel.deleteMany({ user_id, type }).exec();
  }

  public getUrl(path: string): string {
    return `${UserServiceConfig.gateway.baseUri}:${UserServiceConfig.gateway.port}${path}`;
  }

  public generateLink() {
    let link = '';
    for (let i = 0; i < 3; i++)
      link += Math.random().toString(36).replace('0.', '');
    return link;
  }
}
