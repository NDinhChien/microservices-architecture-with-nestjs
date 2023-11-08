import { ApiProperty, ApiQueryOptions } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { LinkType } from '../user.dto.interfaces';
import { IsEmail, IsEnum } from 'class-validator';

export class GenUserLinkRes extends HttpApiResponse {
  @ApiProperty({ example: 'link_generate_success' })
  public message: string;
}

export const GenUserLinkQuery: ApiQueryOptions = {
  name: 'type',
  required: true,
  enum: LinkType,
  example: LinkType.CONFIRM,
  type: String,
};

export class LinkTypeQuery {
  @ApiProperty({ example: LinkType.CONFIRM })
  @IsEnum(LinkType)
  type: LinkType;
}

export class GenUserLinkBody {
  @ApiProperty({ example: 'test@email.com' })
  @IsEmail()
  email: string;
}
