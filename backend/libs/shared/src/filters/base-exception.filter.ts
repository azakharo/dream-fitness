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
    if (exception instanceof Error) {
      this.logger.error(
        `Exception caught: ${exception.message} [${requestInfo}]`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown exception caught [${requestInfo}]`);
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
