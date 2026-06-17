import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes, createHash } from 'crypto';
import { ApiToken, ApiTokenDocument } from './api-token.schema';
import { CliSession, CliSessionDocument } from './cli-session.schema';
import { NextAuthUser, NextAuthUserDocument } from './nextauth-user.schema';

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(ApiToken.name) private apiTokenModel: Model<ApiTokenDocument>,
    @InjectModel(CliSession.name) private cliSessionModel: Model<CliSessionDocument>,
    @InjectModel(NextAuthUser.name) private userModel: Model<NextAuthUserDocument>,
  ) {}

  async createApiToken(userId: string, name: string): Promise<string> {
    // Delete existing tokens with this name for this user so only one exists
    await this.apiTokenModel.deleteMany({ userId, name });
    const raw = generateToken();
    await this.apiTokenModel.create({ userId, tokenHash: sha256(raw), name });
    return raw;
  }

  async initCliSession(baseUrl: string): Promise<{ code: string; url: string }> {
    const code = generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await this.cliSessionModel.create({ codeHash: sha256(code), expiresAt });
    return { code, url: `${baseUrl}/auth/cli?code=${code}` };
  }

  async pollCliSession(
    code: string,
  ): Promise<{ status: string; token?: string }> {
    const session = await this.cliSessionModel.findOne({
      codeHash: sha256(code),
    });
    if (!session) throw new NotFoundException('Session not found or expired');

    if (session.status === 'pending') return { status: 'pending' };

    // Approved — return token and delete the session (single-use)
    const token = session.apiToken;
    await session.deleteOne();
    return { status: 'approved', token };
  }

  async getMe(userId: string): Promise<{ email: string }> {
    const user = await this.userModel.findById(userId).select('email').lean();
    if (!user) throw new NotFoundException('User not found');
    return { email: user.email };
  }

  async approveCliSession(code: string, userId: string): Promise<void> {
    const session = await this.cliSessionModel.findOne({
      codeHash: sha256(code),
      status: 'pending',
    });
    if (!session) throw new GoneException('Session not found or already used');

    const raw = await this.createApiToken(userId, 'cli');
    session.status = 'approved';
    session.userId = userId;
    session.apiToken = raw;
    await session.save();
  }
}
