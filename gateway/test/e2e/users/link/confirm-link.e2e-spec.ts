import { Types } from 'mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IUserLink, UserLinkSchema } from '../../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { NestApplication } from '@nestjs/core';
import { CoreApiResponse, EnvConfig, LinkType } from '../utils';
import { HttpStatus } from '@nestjs/common';

describe(`GET users/link/confirm?link=abcabcabcabc - Confirm user link`, () => {
  let app: NestApplication;
  let userLinkModel: Model<IUserLink>;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(EnvConfig.mongoUri),
        MongooseModule.forFeature([
          {
            name: 'UserLink',
            schema: UserLinkSchema,
            collection: 'user_links',
          },
        ]),
      ],
    }).compile();

    userLinkModel = moduleFixture.get(getModelToken('UserLink'));
    await userLinkModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    request = supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    await userLinkModel.deleteMany({});
    await app.close();
  });

  const _id = new Types.ObjectId();
  const endpoint = '/users/link/confirm';
  const user_id = new Types.ObjectId();
  const link = 'abcabcabcabc';
  const resetpw_link_id = new Types.ObjectId();
  const resetpw_link = 'defdefdefdef';

  test(`When link does not exist, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request.get(endpoint).query({ link });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data).toBe(null);
  });
  test(`If link is expired (over LINK_VALID_IN since creation), it should throw 403 (FORBIDDEN)`, async () => {
    await userLinkModel.create({
      _id,
      user_id,
      link,
      type: LinkType.CONFIRM,
      is_used: false,
      created_at: new Date(Date.now() - EnvConfig.UserRule.linkValidIn - 2000),
      updated_at: new Date(Date.now() - EnvConfig.UserRule.linkValidIn - 2000),
    });

    const response: Response = await request.get(endpoint).query({ link });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.issued_at).toBeDefined();
    expect(body.data.expired_at).toBeDefined();
  });

  test(`If link type is CONFIRM, it should update user confirmation status, then delete the link`, async () => {
    await userLinkModel.deleteOne({ _id });
    await userLinkModel.create({
      _id,
      user_id,
      link,
      type: LinkType.CONFIRM,
      is_used: false,
    });
    const response: Response = await request.get(endpoint).query({ link });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data.congrats).toBeDefined();
  });

  test(`If link type is RESETPW, it should update link status (is_used=true)`, async () => {
    await userLinkModel.create({
      _id: resetpw_link_id,
      user_id,
      link: resetpw_link,
      type: LinkType.RESETPW,
      is_used: false,
    });
    const response: Response = await request
      .get(endpoint)
      .query({ link: resetpw_link });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data.redirect).toBeDefined();
    expect(body.data.is_valid_before).toBeDefined();
  });
  test(`If link type is RESETPW, and is used already (is_used: true), it should throw 403 (FORBIDDEN)`, async () => {
    const response: Response = await request
      .get(endpoint)
      .query({ link: resetpw_link });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.cause).toBeDefined();
  });
});
