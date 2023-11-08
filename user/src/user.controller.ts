import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { UserService } from './services/user.service';
import { CoreApiResponse } from '../../gateway/core/CoreApiResponse';
import { Exception } from '../../gateway/core/Exception';
import { Bcrypt } from './services/bcrypt.helper';
import { HandleBarService } from './services/handlebar.service';
import { IMailPayload } from '../../mailer/src/mailer.dto.interfaces';
import {
  IUserLink,
  IUserId,
  IUserCredentials,
  IUpdateProfilePayload,
  IUpdatePasswordPayload,
  IResetPasswordBody,
  IGenUserLinkPayload,
  ICreateTokenResData,
  IRefreshTokenBody,
  JwtPayload,
} from './user.dto.interfaces';
import { IUser } from './schemas/user.schema';
import { firstValueFrom } from 'rxjs';
import { LinkType } from './schemas/constants';
import { UserServiceConfig } from './services/service.config';
import { Types } from 'mongoose';
import { ITokenString } from '../../token/src/token.dto.interfaces';

@Controller()
export class UserController {
  LINK_VALID_IN = UserServiceConfig.Rule.linkValidIn;
  LOGIN_ATTEMPTS = UserServiceConfig.Rule.maxLoginAttempts;
  RELOGIN_IN = UserServiceConfig.Rule.reloginIn;
  MAILSEND_DURATION = UserServiceConfig.Rule.mailSendDuration;
  RESET_PWD_IN = UserServiceConfig.Rule.resetPwdIn;

  constructor(
    private readonly userService: UserService,
    private readonly handleBarService: HandleBarService,
    @Inject('MAILER_SERVICE') private readonly mailerServiceClient: ClientProxy,
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
  ) {}

  @MessagePattern('check_authentication')
  public async checkAuthentication(
    payload: ITokenString,
  ): Promise<CoreApiResponse<IUser | null>> {
    const res: CoreApiResponse<JwtPayload> = await firstValueFrom(
      this.tokenServiceClient.send('validate_access_token', payload),
    );

    return CoreApiResponse.new(
      HttpStatus.OK,
      'auth_check_oke',
      await this.userService.getUserById(new Types.ObjectId(res.data.sub)),
    );
  }

  public async destroyToken(userId: Types.ObjectId) {
    const destroyTokenPayload: IUserId = {
      userId,
    };
    await firstValueFrom(
      this.tokenServiceClient.send('destroy_token', destroyTokenPayload),
    );
  }

