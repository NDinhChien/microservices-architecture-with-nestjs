import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ITokenString } from '../controller/dto/token/token.dto.interfaces';
import { CoreApiResponse } from '../../core/CoreApiResponse';
import { IUser } from '../interfaces/schemas.interface';
import { Exception } from '../../core/Exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload: ITokenString = {
      token: request.headers.authorization,
    };

    const res: CoreApiResponse<IUser> = await firstValueFrom(
      this.userServiceClient.send('check_authentication', payload),
    );
    if (!res.data.is_confirmed) {
      throw Exception.new(HttpStatus.UNAUTHORIZED, 'unconfirmed_user', {
        direction: 'Please confirm your account first',
      });
    }
    request.user = res.data;
    return true;
  }
}
