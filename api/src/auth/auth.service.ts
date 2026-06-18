import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { randomBytes, createHash } from "crypto";
import { ApiToken, ApiTokenDocument } from "./api-token.schema";
import { CliSession, CliSessionDocument } from "./cli-session.schema";
import { NextAuthUser, NextAuthUserDocument } from "./nextauth-user.schema";
import { PinoLoggerService } from "../pino-logger.service";
import { AppException } from "../exceptions/app-exception";
import { ErrorCodes } from "../exceptions/error-codes";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function generateToken() {
  return randomBytes(32).toString("hex");
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(ApiToken.name) private apiTokenModel: Model<ApiTokenDocument>,
    @InjectModel(CliSession.name) private cliSessionModel: Model<CliSessionDocument>,
    @InjectModel(NextAuthUser.name) private userModel: Model<NextAuthUserDocument>,
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async createApiToken(userId: string, name: string): Promise<string> {
    await this.apiTokenModel.deleteMany({ userId, name });
    const raw = generateToken();
    await this.apiTokenModel.create({ userId, tokenHash: sha256(raw), name });
    this.logger.log(`API token created for user=${userId} name=${name}`);
    return raw;
  }

  async initCliSession(baseUrl: string): Promise<{ code: string; url: string }> {
    const code = generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.cliSessionModel.create({ codeHash: sha256(code), expiresAt });
    this.logger.log(`CLI session initiated, expires at ${expiresAt.toISOString()}`);
    return { code, url: `${baseUrl}/auth/cli?code=${code}` };
  }

  async pollCliSession(code: string): Promise<{ status: string; token?: string }> {
    const session = await this.cliSessionModel.findOne({
      codeHash: sha256(code),
    });
    if (!session) {
      this.logger.warn("CLI session poll failed — not found or expired");
      throw new AppException("Session not found or expired", HttpStatus.NOT_FOUND, ErrorCodes.AUTH_SESSION_NOT_FOUND);
    }

    if (session.status === "pending") {
      this.logger.debug("CLI session still pending");
      return { status: "pending" };
    }

    const token = session.apiToken;
    await session.deleteOne();
    this.logger.log("CLI session approved, token consumed");
    return { status: "approved", token };
  }

  async getMe(userId: string): Promise<{ email: string }> {
    const user = await this.userModel.findById(userId).select("email").lean();
    if (!user) throw new AppException("User not found", HttpStatus.NOT_FOUND, ErrorCodes.AUTH_USER_NOT_FOUND);
    return { email: user.email };
  }

  async approveCliSession(code: string, userId: string): Promise<void> {
    const session = await this.cliSessionModel.findOne({
      codeHash: sha256(code),
      status: "pending",
    });
    if (!session) {
      this.logger.warn(`CLI session approval failed for user=${userId} — session gone`);
      throw new AppException("Session not found or already used", HttpStatus.GONE, ErrorCodes.AUTH_SESSION_EXPIRED);
    }

    const raw = await this.createApiToken(userId, "cli");
    session.status = "approved";
    session.userId = userId;
    session.apiToken = raw;
    await session.save();
    this.logger.log(`CLI session approved for user=${userId}`);
  }
}
