import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IResetPasswordBody } from '../user.dto.interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';

export class ResetPasswordBody implements IResetPasswordBody {
  @ApiProperty({ example: 'test@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '00000000' })
  @MaxLength(30)
  @MinLength(6)
  @IsString()
  new_pwd: string;
}

export class ResetPasswordRes extends HttpApiResponse {
  @ApiProperty({ example: 'password_reset_success' })
  public message: string;
}
