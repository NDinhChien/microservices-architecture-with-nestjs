import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';

export class LogoutUserRes extends HttpApiResponse {
  @ApiProperty({ example: 'logout_success' })
  public message: string;
}
