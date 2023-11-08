import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { IUser } from '../../../../interfaces/schemas.interface';
import { Excluder } from '../../../../../core/Excluder';

export class myProfile {
  public static fromEntity(user: IUser) {
    return Excluder.exe(
      user,
      [
        'password',
        'created_at',
        'updated_at',
        'last_try',
        'login_attempts',
        'last_pwd_reset',
      ],
      { both: true },
    );
  }
}

export class myProfileRes extends HttpApiResponse {
  @ApiProperty({ example: 'profile_get_success' })
  public message: string;

  @ApiProperty({
    example: {
      _id: 'aaabbbcccdddeeefff12345',
      email: 'test@email.com',
      is_confirmed: true,
      role: 'user',
      firstName: 'Dinh',
      lastName: 'Chien',
      intro: 'Hello world.',
    },
  })
  public data: myProfile;
}
