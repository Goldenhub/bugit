import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiToken, ApiTokenSchema } from './api-token.schema';
import { CliSession, CliSessionSchema } from './cli-session.schema';
import { NextAuthUser, NextAuthUserSchema } from './nextauth-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiToken.name, schema: ApiTokenSchema },
      { name: CliSession.name, schema: CliSessionSchema },
      { name: NextAuthUser.name, schema: NextAuthUserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [MongooseModule],
})
export class AuthModule {}
