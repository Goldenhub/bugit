import { HttpException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ErrorCode } from './error-codes';

export class AppException extends HttpException {
  public readonly errorId: string;

  constructor(
    message: string,
    status: number,
    public readonly code: ErrorCode,
  ) {
    super(message, status);
    this.errorId = randomUUID();
  }
}
