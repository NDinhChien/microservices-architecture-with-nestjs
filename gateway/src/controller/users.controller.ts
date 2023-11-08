import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Req,
  Inject,
  HttpStatus,
  Param,
  Request,
  Query,
  Delete,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  IGenUserLinkPayload,
  IUpdatePasswordPayload,
  IUpdateProfilePayload,
  IUserLink,
  Role,
} from './dto/user/user.dto.interfaces';
import { CoreApiResponse } from '../../core/CoreApiResponse';
import { UserCredentials, LoginUserRes } from './dto/user/auth/login-user.dto';
import { IUser } from '../interfaces/schemas.interface';
import { IUserId, ICreateTokenResData } from './dto/token/token.dto.interfaces';
import {
  ISignUpUserResData,
  SignUpUserRes,
} from './dto/user/account/signup-user.dto';
import { myProfile, myProfileRes } from './dto/user/profile/my-profile.dto';
import { IAuthorizedRequest } from '../interfaces/authorized-request.interface';
import { Auth } from '../decorators/auth.decorator';
import { LogoutUserRes } from './dto/user/auth/logout-user.dto';
import {
  UserId,
  UserIdParam,
  getPublicProfileRes,
  publicProfile,
} from './dto/user/profile/get-public-profile.dto';
import { Types } from 'mongoose';
import {
  GenUserLinkBody,
  GenUserLinkQuery,
  GenUserLinkRes,
  LinkTypeQuery,
} from './dto/user/link/gen-link.dto';
import {
  ConfirmLinkRes,
  UserLink,
  UserLinkQuery,
} from './dto/user/link/confirm-link.dto';
import {
  RefreshTokenBody,
  RefreshTokenRes,
} from './dto/user/auth/refresh-token.dto';
import {
  ResetPasswordRes,
  ResetPasswordBody,
} from './dto/user/password/reset-password.dto';
import {
  UpdatePasswordBody,
  UpdatePasswordRes,
} from './dto/user/password/update-password.dto';
import {
  UpdateProfileBody,
  UpdateProfileRes,
} from './dto/user/profile/update-profile.dto';
import { Exception } from '../../core/Exception';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post('link')
  @ApiQuery(GenUserLinkQuery)
  @ApiBody({ type: GenUserLinkBody })
  @ApiResponse({
    type: GenUserLinkRes,
  })
  public async generateUserLink(
    @Query() query: LinkTypeQuery,
    @Body() body: GenUserLinkBody,
  ): Promise<CoreApiResponse<null>> {
    const payload: IGenUserLinkPayload = {
      type: query.type,
      email: body.email,
    };
    return await firstValueFrom(
      this.userServiceClient.send('generate_link', payload),
    );
  }

  @Get('link/confirm')
  @ApiQuery(UserLinkQuery)
  @ApiResponse({
    type: ConfirmLinkRes,
  })
  public async confirmUserLink(
    @Query() query: UserLink,
  ): Promise<CoreApiResponse<null>> {
    const payload: IUserLink = {
      link: query.link,
    };
    return await firstValueFrom(
      this.userServiceClient.send('confirm_link', payload),
    );
  }

  @Post('password/reset')
  @ApiBody({ type: ResetPasswordBody })
  @ApiResponse({ type: ResetPasswordRes })
  public async resetPassword(
    @Body() body: ResetPasswordBody,
  ): Promise<CoreApiResponse<null>> {
    return await firstValueFrom(
      this.userServiceClient.send('reset_password', body),
    );
  }

  @Put('password')
  @Auth()
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePasswordBody })
  @ApiResponse({ type: UpdatePasswordRes })
  public async updatePassword(
    @Request() request: IAuthorizedRequest,
    @Body() body: UpdatePasswordBody,
  ): Promise<CoreApiResponse<null>> {
    const payload: IUpdatePasswordPayload = {
      userId: request.user._id,
      hashed_pwd: request.user.password,
      ...body,
    };

    return await firstValueFrom(
      this.userServiceClient.send('update_password', payload),
    );
  }

  @Put('logout')
  @Auth()
  @ApiBearerAuth()
  @ApiResponse({
    type: LogoutUserRes,
  })
  public async logoutUser(
    @Req() request: IAuthorizedRequest,
  ): Promise<CoreApiResponse<null>> {
    const payload: IUserId = {
      userId: request.user._id,
    };

    return await firstValueFrom(
      this.userServiceClient.send('logout_user', payload),
    );
  }

  @Post('login')
  @ApiBody({
    type: UserCredentials,
  })
  @ApiResponse({
    type: LoginUserRes,
  })
  public async loginUser(
    @Body() body: UserCredentials,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    return await firstValueFrom(
      this.userServiceClient.send('login_user', body),
    );
  }

  @Post('token/refresh')
  @ApiBody({ type: RefreshTokenBody })
  @ApiResponse({ type: RefreshTokenRes })
  public async refreshToken(
    @Body() body: RefreshTokenBody,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    return await firstValueFrom(
      this.userServiceClient.send('refresh_token', body),
    );
  }

  @Post('account/signup')
  @ApiResponse({
    type: SignUpUserRes,
  })
  @ApiBody({
    type: UserCredentials,
  })
  public async signUp(
    @Body() body: UserCredentials,
  ): Promise<CoreApiResponse<ISignUpUserResData>> {
    const payload: UserCredentials = {
      email: body.email,
      password: body.password,
    };

    const createUserResponse: CoreApiResponse<IUser> = await firstValueFrom(
      this.userServiceClient.send('create_user', payload),
    );
    const createUserResData = createUserResponse.data;

    const data: ISignUpUserResData = {
      user: {
        _id: createUserResData._id.toString(),
        email: createUserResData.email,
        is_confirmed: createUserResData.is_confirmed,
      },
      direction: 'check your email to confirm account',
    };
    return CoreApiResponse.new(HttpStatus.OK, 'signup_success', data);
  }

  @Delete('account/:id')
  @Auth(Role.ADMIN)
  @ApiParam(UserIdParam)
  @ApiBearerAuth()
  public async deleteUser(
    @Request() request: IAuthorizedRequest,
    @Param() params: UserId,
  ): Promise<CoreApiResponse<any>> {
    if (request.user._id.toString() === params.id) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'user_delete_bad_request', {
        cause: 'You could not delete yourself',
      });
    }
    const payload: IUserId = {
      userId: new Types.ObjectId(params.id),
    };
    return await firstValueFrom(
      this.userServiceClient.send('delete_user', payload),
    );
  }

  @Get('profile/me')
  @Auth()
  @ApiBearerAuth()
  @ApiResponse({
    type: myProfileRes,
  })
  public async getProfile(
    @Req() request: IAuthorizedRequest,
  ): Promise<CoreApiResponse<any>> {
    const userInfo = request.user;

    return CoreApiResponse.new(
      HttpStatus.OK,
      'get_profile_success',
      myProfile.fromEntity(userInfo),
    );
  }

  @Get('profile/:id')
  @ApiParam(UserIdParam)
  @ApiResponse({
    type: getPublicProfileRes,
  })
  public async getPublicProfile(
    @Param() params: UserId,
  ): Promise<CoreApiResponse<any>> {
    const payload: IUserId = {
      userId: new Types.ObjectId(params.id),
    };

    const getUserRes: CoreApiResponse<IUser> = await firstValueFrom(
      this.userServiceClient.send('get_user', payload),
    );
    return CoreApiResponse.new(
      HttpStatus.OK,
      'profile_get_success',
      publicProfile.fromEntity(getUserRes.data),
    );
  }

  @Put('profile')
  @Auth()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileBody })
  @ApiResponse({ type: UpdateProfileRes })
  public async updateProfile(
    @Request() request: IAuthorizedRequest,
    @Body() body: UpdateProfileBody,
  ): Promise<CoreApiResponse<any>> {
    const payload: IUpdateProfilePayload = {
      ...body,
      userId: request.user._id,
    };

    return await firstValueFrom(
      this.userServiceClient.send('update_profile', payload),
    );
  }
}
