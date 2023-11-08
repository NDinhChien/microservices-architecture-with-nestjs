import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TokenService } from './services/token.service';
import { Exception } from '../../gateway/core/Exception';
import { CoreApiResponse } from '../../gateway/core/CoreApiResponse';
import {
  IUserId,
  JwtPayload,
  ICreateTokenResData,
  IValidateTokenPayload,
  IRefreshTokenBody,
} from './token.dto.interfaces';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { TokenServiceConfig } from './services/service.config';

@Controller()
export class TokenController {
  REFRESH_TOKEN_DURATION = TokenServiceConfig.Rule.refreshTokenDuration;
  ACCESS_TOKEN_DURATION = TokenServiceConfig.Rule.accessTokenDuration;

  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  @MessagePattern('create_token')
  public async createToken(
    payload: IUserId,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    const token = await this.tokenService.createToken(payload.userId);
    const accessPayload: JwtPayload = {
      sub: payload.userId.toString(),
      prm: token.access_key,
      exp: Math.floor((Date.now() + this.ACCESS_TOKEN_DURATION) / 1000),
    };
    const refreshPayload: JwtPayload = {
      sub: payload.userId.toString(),
      prm: token.refresh_key,
      exp: Math.floor((Date.now() + this.REFRESH_TOKEN_DURATION) / 1000),
    };

    return CoreApiResponse.new(HttpStatus.CREATED, 'token_create_success', {
      _id: payload.userId,
      accessToken: this.jwtService.sign(accessPayload),
      refreshToken: this.jwtService.sign(refreshPayload),
    });
  }

  @MessagePattern('validate_access_token')
  public async validateAccessToken(
    payload: IValidateTokenPayload,
  ): Promise<CoreApiResponse<JwtPayload>> {
    const { data } = await this.validateToken(payload);
    const token = await this.tokenService.getToken(
      new Types.ObjectId(data.sub),
    );
    if (token && token.access_key === data.prm) {
      return CoreApiResponse.new(HttpStatus.OK, 'token_validate_success', data);
    }
    throw Exception.new(
      HttpStatus.BAD_REQUEST,
      'token_validate_bad_token',
      null,
    );
  }

  @MessagePattern('validate_token')
  public async validateToken(
    payload: IValidateTokenPayload,
  ): Promise<CoreApiResponse<JwtPayload>> {
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = await this.jwtService.verify(payload.token, {
        ignoreExpiration: payload.ignoreExpiration || false,
      });
    } catch (err: any) {
      if (err.name === 'TokenExpiredError')
        throw Exception.new(
          HttpStatus.UNAUTHORIZED,
          'token_validate_expired_token',
          null,
        );
      throw Exception.new(
        HttpStatus.BAD_REQUEST,
        'token_validate_bad_token',
        null,
      );
    }
    return CoreApiResponse.new(
      HttpStatus.OK,
      'token_validate_success',
      jwtPayload,
    );
  }

  @MessagePattern('refresh_token')
  public async refreshToken(
    payload: IRefreshTokenBody,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    let accessPayload: JwtPayload;
    let refreshPayload: JwtPayload;

    let validateRes: CoreApiResponse<JwtPayload>;
    validateRes = await this.validateToken({
      token: payload.accessToken,
      ignoreExpiration: true,
    });
    accessPayload = validateRes.data;

    validateRes = await this.validateToken({
      token: payload.refreshToken,
    });
    refreshPayload = validateRes.data;

    if (accessPayload.sub !== refreshPayload.sub) {
      throw Exception.new(
        HttpStatus.BAD_REQUEST,
        'token_refresh_bad_token',
        null,
      );
    }

    const token = await this.tokenService.getToken(
      new Types.ObjectId(accessPayload.sub),
    );

    if (
      !token ||
      token.access_key !== accessPayload.prm ||
      token.refresh_key !== refreshPayload.prm
    ) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'token_refresh_bad_token',
        null,
      );
    }

    const { data } = await this.createToken({
      userId: new Types.ObjectId(accessPayload.sub),
    });
    return CoreApiResponse.new(HttpStatus.OK, 'token_refresh_success', data);
  }

  @MessagePattern('destroy_token')
  public async destroyToken(payload: IUserId): Promise<CoreApiResponse<null>> {
    await this.tokenService.deleteTokenForUser(payload.userId);
    return CoreApiResponse.new(HttpStatus.OK, 'token_destroy_success', null);
  }
}
