import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenController } from './token.controller';
import { TokenService } from './services/token.service';
import { TokenServiceConfig } from './services/service.config';
import { TokenSchema } from './schemas/token.schema';

@Module({
  imports: [
    JwtModule.register({
      privateKey: TokenServiceConfig.privateKey,
      publicKey: TokenServiceConfig.publicKey,
      signOptions: {
        algorithm: 'RS256',
      },
      verifyOptions: { ignoreExpiration: false },
    }),
    MongooseModule.forRoot(TokenServiceConfig.mongoUri),
    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
        collection: 'tokens',
      },
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
