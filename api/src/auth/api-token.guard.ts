import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { ApiToken, ApiTokenDocument } from './api-token.schema';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(ApiToken.name) private apiTokenModel: Model<ApiTokenDocument>,
  ) {}

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
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException();

    const raw = header.slice(7);
    const hash = createHash('sha256').update(raw).digest('hex');

    const token = await this.apiTokenModel.findOneAndUpdate(
      { tokenHash: hash },
      { lastUsedAt: new Date() },
    );
    if (!token) throw new UnauthorizedException();

    req.userId = token.userId;
    return true;
  }
}