  @MessagePattern('login_user')
  public async loginUser(
    payload: IUserCredentials,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    const user = await this.userService.getUserByEmail(payload.email);
    if (!user) {
      throw Exception.new(HttpStatus.NOT_FOUND, 'user_login_not_found', {
        cause: 'User does not exist.',
      });
    }

    if (
      user.last_try &&
      user.last_try.getTime() + this.RELOGIN_IN < Date.now()
    ) {
      user.login_attempts = 0;
    }

    if (user.login_attempts >= this.LOGIN_ATTEMPTS) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'user_login_forbidden', {
        try_again_after: new Date(
          user.last_try!.getTime() + this.RELOGIN_IN,
        ).toLocaleString(), //!
      });
    }

    if (await Bcrypt.compare(payload.password, user.password)) {
      await this.userService.updateUser(user._id, {
        login_attempts: 0,
        last_try: new Date(),
      });

      const createTokenPayload: IUserId = {
        userId: user._id,
      };
      const createTokenRes: CoreApiResponse<ICreateTokenResData> =
        await firstValueFrom(
          this.tokenServiceClient.send('create_token', createTokenPayload),
        );

      return CoreApiResponse.new(
        HttpStatus.OK,
        'user_login_success',
        createTokenRes.data,
      );
    } else {
      await this.userService.updateUser(user._id, {
        login_attempts: user.login_attempts + 1,
        last_try: new Date(),
      });
      throw Exception.new(HttpStatus.BAD_REQUEST, 'user_login_wrong_password', {
        try_times_left: this.LOGIN_ATTEMPTS - (user.login_attempts + 1),
      });
    }
  }

  @MessagePattern('logout_user')
  public async logoutUser(payload: IUserId): Promise<CoreApiResponse<null>> {
    await this.destroyToken(payload.userId);

    await this.userService.updateUser(payload.userId, {
      login_attempts: 0,
      last_try: new Date(),
    });

    return CoreApiResponse.new(HttpStatus.OK, 'user_logout_success', null);
  }

  @MessagePattern('refresh_token')
  public async refreshToken(
    payload: IRefreshTokenBody,
  ): Promise<CoreApiResponse<ICreateTokenResData>> {
    const res: CoreApiResponse<ICreateTokenResData> = await firstValueFrom(
      this.tokenServiceClient.send('refresh_token', payload),
    );

    await this.userService.updateUser(res.data._id, {
      login_attempts: 0,
      last_try: new Date(),
    });

    return res;
  }

  @MessagePattern('reset_password')
  public async resetPassword(
    payload: IResetPasswordBody,
  ): Promise<CoreApiResponse<null>> {
    const user = await this.userService.getUserByEmail(payload.email);
    if (!user) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'password_reset_user_not_found',
        null,
      );
    }
    const userLink = await this.userService.getUserLinkByUserId(
      user._id,
      LinkType.RESETPW,
    );

    if (!userLink) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'password_reset_link_not_found',
        null,
      );
    }
    if (
      userLink.is_used &&
      userLink.updated_at.getTime() + this.RESET_PWD_IN > Date.now()
    ) {
      await this.userService.updateUser(user._id, {
        login_attempts: 0,
        last_try: new Date(),
        last_pwd_reset: new Date(),
        password: await Bcrypt.hash(payload.new_pwd),
      });

      await this.destroyToken(user._id);

      await this.userService.deleteLinkForUser(
        userLink.user_id,
        LinkType.RESETPW,
      );

      return CoreApiResponse.new(HttpStatus.OK, 'password_reset_success', null);
    }
    throw Exception.new(HttpStatus.FORBIDDEN, 'password_reset_forbidden', {
      cause: `Your reset password link is not confirmed or no longer valid`,
    });
  }

  @MessagePattern('update_password')
  public async updatePassword(
    payload: IUpdatePasswordPayload,
  ): Promise<CoreApiResponse<null>> {
    if (!(await Bcrypt.compare(payload.old_pwd, payload.hashed_pwd))) {
      throw Exception.new(
        HttpStatus.UNAUTHORIZED,
        'password_update_unauthorized',
        null,
      );
    }

    await this.userService.updateUser(payload.userId, {
      login_attempts: 0,
      last_try: new Date(),
      password: await Bcrypt.hash(payload.new_pwd),
    });

    await this.destroyToken(payload.userId);

    return CoreApiResponse.new(HttpStatus.OK, 'password_update_success', null);
  }

  @MessagePattern('delete_user')
  public async deleteUser(payload: IUserId): Promise<CoreApiResponse<null>> {
    if (!(await this.userService.deleteUser(payload.userId))) {
      throw Exception.new(HttpStatus.NOT_FOUND, 'user_delete_not_found', {
        cause: 'User does not exist or User is an admin',
      });
    }

    await this.destroyToken(payload.userId);

    return CoreApiResponse.new(HttpStatus.OK, 'user_delete_success', null);
  }

  @MessagePattern('get_user')
  public async getUser(payload: IUserId): Promise<CoreApiResponse<IUser>> {
    const user = await this.userService.getUserById(payload.userId);
    if (user) {
      return CoreApiResponse.new(HttpStatus.OK, 'user_get_success', user);
    }
    throw Exception.new(HttpStatus.NOT_FOUND, 'user_get_not_found', null);
  }

  @MessagePattern('create_user')
  public async createUser(
    payload: IUserCredentials,
  ): Promise<CoreApiResponse<IUser>> {
    const usersWithEmail = await this.userService.getUserByEmail(payload.email);

    if (usersWithEmail) {
      throw Exception.new(HttpStatus.CONFLICT, 'user_create_conflict', {
        email: {
          message: 'Email already exists',
          path: 'email',
        },
      });
    }

    const createdUser = await this.userService.createUser(
      payload.email,
      await Bcrypt.hash(payload.password),
    );

    this.sendLink({
      type: LinkType.CONFIRM,
      userId: createdUser._id,
      email: createdUser.email,
      name: createdUser.firstName,
    });

    return CoreApiResponse.new(
      HttpStatus.CREATED,
      'user_create_success',
      createdUser,
    );
  }

  @MessagePattern('generate_link')
  public async generateUserLink(
    payload: IGenUserLinkPayload,
  ): Promise<CoreApiResponse<any>> {
    const user = await this.userService.getUserByEmail(payload.email);
    if (!user) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'link_generate_user_not_found',
        null,
      );
    }

    if (payload.type === LinkType.CONFIRM && user.is_confirmed) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'link_generate_forbidden', {
        cause: 'User is confirmed already.',
      });
    } else if (
      payload.type === LinkType.RESETPW &&
      user.last_pwd_reset &&
      user.last_pwd_reset.getTime() + this.MAILSEND_DURATION > Date.now()
    ) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'link_generate_forbidden', {
        try_again_after: new Date(
          user.last_pwd_reset.getTime() + this.MAILSEND_DURATION,
        ).toLocaleString(),
        cause: `You have just reset password for a short time ago ( ${user.last_pwd_reset.toLocaleString()} )`,
      });
    }

    const userLink = await this.userService.getUserLinkByUserId(
      user._id,
      payload.type,
    );

    if (
      userLink &&
      userLink.updated_at.getTime() + this.MAILSEND_DURATION > Date.now()
    ) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'link_generate_forbidden', {
        try_again_after: new Date(
          userLink.updated_at.getTime() + this.MAILSEND_DURATION,
        ).toLocaleString(),
      });
    }

    // create and send link
    this.sendLink({
      userId: user._id,
      name: user.firstName,
      email: user.email,
      type: payload.type,
    });

    return CoreApiResponse.new(HttpStatus.OK, 'link_generate_success', {
      link_expired_at: new Date(
        Date.now() + this.LINK_VALID_IN,
      ).toLocaleString(),
    });
  }

  public async sendLink(payload: {
    userId: Types.ObjectId;
    type: LinkType;
    name?: string;
    email: string;
  }): Promise<void> {
    // create or update
    const { link } = await this.userService.createUserLink(
      payload.userId,
      payload.type,
    );

    let url: string;
    let html: string;
    let subject: string;
    if (payload.type === LinkType.CONFIRM) {
      subject = 'Welcome user! Confirm your email.';
      url = this.userService.getUrl(`/users/link/confirm?link=${link}`);
      html = this.handleBarService.genConfirmationHtml(
        payload.name || 'new user',
        url,
      );
    } else {
      subject = 'Password reset.';
      url = this.userService.getUrl(`/users/link/confirm?link=${link}`);
      html = this.handleBarService.genPasswordResetHtml(
        payload.name || 'new user',
        url,
      );
    }
    const mailPayload: IMailPayload = {
      to: payload.email,
      subject,
      html,
    };

    await firstValueFrom(
      this.mailerServiceClient.send('send_mail', mailPayload),
    );
  }

  @MessagePattern('confirm_link')
  public async confirmUserLink(
    payload: IUserLink,
  ): Promise<CoreApiResponse<any>> {
    const userLink = await this.userService.getUserLink(payload.link);
    if (!userLink) {
      throw Exception.new(HttpStatus.NOT_FOUND, 'link_confirm_not_found', null);
    }

    if (userLink.created_at.getTime() + this.LINK_VALID_IN <= Date.now()) {
      throw Exception.new(HttpStatus.FORBIDDEN, 'link_confirm_expired', {
        issued_at: userLink.created_at.toLocaleString(),
        expired_at: new Date(
          userLink.updated_at.getTime() + this.LINK_VALID_IN,
        ).toLocaleString(),
      });
    }
    const userId = userLink.user_id;
    if (userLink.type === LinkType.CONFIRM) {
      await this.userService.updateUser(userId, {
        is_confirmed: true,
      });

      await this.userService.deleteLinkForUser(userId, LinkType.CONFIRM);

      return CoreApiResponse.new(HttpStatus.OK, 'link_confirm_success', {
        congrats: 'User is confirmed successfully.',
      });
    } else {
      if (userLink.is_used) {
        throw Exception.new(HttpStatus.FORBIDDEN, 'link_confirm_forbidden', {
          cause: `This link has just been confirmed ( ${userLink.updated_at.toLocaleString()} )`,
        });
      }
      await this.userService.updateUserLink(userLink._id, {
        is_used: true,
      });

      return CoreApiResponse.new(HttpStatus.OK, 'link_confirm_success', {
        redirect: this.userService.getUrl(`/password/reset`),
        is_valid_before: new Date(
          Date.now() + this.RESET_PWD_IN,
        ).toLocaleString(),
      });
    }
  }

  @MessagePattern('update_profile')
  public async updateProfile(
    payload: IUpdateProfilePayload,
  ): Promise<CoreApiResponse<IUser | null>> {
    const { userId, ...body } = payload;
    const updatedUser = await this.userService.updateUser(userId, body);
    if (!updatedUser) {
      throw Exception.new(
        HttpStatus.NOT_FOUND,
        'profile_update_not_found',
        null,
      );
    }
    return CoreApiResponse.new(
      HttpStatus.OK,
      'profile_update_success',
      updatedUser,
    );
  }
}
