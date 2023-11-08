import { readPrivateKey, readPublicKey } from '../keys/readKey';

export class TokenServiceConfig {
  public static readonly port: number = Number(
    process.env.TOKEN_SERVICE_PORT || '8002',
  );
  public static readonly mongoUri: string = process.env.MONGO_URI || '';
  public static readonly publicKey: string = readPublicKey();
  public static readonly privateKey: string = readPrivateKey();

  public static readonly Rule = {
    accessTokenDuration: Number(process.env.ACCESS_TOKEN_DURATION || '0'),
    refreshTokenDuration: Number(process.env.REFRESH_TOKEN_DURATION || '0'),
  };
}
