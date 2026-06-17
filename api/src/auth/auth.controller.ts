import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

class ApproveCliDto {
  @IsString()
  @MinLength(1)
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('cli/init')
  initCliSession(
    @Headers('origin') origin: string,
    @Headers('referer') referer: string,
  ) {
    const base =
      origin ??
      (referer ? new URL(referer).origin : 'http://localhost:3000');
    return this.authService.initCliSession(base);
  }

  @Public()
  @Get('cli/session/:code')
  pollCliSession(@Param('code') code: string) {
    if (!code) throw new BadRequestException('Missing code');
    return this.authService.pollCliSession(code);
  }

  @Get('me')
  getMe(@CurrentUser() userId: string) {
    return this.authService.getMe(userId);
  }

  // The user's web API token is sent from the Next.js server action
  @Post('cli/approve')
  async approveCliSession(
    @Body() dto: ApproveCliDto,
    @CurrentUser() userId: string,
  ) {
    await this.authService.approveCliSession(dto.code, userId);
    return { ok: true };
  }
}
