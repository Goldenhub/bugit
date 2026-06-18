import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { randomUUID } from 'crypto';
import { PinoLoggerService } from '../pino-logger.service';
import { AppException } from './app-exception';
import { ErrorCodes, type ErrorCode } from './error-codes';

function isHttpException(exception: unknown): exception is HttpException {
  return exception instanceof HttpException;
}

function statusFromException(exception: unknown): number {
  if (isHttpException(exception)) return exception.getStatus();
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function messageFromException(exception: unknown): string {
  if (isHttpException(exception)) {
    const res = exception.getResponse();
    if (typeof res === 'string') return res;
    if (typeof res === 'object' && res !== null) {
      if ('message' in res) {
        const msg = (res as { message: unknown }).message;
        return Array.isArray(msg) ? msg[0] : String(msg);
      }
    }
  }
  return exception instanceof Error ? exception.message : 'Internal server error';
}

function mapToErrorCode(exception: unknown): ErrorCode {
  if (exception instanceof AppException) return exception.code;

  if (isHttpException(exception)) {
    switch (exception.getStatus()) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.AUTH_TOKEN_INVALID;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.BUG_NOT_FOUND;
      case HttpStatus.GONE:
        return ErrorCodes.AUTH_SESSION_EXPIRED;
    }
  }

  return ErrorCodes.INTERNAL_ERROR;
}

interface ErrorResponse {
  errorId: string;
  code: ErrorCode;
  message: string;
  statusCode: number;
}

@Catch()
export class AppExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {
    super();
    this.logger.setContext(AppExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();

    const status = statusFromException(exception);
    const message = messageFromException(exception);
    const code = mapToErrorCode(exception);
    const errorId = exception instanceof AppException ? exception.errorId : randomUUID();

    const body: ErrorResponse = { errorId, code, message, statusCode: status };

    Sentry.withScope(scope => {
      scope.setExtra('errorId', errorId);
      scope.setExtra('code', code);
      scope.setTag('errorCode', code);
      if (exception instanceof Error) {
        Sentry.captureException(exception);
      }
    });

    this.logger.error({
      errorId,
      code,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(body);
  }
}
