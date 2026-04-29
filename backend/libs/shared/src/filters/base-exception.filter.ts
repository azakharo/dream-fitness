import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { HttpContext } from './interfaces/http-context.interface';

@Catch()
export abstract class BaseExceptionFilter implements ExceptionFilter {
  protected readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = this.extractHttpContext(host);

    this.logError(exception, context);

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, context);
    } else if (this.isAxiosError(exception)) {
      this.handleAxiosError(exception, context);
    } else {
      this.handleUnknownError(exception, context);
    }
  }

  protected extractHttpContext(host: ArgumentsHost): HttpContext {
    const ctx = host.switchToHttp();
    return {
      request: ctx.getRequest(),
      response: ctx.getResponse(),
    };
  }

  protected abstract handleHttpException(
    exception: HttpException,
    context: HttpContext,
  ): void;

  protected handleAxiosError(
    _exception: AxiosError,
    _context: HttpContext,
  ): void {
    // Default implementation - subclasses can override
    this.handleUnknownError(_exception, _context);
  }

  protected abstract handleUnknownError(
    exception: unknown,
    context: HttpContext,
  ): void;

  protected logError(exception: unknown, context: HttpContext): void {
    const requestInfo = `${context.request.method} ${context.request.url}`;

    // Determine log level based on HTTP status code
    let logLevel: 'error' | 'warn' | 'debug' = 'error';
    let message = 'Unknown exception caught';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 400 && status < 500) {
        // Client errors (4xx) are expected business outcomes - log as warning
        logLevel = 'warn';
      } else if (status >= 500) {
        // Server errors (5xx) are actual problems - log as error
        logLevel = 'error';
      } else if (status < 400) {
        // Informational responses (1xx-3xx) - log as debug
        logLevel = 'debug';
      }
    }

    if (exception instanceof Error) {
      message = `Exception caught: ${exception.message} [${requestInfo}]`;
      if (logLevel === 'error') {
        this.logger.error(message, exception.stack);
      } else if (logLevel === 'warn') {
        this.logger.warn(message);
      } else {
        this.logger.debug(message);
      }
    } else {
      message = `Unknown exception caught [${requestInfo}]`;
      if (logLevel === 'error') {
        this.logger.error(message);
      } else if (logLevel === 'warn') {
        this.logger.warn(message);
      } else {
        this.logger.debug(message);
      }
    }
  }

  protected getStatusTitle(status: number): string {
    const titles: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }

  protected isAxiosError(exception: unknown): exception is AxiosError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as AxiosError).isAxiosError === true
    );
  }
}
