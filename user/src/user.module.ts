import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { UserSchema } from './schemas/user.schema';
import { UserLinkSchema } from './schemas/user-link.schema';
import { UserServiceConfig } from './services/service.config';
import { HandleBarService } from './services/handlebar.service';

@Module({
  imports: [
    MongooseModule.forRoot(UserServiceConfig.mongoUri),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
      {
        name: 'UserLink',
        schema: UserLinkSchema,
        collection: 'user_links',
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    HandleBarService,
    {
      provide: 'MAILER_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create(
          UserServiceConfig.mailerService as any,
        );
      },
    },
    {
      provide: 'TOKEN_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create(UserServiceConfig.tokenService as any);
      },
    },
  ],
})
export class UserModule {}
