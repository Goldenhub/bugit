import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { BugsModule } from './bugs/bugs.module';
import { CommentsModule } from './comments/comments.module';
import { MetaModule } from './meta/meta.module';
import { AuthModule } from './auth/auth.module';
import { ApiTokenGuard } from './auth/api-token.guard';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/bugit',
    ),
    AuthModule,
    BugsModule,
    CommentsModule,
    MetaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
  ],
})
export class AppModule {}
