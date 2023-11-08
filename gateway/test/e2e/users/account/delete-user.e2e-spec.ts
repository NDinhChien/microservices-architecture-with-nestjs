import { Types } from 'mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IUser, UserSchema } from '../../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { NestApplication } from '@nestjs/core';
import { CoreApiResponse, EnvConfig, Role } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { hashSync } from 'bcrypt';

describe(`DELETE users/account/:id - delete account`, () => {
  let app: NestApplication;
  let userModel: Model<IUser>;
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
        ]),
      ],
    }).compile();

    userModel = moduleFixture.get(getModelToken('User'));
    await userModel.deleteMany({});

    app = moduleFixture.createNestApplication();
    request = supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  const endpoint = '/users/account/';
  const _id = new Types.ObjectId();
  const email = 'test@email.com';
  const password = hashSync('12345678', 10);
  const _id2 = new Types.ObjectId();
  const email2 = 'test2@email.com';
  let token: string;
  test(`If user is not admin, it should throw 403 (FORBIDDEN)`, async () => {
    await userModel.create({
      _id,
      email,
      password,
      is_confirmed: true,
      role: Role.USER,
    });
    await userModel.create({
      _id: _id2,
      email: email2,
      password,
      is_confirmed: true,
      role: Role.ADMIN,
    });

    let response: Response = await request.post('/users/login').send({
      email,
      password: '12345678',
    });
    let body: CoreApiResponse<any> = response.body;
    token = body.data.accessToken;

    response = await request.delete(endpoint + _id.toString()).set({
      authorization: token,
    });
    body = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data).toBeDefined(); //{}
  });
  test(`If admin user tries to delete himself/herself, it should throw 403 (FORBIDDEN)`, async () => {
    await userModel.updateOne(
      { _id },
      {
        role: Role.ADMIN,
      },
    );
    const response: Response = await request
      .delete(endpoint + _id.toString())
      .set({
        authorization: token,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.FORBIDDEN);
    expect(body.data.cause).toBeDefined();
  });

  test(`If admin user attempts to delete nonexistent user, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request
      .delete(endpoint + new Types.ObjectId().toString())
      .set({
        authorization: token,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data.cause).toBeDefined();
  });
  test(`If admin user attempts to delete another admin user, it should throw 404 (NOT_FOUND)`, async () => {
    const response: Response = await request
      .delete(endpoint + _id2.toString())
      .set({
        authorization: token,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.NOT_FOUND);
    expect(body.data.cause).toBeDefined();
  });
  test(`If admin user tries to delete a normal user, it should be successful`, async () => {
    await userModel.updateOne(
      { _id: _id2 },
      {
        role: Role.USER,
      },
    );
    const response: Response = await request
      .delete(endpoint + _id2.toString())
      .set({
        authorization: token,
      });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data).toBe(null);
  });
});
