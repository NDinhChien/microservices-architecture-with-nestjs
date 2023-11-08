import { IsString, MaxLength, MinLength } from 'class-validator';
import { IUpdatePasswordBody } from '../user.dto.interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';

export class UpdatePasswordBody implements IUpdatePasswordBody {
  @ApiProperty({ example: '12345678' })
  @MaxLength(30)
  @MinLength(6)
  @IsString()
  old_pwd: string;

  @ApiProperty({ example: '00000000' })
  @MaxLength(30)
  @MinLength(6)
  @IsString()
  new_pwd: string;
}

export class UpdatePasswordRes extends HttpApiResponse {
  @ApiProperty({ example: 'password_update_success' })
  public message: string;
}
