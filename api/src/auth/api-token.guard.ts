import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { ApiToken, ApiTokenDocument } from './api-token.schema';
import { IS_PUBLIC_KEY } from './public.decorator';
import { PinoLoggerService } from '../pino-logger.service';
import { AppException } from '../exceptions/app-exception';
import { ErrorCodes } from '../exceptions/error-codes';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(ApiToken.name) private apiTokenModel: Model<ApiTokenDocument>,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext(ApiTokenGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      userId: string;
    }>();

    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      this.logger.warn('Missing or malformed Authorization header');
      throw new AppException('Missing or invalid authorization header', HttpStatus.UNAUTHORIZED, ErrorCodes.AUTH_TOKEN_MISSING);
    }

    const raw = header.slice(7);
    const hash = createHash('sha256').update(raw).digest('hex');

    const token = await this.apiTokenModel.findOneAndUpdate(
      { tokenHash: hash },
      { lastUsedAt: new Date() },
    );
    if (!token) {
      this.logger.warn('Invalid API token presented');
      throw new AppException('Invalid API token', HttpStatus.UNAUTHORIZED, ErrorCodes.AUTH_TOKEN_INVALID);
    }

    req.userId = token.userId;
    return true;
  }
}
