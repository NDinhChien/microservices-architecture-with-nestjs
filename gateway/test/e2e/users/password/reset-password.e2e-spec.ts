import { Types } from 'mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IUser, IUserLink, UserLinkSchema, UserSchema } from '../../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { NestApplication } from '@nestjs/core';
import { CoreApiResponse, EnvConfig, LinkType } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { hashSync } from 'bcrypt';

describe(`GET users/link - Generate user link`, () => {
  let app: NestApplication;
  let userModel: Model<IUser>;
  let userLinkModel: Model<IUserLink>;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(EnvConfig.mongoUri),
        MongooseModule.forFeature([
          {
            name: 'User',
            schema: UserSchema,
            collection: 'users',
          },
          {
            name: 'UserLink',
            schema: UserLinkSchema,
            collection: 'user_links',
          },
        ]),
      ],
    }).compile();

    userModel = moduleFixture.get(getModelToken('User'));
    userLinkModel = moduleFixture.get(getModelToken('UserLink'));
    await userModel.deleteMany({});
    await userLinkModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    request = supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await userLinkModel.deleteMany({});
    await app.close();
  });

  const endpoint = '/users/password/reset';
  const _id = new Types.ObjectId();
  const email = 'test@email.com';
  const password = hashSync('12345678', 10);
  const user_link_id = new Types.ObjectId();
  const link = 'abcabcabcabc';

  test(`if user does not exist, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email,
      new_pwd: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data).toBe(null);
  });

  test(`if there is no RESETPW link of user, it should throw 404 (NOT_FOUND)`, async () => {
    await userModel.create({
      _id,
      email,
      password,
    });
    const response: Response = await request.post(endpoint).send({
      email: email,
      new_pwd: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.message).toBe('password_reset_link_not_found');
  });

  test(`if RESETPW link is not confirmed, it should throw 403 (FORBIDDEN)`, async () => {
    await userLinkModel.create({
      _id: user_link_id,
      user_id: _id,
      type: LinkType.RESETPW,
      link,
    });
    const response: Response = await request.post(endpoint).send({
      email: email,
      new_pwd: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.cause).toBeDefined();
  });

  test(`if RESETPW link is just confirmed (is_used=true) in RESET_PWD_IN times, it should update user password`, async () => {
    await userLinkModel.findByIdAndUpdate(user_link_id, {
      is_used: true,
    });
    const response: Response = await request.post(endpoint).send({
      email: email,
      new_pwd: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data).toBe(null);
  });

  test(`if RESETPW link is confirmed some time ago (exceed RESET_PWD_IN), it should throw 403 (FORBIDDEN)`, async () => {
    await userLinkModel.deleteMany({});
    await userLinkModel.create({
      _id: user_link_id,
      user_id: _id,
      type: LinkType.RESETPW,
      link,
      is_used: true,
      created_at: new Date(Date.now() - EnvConfig.UserRule.resetPwdIn - 2000),
      updated_at: new Date(Date.now() - EnvConfig.UserRule.resetPwdIn - 2000),
    });
    const response: Response = await request.post(endpoint).send({
      email: email,
      new_pwd: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.cause).toBeDefined();
  });
});
