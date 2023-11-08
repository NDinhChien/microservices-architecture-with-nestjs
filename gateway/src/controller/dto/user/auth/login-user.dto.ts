import { IUserCredentials } from '../user.dto.interfaces';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { ICreateTokenResData } from '../../token/token.dto.interfaces';

export class UserCredentials implements IUserCredentials {
  @ApiProperty({ example: 'test@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: 'string', example: '12345678' })
  @MaxLength(30)
  @MinLength(6)
  @IsString()
  password: string;
}

export class LoginUserRes extends HttpApiResponse {
  @ApiProperty({ example: 'user_login_success' })
  public message: string;

  @ApiProperty({
    example: {
      _id: 'aaabbbcccdddeeefff',
      accessToken: 'an access token',
      refreshToken: 'a refresh token',
    },
  })
  data: ICreateTokenResData;
}
