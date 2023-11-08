import { IUserLink } from '../user.dto.interfaces';
import { IsString } from 'class-validator';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { ApiProperty, ApiQueryOptions } from '@nestjs/swagger';

export class UserLink implements IUserLink {
  @ApiProperty({ example: 'abcabcabcabc' })
  @IsString()
  link: string;
}

export const UserLinkQuery: ApiQueryOptions = {
  name: 'link',
  type: String,
  required: true,
};

export class ConfirmLinkRes extends HttpApiResponse {
  @ApiProperty({ example: 'link_confirm_success' })
  public message: string;
}
