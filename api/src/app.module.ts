import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { SentryModule } from '@sentry/nestjs/setup';
import { BugsModule } from './bugs/bugs.module';
import { CommentsModule } from './comments/comments.module';
import { MetaModule } from './meta/meta.module';
import { AuthModule } from './auth/auth.module';
import { ApiTokenGuard } from './auth/api-token.guard';
import { PinoLoggerService } from './pino-logger.service';
import { AppExceptionFilter } from './exceptions/exception.filter';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/bugit',
    ),
    SentryModule.forRoot(),
    AuthModule,
    BugsModule,
    CommentsModule,
    MetaModule,
  ],
  providers: [
    PinoLoggerService,
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
  ],
  exports: [PinoLoggerService],
})
export class AppModule {}
