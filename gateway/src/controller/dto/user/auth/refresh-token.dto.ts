import { ApiProperty } from '@nestjs/swagger';
import {
  ICreateTokenResData,
  IRefreshTokenBody,
} from '../../token/token.dto.interfaces';
import { IsString } from 'class-validator';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';

export class RefreshTokenBody implements IRefreshTokenBody {
  @ApiProperty({ example: 'an access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'a refresh token' })
  @IsString()
  refreshToken: string;
}

export class RefreshTokenRes extends HttpApiResponse {
  @ApiProperty({ example: 'token_refresh_success' })
  public message: string;

  @ApiProperty({
    example: {
      _id: 'aaabbbcccdddeeeffff',
      accessToken: 'a new access token',
      refreshToken: 'a new refresh token',
    },
  })
  public data: ICreateTokenResData;
}
