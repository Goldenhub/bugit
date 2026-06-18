import { Injectable, LoggerService, Scope } from '@nestjs/common';
import pino from 'pino';
import { createLogger } from './logger';

@Injectable({ scope: Scope.DEFAULT })
export class PinoLoggerService implements LoggerService {
  protected context?: string;
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = createLogger();
  }

  setContext(context: string) {
    this.context = context;
  }

  private write(
    level: pino.Level,
    message: any,
    trace?: string,
    context?: string,
  ) {
    const bindings: Record<string, unknown> = { context: context ?? this.context };

    if (typeof message === 'object' && message !== null) {
      Object.assign(bindings, message);
      this.logger[level](bindings);
    } else {
      bindings.trace = trace;
      this.logger[level](bindings, message);
    }
  }

  log(message: any, context?: string) {
    this.write('info', message, undefined, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.write('error', message, trace, context);
  }

  warn(message: any, context?: string) {
    this.write('warn', message, undefined, context);
  }

  debug(message: any, context?: string) {
    this.write('debug', message, undefined, context);
  }

  verbose(message: any, context?: string) {
    this.write('trace', message, undefined, context);
  }
}
