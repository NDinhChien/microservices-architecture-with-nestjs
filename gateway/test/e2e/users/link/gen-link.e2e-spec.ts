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

  const endpoint = '/users/link';
  const _id = new Types.ObjectId();
  const email = 'test@email.com';
  const password = hashSync('12345678', 10);

  test(`When user does not exist, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.CONFIRM })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data).toBe(null);
  });
  test(`If type is CONFIRM and user is already confirmed, it should throw 403 (FORBIDDEN)`, async () => {
    await userModel.create({
      _id,
      email,
      password,
      is_confirmed: true,
    });

    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.CONFIRM })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.cause).toBeDefined();
  });
  test(`If CONFIRM link for unconfirmed user, it should issue user link`, async () => {
    await userModel.findByIdAndUpdate(_id, {
      is_confirmed: false,
    });

    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.CONFIRM })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data.link_expired_at).toBeDefined();
  });

  test(`Try to issue CONFIRM link again (in MAILSEND_DURATION times), it should throw 403 (FORBIDDEN)`, async () => {
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.CONFIRM })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.try_again_after).toBeDefined();
  });

  test(`Issue RESETPW link for user who reset the first time, it should issue user link`, async () => {
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.RESETPW })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data.link_expired_at).toBeDefined();
  });
  test(`Issue RESETPW link for user whose last reset time is a long time ago, it should issue user link`, async () => {
    await userLinkModel.deleteMany({});
    await userModel.findByIdAndUpdate(_id, {
      last_pwd_reset: new Date(
        Date.now() - EnvConfig.UserRule.mailSendDuration - 2000,
      ),
    });
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.RESETPW })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data.link_expired_at).toBeDefined();
  });

  test(`Issue RESETPW link again, it should throw 403 (FORBIDDEN)`, async () => {
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.RESETPW })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.try_again_after).toBeDefined();
  });

  test(`If type is RESETPW and user has just reset password recently, it should throw 403 (FORBIDDEN)`, async () => {
    await userModel.findByIdAndUpdate(_id, {
      last_pwd_reset: new Date(),
    });
    const response: Response = await request
      .post(endpoint)
      .query({ type: LinkType.RESETPW })
      .send({
        email: email,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.try_again_after).toBeDefined();
    expect(body.data.cause).toBeDefined();
  });
});
