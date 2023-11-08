import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IUpdateProfileBody, Role } from '../user.dto.interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { Types } from 'mongoose';

export class UpdateProfileBody implements IUpdateProfileBody {
  @ApiProperty({ example: 'Dinh' })
  @IsOptional()
  @MaxLength(30)
  @MinLength(3)
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Chien' })
  @IsOptional()
  @MaxLength(30)
  @MinLength(3)
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'Hello world.' })
  @IsOptional()
  @MaxLength(2000)
  @MinLength(3)
  @IsString()
  intro?: string;
}

export class UpdateProfileResData {
  @ApiProperty({ example: 'aaabbbcccdddeeefff12345' })
  _id: Types.ObjectId;

  @ApiProperty({ example: 'test@email.com' })
  email: string;

  @ApiProperty({ example: true })
  is_confirmed: boolean;

  @ApiProperty({ example: 'user' })
  role: Role;

  @ApiProperty({ example: 'Dinh' })
  firstName: string;

  @ApiProperty({ example: 'Chien' })
  lastName: string;

  @ApiProperty({ example: 'Hello world.' })
  intro: string;
}

export class UpdateProfileRes extends HttpApiResponse {
  @ApiProperty({ example: 'profile_update_success' })
  public message: string;

  @ApiProperty({ type: UpdateProfileResData })
  public data: UpdateProfileResData;
}
