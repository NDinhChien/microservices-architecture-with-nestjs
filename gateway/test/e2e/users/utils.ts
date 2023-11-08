import { CoreApiResponse } from '../../../core/CoreApiResponse';
import {
  LinkType,
  Role,
} from '../../../src/controller/dto/user/user.dto.interfaces';
import {
  readPrivateKey,
  readPublicKey,
} from '../../../../token/src/keys/readKey';
import { JwtPayload } from '../../../src/controller/dto/token/token.dto.interfaces';
export { CoreApiResponse, LinkType, JwtPayload, Role };

export class EnvConfig {
  public static mongoUri = process.env.MONGO_URI || '';
  public static UserRule = {
    linkValidIn: Number(process.env.LINK_VALID_IN || '0'),
    maxLoginAttempts: Number(process.env.LOGIN_ATTEMPTS || '0'),
    reloginIn: Number(process.env.RELOGIN_IN || '0'),
    mailSendDuration: Number(process.env.MAILSEND_DURATION || '0'),
    resetPwdIn: Number(process.env.RESET_PWD_IN || '0'),
  };

  public static TokenRule = {
    privateKey: readPrivateKey(),
    publicKey: readPublicKey(),
    accessTokenDuration: Number(process.env.ACCESS_TOKEN_DURATION || '0'),
    refreshTokenDuration: Number(process.env.REFRESH_TOKEN_DURATION || '0'),
  };
}
