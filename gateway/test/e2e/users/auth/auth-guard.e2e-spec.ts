import { Types } from 'mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { IToken, IUser, TokenSchema, UserSchema } from '../../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { NestApplication } from '@nestjs/core';
import { CoreApiResponse, EnvConfig, JwtPayload } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcrypt';

describe(`Auth guard - authenticate user `, () => {
  let app: NestApplication;
  let tokenModel: Model<IToken>;
  let userModel: Model<IUser>;
  let jwtService: JwtService;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({
          privateKey: EnvConfig.TokenRule.privateKey,
          publicKey: EnvConfig.TokenRule.publicKey,
          signOptions: {
            algorithm: 'RS256',
          },
          verifyOptions: { ignoreExpiration: false },
        }),
        MongooseModule.forRoot(EnvConfig.mongoUri),
        MongooseModule.forFeature([
          {
            name: 'Token',
            schema: TokenSchema,
            collection: 'tokens',
          },
          {
            name: 'User',
            schema: UserSchema,
            collection: 'users',
          },
        ]),
      ],
    }).compile();

    tokenModel = moduleFixture.get(getModelToken('Token'));
    userModel = moduleFixture.get(getModelToken('User'));
    jwtService = moduleFixture.get(JwtService);
    await tokenModel.deleteMany({});
    await userModel.deleteMany({});
    app = moduleFixture.createNestApplication();
    request = supertest(app.getHttpServer());
    await app.init();
  });

  afterAll(async () => {
    await tokenModel.deleteMany({});
    await userModel.deleteMany({});
    await app.close();
  });

  const endpoint = '/users/profile/me';
  const user_id = new Types.ObjectId();
  const access_key = 'abcabcabcabc';
  const email = 'test@email.com';
  const password = hashSync('12345678', 10);

  test(`If token is expired , it should throw 401 (UNAUTHORIZED)`, async () => {
    const payload: JwtPayload = {
      sub: user_id.toString(),
      prm: access_key,
      exp: Date.now() / 1000 - 60,
    };
    const token = jwtService.sign(payload);
    const response: Response = await request.get(endpoint).set({
      authorization: token,
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.data).toBe(null);
  });

  test(`If token is invalid, it should throw 400 (BAD_REQUEST)`, async () => {
    const response: Response = await request.get(endpoint).set({
      authorization: 'invalidtoken',
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.data).toBe(null);
  });

  test(`If there is no token respectively on database (whose _id equals to sub and access_key equals to prm), it should throw 400 (BAD_REQUEST)
  `, async () => {
    const payload: JwtPayload = {
      sub: user_id.toString(),
      prm: access_key,
      exp: Date.now() / 1000 + 60,
    };
    const token = jwtService.sign(payload);

    const response: Response = await request.get(endpoint).set({
      authorization: token,
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.message).toBe('token_validate_bad_token');
    expect(body.data).toBe(null);
  });

  test(`If token is valid and has a respective token on database, authentication should be successful`, async () => {
    await userModel.create({
      _id: user_id,
      email,
      password,
      is_confirmed: true,
    });
    await tokenModel.create({
      _id: user_id,
      access_key,
      refresh_key: 'refreshkey',
    });

    const payload: JwtPayload = {
      sub: user_id.toString(),
      prm: access_key,
      exp: Date.now() / 1000 + 60,
    };
    const token = jwtService.sign(payload);
    const response: Response = await request.get(endpoint).set({
      authorization: token,
    });

    const body: CoreApiResponse<any> = response.body;
    expect(body.status).toBe(HttpStatus.OK);
    expect(body.data).toBeDefined();
  });
});
