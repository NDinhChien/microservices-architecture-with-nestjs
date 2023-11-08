import { Types } from 'mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IToken,
  IUser,
  IUserLink,
  TokenSchema,
  UserLinkSchema,
  UserSchema,
} from '../../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { NestApplication } from '@nestjs/core';
import { CoreApiResponse, EnvConfig } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { hashSync } from 'bcrypt';

describe(`POST users/login - Login User`, () => {
  let app: NestApplication;
  let userModel: Model<IUser>;
  let userLinkModel: Model<IUserLink>;
  let tokenModel: Model<IToken>;
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
          {
            name: 'Token',
            schema: TokenSchema,
            collection: 'tokens',
          },
        ]),
      ],
    }).compile();

    userModel = moduleFixture.get(getModelToken('User'));
    userLinkModel = moduleFixture.get(getModelToken('UserLink'));
    tokenModel = moduleFixture.get(getModelToken('Token'));

    await userModel.deleteMany({});
    await userLinkModel.deleteMany({});
    await tokenModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    request = supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await userLinkModel.deleteMany({});
    await tokenModel.deleteMany({});

    await app.close();
  });

  const endpoint = '/users/login';
  const _id = new Types.ObjectId();
  const email = 'test@email.com';
  const is_confirmed = false;
  const password = hashSync('12345678', 10);
  test(`When user does not exist, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data.cause).toBeDefined();
  });

  test(`User logins with wrong password the first time, it should throw 400 (BAD_REQUEST)`, async () => {
    await userModel.create({
      _id,
      email,
      password,
      is_confirmed,
    });

    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data.try_times_left).toBe(
      EnvConfig.UserRule.maxLoginAttempts - 1,
    ); // 2
  });

  test(`User logins with wrong password the second time, it should throw 400 (BAD_REQUEST)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: any = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data.try_times_left).toBe(
      EnvConfig.UserRule.maxLoginAttempts - 2,
    ); // 1
  });

  test(`User logins with wrong password the final time, it should throw 400 (BAD_REQUEST)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: any = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data.try_times_left).toBe(
      EnvConfig.UserRule.maxLoginAttempts - 3,
    ); //  0
  });

  test(`User logins with wrong password other times, it should throw 403 (FORBIDDEN)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: any = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.try_again_after).toBeDefined();
  });

  test(`User logins again with wrong password after waiting for over RELOGIN_IN time, it should throw 400 (BAD_REQUEST)`, async () => {
    await userModel.findByIdAndUpdate(_id, {
      last_try: new Date(Date.now() - EnvConfig.UserRule.reloginIn - 1000),
    });
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: any = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data.try_times_left).toBe(
      EnvConfig.UserRule.maxLoginAttempts - 1,
    ); // 2
  });

  test(`User logins with right password, it should be successfull`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '12345678',
    });

    const body: any = response.body;

    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data._id).toBeDefined();
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  test(`User logins with wrong password, it should throw 400 (BAD_REQUEST)`, async () => {
    const response: Response = await request.post(endpoint).send({
      email: email,
      password: '00000000',
    });

    const body: any = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data.try_times_left).toBe(
      EnvConfig.UserRule.maxLoginAttempts - 1,
    ); // 2
  });
});
