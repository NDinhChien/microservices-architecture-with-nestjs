import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';

export interface ISignUpUserResData {
  user: {
    _id: string;
    email: string;
    is_confirmed: boolean;
  };
  direction: string;
}

export class SignUpUserRes extends HttpApiResponse {
  @ApiProperty({ example: 'user_signup_success' })
  public message: string;

  @ApiProperty({
    example: {
      user: {
        _id: 'dsfs21399021k2193i231231',
        email: 'test@email.com',
        is_confirmed: false,
      },
      direction: 'check your email to confirm account',
    },
  })
  public data: ISignUpUserResData;
}
