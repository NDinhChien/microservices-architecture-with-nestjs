import { IsMongoId } from 'class-validator';
import { IUser } from '../../../../interfaces/schemas.interface';
import { HttpApiResponse } from '../../../../../core/CoreApiResponse';
import { ApiProperty } from '@nestjs/swagger';

export const UserIdParam = {
  name: 'id',
  type: 'String',
  example: 'aaabbbcccdddeeefff',
  required: true,
};

export class UserId {
  @IsMongoId()
  id: string;
}

export class publicProfile {
  static fromEntity(user: IUser): any {
    return {
      _id: user._id,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      intro: user.intro || null,
    };
  }
}

export class getPublicProfileRes extends HttpApiResponse {
  @ApiProperty({ example: 'profile_get_success' })
  public message: string;

  @ApiProperty({
    example: {
      _id: 'aaabbbcccdddeeefff',
      firstName: null,
      lastName: null,
      intro: null,
    },
  })
  public data: any;
}
