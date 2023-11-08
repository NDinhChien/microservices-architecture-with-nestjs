import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IToken } from '../schemas/token.schema';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<IToken>,
  ) {}

  public async createToken(userId: Types.ObjectId): Promise<IToken> {
    return await this.tokenModel
      .findOneAndUpdate(
        { _id: userId },
        {
          access_key: this.generateKeyString(),
          refresh_key: this.generateKeyString(),
        },
        { new: true, upsert: true },
      )
      .lean()
      .exec();
  }

  public async getToken(userId: Types.ObjectId): Promise<IToken | null> {
    return await this.tokenModel.findOne({ _id: userId }).lean().exec();
  }
  public async deleteTokenForUser(userId: Types.ObjectId): Promise<any> {
    return await this.tokenModel
      .deleteOne({
        _id: userId,
      })
      .exec();
  }

  public generateKeyString() {
    return randomBytes(64).toString();
  }
}
